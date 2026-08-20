/**
 * Donation indexer.
 *
 * Reads `Donated` events from every deployed DonationVault and upserts them into
 * Supabase, so the donor wall and campaign totals are one fast query instead of a
 * fan-out of RPC calls per page load.
 *
 * Design constraints (see ethskills:indexing):
 *   - NEVER scan from genesis. Each (chain, contract) pair keeps a cursor in
 *     `indexer_cursors`, seeded from the vault's deployment block.
 *   - Block ranges are chunked. Most public RPCs cap `eth_getLogs` at ~10k blocks
 *     and will simply fail on a wider window.
 *   - Upserts are keyed on (chain_id, tx_hash, log_index), so re-running over an
 *     already-indexed range is a no-op rather than a duplicate.
 *   - The chain stays authoritative. This table is a cache; `totalRaised()` on the
 *     contract is the number that settles any disagreement.
 *
 * Auth: requires `INDEXER_SECRET` as a bearer token, so only the cron job (or an
 * operator) can trigger a sync.
 *
 * Scale path: if a campaign ever outgrows this, move to a subgraph. The schema is
 * deliberately shaped like one.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicClient, http, parseAbiItem, type Log, type PublicClient } from 'viem';
import { getSupabaseAdmin } from '../../../lib/supabase';
import {
  CHAIN_IDS,
  getRpcUrl,
  NATIVE_SYMBOLS,
  NATIVE_TOKEN_SENTINEL,
  type ChainId,
} from '../../../config/constants';
import addresses from '../../../frontend/addresses.json';
import { logger } from '../../../utils/logger';

/**
 * eth_getLogs window. Celo's public RPC (forno) hard-caps this at 5000 blocks
 * and returns -32602 for anything wider — verified against forno.celo.org, not
 * assumed. The range is inclusive, so 4000 leaves margin under every provider
 * cap we deploy against.
 */
const BLOCK_CHUNK = 4_000n;

/**
 * Safety bound so one invocation cannot run forever on a cold start.
 * 40 × 4000 = 160k blocks per run. Celo produces ~86k blocks/day, so an hourly
 * cron stays a single chunk behind and a cold start catches up in a few runs.
 */
const MAX_CHUNKS_PER_RUN = 40;

const DONATED_EVENT = parseAbiItem(
  'event Donated(uint256 indexed campaignId, address indexed donor, address indexed token, uint256 amount, string message)'
);

const ERC20_SYMBOL = parseAbiItem('function symbol() view returns (string)');
const ERC20_DECIMALS = parseAbiItem('function decimals() view returns (uint8)');

type NetworkKey = keyof typeof addresses;

const NETWORK_TO_CHAIN_ID: Record<string, ChainId> = {
  base: CHAIN_IDS.BASE,
  ethereum: CHAIN_IDS.ETHEREUM,
  optimism: CHAIN_IDS.OPTIMISM,
  unichain: CHAIN_IDS.UNICHAIN,
  celo: CHAIN_IDS.CELO,
};

interface ChainSyncResult {
  network: string;
  chainId: number;
  vault: string | null;
  fromBlock?: string;
  toBlock?: string;
  indexed: number;
  skipped?: string;
  error?: string;
}

/**
 * Resolve each network's DonationVault from the generated addresses file.
 * Networks without a deployed vault are skipped rather than erroring — the
 * relief campaign may go live on some chains before others.
 */
function getDeployedVaults(): Array<{ network: string; chainId: ChainId; vault: string }> {
  const out: Array<{ network: string; chainId: ChainId; vault: string }> = [];

  for (const [network, chainId] of Object.entries(NETWORK_TO_CHAIN_ID)) {
    const entry = (addresses as Record<string, { addresses?: Record<string, string> }>)[
      network as NetworkKey
    ];
    const vault = entry?.addresses?.DonationVault;
    if (vault) {
      out.push({ network, chainId, vault: vault.toLowerCase() });
    }
  }

  return out;
}

/** Deployment block for a chain's vault — the cursor's starting point. */
function getStartBlock(chainId: number): bigint {
  const raw = process.env[`INDEXER_START_BLOCK_${chainId}`];
  return raw ? BigInt(raw) : 0n;
}

/**
 * Make sure every token in a batch exists in `tokens` before donations
 * referencing it are inserted.
 *
 * `decimals` is what the whole UI formats with, so it is read from the token
 * contract rather than assumed — a hardcoded 18 would overstate a 6-decimal
 * USDC donation by 10^12. The native sentinel has no contract to read: its
 * symbol comes from the chain's own parameters.
 *
 * Returns an error string if a token could not be verified; the caller stops
 * rather than writing a row whose amounts would render wrong.
 */
async function ensureTokensRegistered(
  supabase: SupabaseClient,
  client: PublicClient,
  chainId: ChainId,
  tokenAddresses: string[]
): Promise<string | null> {
  const unique = [...new Set(tokenAddresses)];

  const { data: known, error: readError } = await supabase
    .from('tokens')
    .select('address')
    .eq('chain_id', chainId)
    .in('address', unique);

  if (readError) return `token read: ${readError.message}`;

  const registered = new Set((known ?? []).map((t: { address: string }) => t.address));
  const missing = unique.filter((a) => !registered.has(a));
  if (missing.length === 0) return null;

  const rows: Array<{
    chain_id: number;
    address: string;
    symbol: string;
    decimals: number;
    is_native: boolean;
    verified_at: string;
  }> = [];

  for (const address of missing) {
    if (address === NATIVE_TOKEN_SENTINEL.toLowerCase()) {
      rows.push({
        chain_id: chainId,
        address,
        symbol: NATIVE_SYMBOLS[chainId],
        decimals: 18,
        is_native: true,
        verified_at: new Date().toISOString(),
      });
      continue;
    }

    try {
      const [symbol, decimals] = await Promise.all([
        client.readContract({
          address: address as `0x${string}`,
          abi: [ERC20_SYMBOL, ERC20_DECIMALS],
          functionName: 'symbol',
        }) as Promise<string>,
        client.readContract({
          address: address as `0x${string}`,
          abi: [ERC20_SYMBOL, ERC20_DECIMALS],
          functionName: 'decimals',
        }) as Promise<number>,
      ]);

      rows.push({
        chain_id: chainId,
        address,
        symbol,
        decimals: Number(decimals),
        is_native: false,
        verified_at: new Date().toISOString(),
      });
    } catch (e) {
      logger.error(`[indexer] could not read token metadata for ${address}`, e);
      return `unverifiable token ${address} — refusing to index donations with unknown decimals`;
    }
  }

  const { error: insertError } = await supabase
    .from('tokens')
    .upsert(rows, { onConflict: 'chain_id,address', ignoreDuplicates: true });

  return insertError ? `token write: ${insertError.message}` : null;
}

async function syncChain(
  network: string,
  chainId: ChainId,
  vault: string
): Promise<ChainSyncResult> {
  const supabase = getSupabaseAdmin();
  const client = createPublicClient({ transport: http(getRpcUrl(chainId)) });

  // Where did we get to last time? One watermark per (chain, contract).
  const { data: cursorRow, error: cursorError } = await supabase
    .from('indexer_cursors')
    .select('last_block_number')
    .eq('chain_id', chainId)
    .eq('contract_address', vault)
    .maybeSingle();

  if (cursorError) {
    return { network, chainId, vault, indexed: 0, error: `cursor read: ${cursorError.message}` };
  }

  const head = await client.getBlockNumber();
  const startBlock = getStartBlock(chainId);
  let fromBlock = cursorRow?.last_block_number
    ? BigInt(cursorRow.last_block_number) + 1n
    : startBlock;

  if (fromBlock > head) {
    return { network, chainId, vault, indexed: 0, skipped: 'already up to date' };
  }

  // Editorial campaign rows, so an indexed donation can carry its slug in the
  // donation_feed view. Missing copy is fine — campaign_id is nullable by
  // design and a donation is never dropped for lacking one.
  const campaignRowIds = new Map<string, number>();
  const { data: campaignRows } = await supabase
    .from('campaigns')
    .select('id, onchain_campaign_id')
    .eq('chain_id', chainId)
    .eq('vault_address', vault);

  for (const row of (campaignRows ?? []) as Array<{ id: number; onchain_campaign_id: string }>) {
    campaignRowIds.set(String(row.onchain_campaign_id), row.id);
  }

  const initialFrom = fromBlock;
  let indexed = 0;
  let chunks = 0;
  let lastProcessed = fromBlock - 1n;
  // A getLogs failure must surface in the response. Reporting ok/200 with
  // "indexed: 0" is indistinguishable from "no donations yet", which is exactly
  // how a wrong chunk size stays invisible until someone notices an empty wall.
  let stoppedBecause: string | null = null;

  while (fromBlock <= head && chunks < MAX_CHUNKS_PER_RUN) {
    const toBlock = fromBlock + BLOCK_CHUNK > head ? head : fromBlock + BLOCK_CHUNK;

    let logs: Log[];
    try {
      logs = await client.getLogs({
        address: vault as `0x${string}`,
        event: DONATED_EVENT,
        fromBlock,
        toBlock,
      });
    } catch (e) {
      // Stop cleanly and keep the cursor at the last good block; the next run
      // resumes from here rather than losing progress.
      logger.error(`[indexer] getLogs failed on ${network} ${fromBlock}-${toBlock}`, e);
      stoppedBecause = `getLogs ${fromBlock}-${toBlock}: ${
        e instanceof Error ? e.message.split('\n')[0] : 'unknown error'
      }`;
      break;
    }

    if (logs.length > 0) {
      // Block timestamps need a call per distinct block — dedupe first.
      const blockNumbers = [...new Set(logs.map((l) => l.blockNumber!))];
      const timestamps = new Map<bigint, number>();
      await Promise.all(
        blockNumbers.map(async (bn) => {
          const block = await client.getBlock({ blockNumber: bn });
          timestamps.set(bn, Number(block.timestamp));
        })
      );

      const rows = logs.map((log) => {
        const args = (log as unknown as {
          args: { campaignId: bigint; donor: string; token: string; amount: bigint; message: string };
        }).args;

        return {
          chain_id: chainId,
          vault_address: vault,
          // numeric(78,0) in Postgres: a uint256 campaign id does not fit a JS
          // number, so it travels as a string.
          onchain_campaign_id: args.campaignId.toString(),
          campaign_id: campaignRowIds.get(args.campaignId.toString()) ?? null,
          donor_address: args.donor.toLowerCase(),
          token_address: args.token.toLowerCase(),
          amount: args.amount.toString(),
          message: args.message || null,
          block_number: Number(log.blockNumber),
          block_time: new Date(timestamps.get(log.blockNumber!)! * 1000).toISOString(),
          tx_hash: log.transactionHash!.toLowerCase(),
          log_index: log.logIndex!,
        };
      });

      // donations.token_address is a foreign key into `tokens`. An unregistered
      // token would fail the whole batch, so register it first from the chain.
      const tokenError = await ensureTokensRegistered(
        supabase,
        client,
        chainId,
        rows.map((r) => r.token_address)
      );
      if (tokenError) {
        return { network, chainId, vault, indexed, error: tokenError };
      }

      // Idempotent: a replayed range updates in place instead of duplicating.
      const { error: upsertError } = await supabase
        .from('donations')
        .upsert(rows, { onConflict: 'chain_id,tx_hash,log_index', ignoreDuplicates: false });

      if (upsertError) {
        return {
          network,
          chainId,
          vault,
          indexed,
          error: `upsert: ${upsertError.message}`,
        };
      }

      indexed += rows.length;
    }

    lastProcessed = toBlock;
    fromBlock = toBlock + 1n;
    chunks++;
  }

  // Persist the cursor only as far as we actually processed.
  if (lastProcessed >= initialFrom) {
    const { error: cursorWriteError } = await supabase.from('indexer_cursors').upsert(
      {
        chain_id: chainId,
        contract_address: vault,
        last_block_number: Number(lastProcessed),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'chain_id,contract_address' }
    );

    if (cursorWriteError) {
      return { network, chainId, vault, indexed, error: `cursor write: ${cursorWriteError.message}` };
    }
  }

  return {
    network,
    chainId,
    vault,
    fromBlock: initialFrom.toString(),
    toBlock: lastProcessed.toString(),
    indexed,
    ...(stoppedBecause ? { error: stoppedBecause } : {}),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.INDEXER_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'INDEXER_SECRET is not configured' });
  }

  // Vercel Cron sends the secret as a bearer token.
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const vaults = getDeployedVaults();
  if (vaults.length === 0) {
    return res.status(200).json({
      ok: true,
      message: 'No DonationVault deployed yet — nothing to index',
      results: [],
    });
  }

  const results: ChainSyncResult[] = [];
  for (const { network, chainId, vault } of vaults) {
    try {
      results.push(await syncChain(network, chainId, vault));
    } catch (e) {
      logger.error(`[indexer] ${network} failed`, e);
      results.push({
        network,
        chainId,
        vault,
        indexed: 0,
        error: e instanceof Error ? e.message : 'unknown error',
      });
    }
  }

  const totalIndexed = results.reduce((sum, r) => sum + r.indexed, 0);
  const failed = results.filter((r) => r.error);

  return res.status(failed.length > 0 ? 207 : 200).json({
    ok: failed.length === 0,
    totalIndexed,
    results,
  });
}

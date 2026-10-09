/**
 * POST /api/certificates/admin/sync  { credentialIds }
 *
 * Record mints the app did not see. A sponsored mint goes through Privy's
 * ERC-4337 relay, which can report an error for a user operation that still
 * lands; the panel then never calls /confirm and the rows look unminted while
 * the tokens exist. This asks the chain instead of trusting the client:
 *
 *   tokenOfCredential(id) → the token, if any
 *   ownerOf(token)        → must be the row's wallet, or the row is reported
 *   CertificateIssued(token) log → the transaction, searched back from the
 *                                   latest block in small windows
 *
 * and stamps token_id + issued_tx on each match, as /confirm would. Rows
 * already stamped, or not minted, are reported and left alone. Idempotent.
 * Admin-only: ADMIN_ROLE on BuilderCertificate.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { parseAbiItem, type Hex } from 'viem';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { publicClientFor } from '../../../../config/chains';
import { CERT_ABI, CERT_ADDRESS, CERT_CHAIN_ID, credentialToBytes32 } from '../../../../lib/certificates/nft';
import { CREDENTIAL_RE } from '../../../../lib/certificates/rows';
import { logger } from '../../../../utils/logger';

export const config = { maxDuration: 60 };

const ISSUED = parseAbiItem('event CertificateIssued(uint256 indexed tokenId, address indexed to, bytes32 indexed credentialId, string cid)');
/** Small enough for free-tier RPC log limits; 120 windows ≈ 8 days back. */
const WINDOW = 500n;
const MAX_WINDOWS = 120;

export interface SyncResponse {
  recorded: { credentialId: string; tokenId: string; txHash: string }[];
  skipped: { credentialId: string; reason: string }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SyncResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let operator: string;
  try {
    operator = await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }
  const ids = Array.isArray(req.body?.credentialIds)
    ? Array.from(new Set((req.body.credentialIds as unknown[]).filter((v): v is string => typeof v === 'string').map((v) => v.toUpperCase())))
    : [];
  if (ids.length === 0 || ids.length > 100 || ids.some((id) => !CREDENTIAL_RE.test(id))) {
    return res.status(400).json({ error: 'credentialIds must be 1–100 credential ids' });
  }

  const db = getSupabaseAdmin();
  const client = publicClientFor(CERT_CHAIN_ID);
  const out: SyncResponse = { recorded: [], skipped: [] };
  try {
    const { data, error } = await db.from('builder_certificates').select('credential_id, wallet, issued_tx, planned_token_id').in('credential_id', ids);
    if (error) throw new Error(error.message);
    const rows = new Map((data ?? []).map((r) => [r.credential_id as string, r]));

    // What the chain says, per credential.
    const found: { id: string; tokenId: bigint }[] = [];
    for (const id of ids) {
      const r = rows.get(id);
      if (!r) {
        out.skipped.push({ credentialId: id, reason: 'no such certificate' });
        continue;
      }
      if (r.issued_tx) {
        out.skipped.push({ credentialId: id, reason: 'already recorded' });
        continue;
      }
      const tokenId = (await client.readContract({ address: CERT_ADDRESS, abi: CERT_ABI, functionName: 'tokenOfCredential', args: [credentialToBytes32(id)] })) as bigint;
      if (tokenId === 0n) {
        out.skipped.push({ credentialId: id, reason: 'not minted' });
        continue;
      }
      const owner = ((await client.readContract({ address: CERT_ADDRESS, abi: CERT_ABI, functionName: 'ownerOf', args: [tokenId] })) as string).toLowerCase();
      if (owner !== r.wallet) {
        out.skipped.push({ credentialId: id, reason: `minted as #${tokenId} to ${owner}, not to the row's wallet` });
        continue;
      }
      if (r.planned_token_id != null && BigInt(r.planned_token_id as number) !== tokenId) {
        out.skipped.push({ credentialId: id, reason: `minted as #${tokenId}, reserved as #${r.planned_token_id}` });
        continue;
      }
      found.push({ id, tokenId });
    }

    // The transaction behind each token, newest blocks first.
    const txOf = new Map<bigint, Hex>();
    if (found.length) {
      const want = new Set(found.map((f) => f.tokenId));
      let to = await client.getBlockNumber();
      for (let w = 0; w < MAX_WINDOWS && txOf.size < want.size; w++) {
        const from = to - WINDOW + 1n;
        const logs = await client.getLogs({ address: CERT_ADDRESS, event: ISSUED, fromBlock: from, toBlock: to });
        for (const l of logs) if (l.args.tokenId != null && want.has(l.args.tokenId)) txOf.set(l.args.tokenId, l.transactionHash as Hex);
        to = from - 1n;
      }
    }

    for (const f of found) {
      const tx = txOf.get(f.tokenId);
      if (!tx) {
        out.skipped.push({ credentialId: f.id, reason: `minted as #${f.tokenId}, but its transaction is older than the search window` });
        continue;
      }
      const { data: saved, error: saveError } = await db
        .from('builder_certificates')
        .update({ token_id: f.tokenId.toString(), issued_tx: tx.toLowerCase() })
        .eq('credential_id', f.id)
        .is('issued_tx', null)
        .select('credential_id')
        .maybeSingle();
      if (saveError) throw new Error(saveError.message);
      if (saved) out.recorded.push({ credentialId: f.id, tokenId: f.tokenId.toString(), txHash: tx });
      else out.skipped.push({ credentialId: f.id, reason: 'already recorded' });
    }
    if (out.recorded.length) logger.info(`certificates: ${operator} synced ${out.recorded.length} mints from chain`);
    return res.status(200).json(out);
  } catch (e) {
    logger.error('certificates: sync failed', e);
    return res.status(500).json({ error: 'Could not read the chain' });
  }
}

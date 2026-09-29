/**
 * The access matrix, server side: for every contract in config/access.ts,
 * who holds which role right now, and the name and email behind each wallet.
 *
 * Discovery and truth are separate steps:
 *
 *   1. Candidates — every `account` in the contract's RoleGranted logs, read
 *      through Blockscout's topic-filtered log API, plus the seed operators and
 *      known wallets (so a Blockscout outage still shows the keys that matter).
 *   2. Truth — hasRole / owner() on chain for every candidate. A granted-then-
 *      revoked wallet reads false and drops out; Blockscout is an index, the
 *      contract decides.
 *
 * Names come from swag_staff and KNOWN_WALLETS; emails from Privy's
 * lookup-by-wallet. Both are presentation. Emails are personal data, so the
 * route in front of this requires an operator session.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAddress, type Address } from 'viem';
import {
  ACCESS_CONTRACTS,
  KNOWN_WALLETS,
  SEED_OPERATORS,
  type AccessContractDef,
} from '../config/access';
import { DEFAULT_CHAIN, publicClientFor } from '../config/chains';
import { ACCESS_ABI } from './accessAbi';
import type { AccessContractView, AccessHolder, AccessMatrix, AccessPerson } from '../types/access';

const ROLE_GRANTED_TOPIC = '0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d';
const BLOCKSCOUT = 'https://eth.blockscout.com/api/v2';
/** RoleGranted is rare; a handful of pages covers years of grants. */
const MAX_LOG_PAGES = 10;

interface BlockscoutLog {
  topics: Array<string | null>;
}

interface BlockscoutPage {
  items?: BlockscoutLog[];
  next_page_params?: Record<string, string | number> | null;
}

/** Every account RoleGranted has ever named on `contract`, lowercase. Empty on any failure. */
async function grantedAccounts(contract: Address): Promise<string[]> {
  const found = new Set<string>();
  let params: Record<string, string | number> | null = null;

  for (let page = 0; page < MAX_LOG_PAGES; page++) {
    const qs = new URLSearchParams({ topic: ROLE_GRANTED_TOPIC });
    for (const [k, v] of Object.entries(params ?? {})) qs.set(k, String(v));
    let body: BlockscoutPage;
    try {
      const res = await fetch(`${BLOCKSCOUT}/addresses/${contract}/logs?${qs}`);
      if (!res.ok) break;
      body = (await res.json()) as BlockscoutPage;
    } catch {
      break;
    }
    for (const log of body.items ?? []) {
      // topics: [sig, role, account, sender]; account is a left-padded address.
      const topic = log.topics[2];
      if (log.topics[0] === ROLE_GRANTED_TOPIC && topic) found.add(`0x${topic.slice(-40)}`.toLowerCase());
    }
    params = body.next_page_params ?? null;
    if (!params) break;
  }
  return Array.from(found);
}

function baseCandidates(): string[] {
  return [...SEED_OPERATORS.map((s) => s.address.toLowerCase()), ...Object.keys(KNOWN_WALLETS)];
}

async function readContract(def: AccessContractDef): Promise<AccessContractView> {
  const client = publicClientFor(DEFAULT_CHAIN.id);
  const view: AccessContractView = { key: def.key, address: def.address ?? null, holders: {}, readError: null };
  if (!def.address) return view;
  const address = def.address;

  try {
    if (def.kind === 'ownable') {
      const owner = (await client.readContract({ address, abi: ACCESS_ABI, functionName: 'owner' })) as Address;
      view.holders.owner = [owner.toLowerCase()];
      return view;
    }

    const candidates = Array.from(new Set([...(await grantedAccounts(address)), ...baseCandidates()]));
    for (const role of def.roles) {
      if (!role.id) continue;
      const roleId = role.id;
      const held = await Promise.all(
        candidates.map((account) =>
          client.readContract({ address, abi: ACCESS_ABI, functionName: 'hasRole', args: [roleId, account as Address] })
        )
      );
      view.holders[role.key] = candidates.filter((_, i) => held[i]);
    }
  } catch (e) {
    // Never show a partial matrix as if it were whole.
    view.holders = {};
    view.readError = e instanceof Error ? e.message.split('\n')[0] : 'Could not read the contract';
  }
  return view;
}

/** Privy account email for a wallet, or null. Never throws: an email is a nicety. */
async function emailForWallet(address: string): Promise<string | null> {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) return null;
  try {
    const res = await fetch('https://auth.privy.io/api/v1/users/wallet/address', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
        'privy-app-id': appId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: getAddress(address) }),
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { linked_accounts?: Array<{ type?: string; address?: string; email?: string }> };
    const account = (user.linked_accounts ?? []).find((a) => a.type === 'email' || a.type === 'google_oauth');
    return (account?.type === 'email' ? account.address : account?.email)?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

async function staffLabels(db: SupabaseClient): Promise<Map<string, { label: string; email: string | null }>> {
  const { data } = await db.from('swag_staff').select('address, label, email');
  return new Map(
    ((data ?? []) as Array<{ address: string; label: string; email: string | null }>).map((r) => [
      r.address.toLowerCase(),
      { label: r.label, email: r.email },
    ])
  );
}

export async function readAccessMatrix(db: SupabaseClient): Promise<AccessMatrix> {
  const [contracts, staff] = await Promise.all([Promise.all(ACCESS_CONTRACTS.map(readContract)), staffLabels(db)]);

  const wallets = new Set<string>(baseCandidates());
  for (const c of contracts) for (const list of Object.values(c.holders)) for (const w of list ?? []) wallets.add(w);

  const people: Record<string, AccessPerson> = {};
  await Promise.all(
    Array.from(wallets).map(async (w) => {
      const known = staff.get(w);
      people[w] = {
        label: KNOWN_WALLETS[w] ?? known?.label ?? null,
        email: known?.email ?? (await emailForWallet(w)),
      };
    })
  );

  const seed = SEED_OPERATORS.map((s) => {
    const address = s.address.toLowerCase();
    const missing: AccessHolder[] = [];
    for (const [key, roles] of Object.entries(s.expects)) {
      const view = contracts.find((c) => c.key === key);
      if (!view?.address || view.readError) continue;
      for (const role of roles ?? []) {
        if (!(view.holders[role] ?? []).includes(address)) missing.push({ contract: view.key, role });
      }
    }
    return { address, label: s.label, missing };
  });

  return { contracts, people, seed, readAt: new Date().toISOString() };
}

/** Whether any of `wallets` holds an admin-level role anywhere in the matrix. */
export function isOperator(matrix: AccessMatrix, wallets: string[]): boolean {
  const mine = new Set(wallets.map((w) => w.toLowerCase()));
  return matrix.contracts.some((c) =>
    (['super', 'admin', 'owner', 'fulfilment'] as const).some((r) => (c.holders[r] ?? []).some((w) => mine.has(w)))
  );
}

/** Whether any of `wallets` can grant on at least one contract (DEFAULT_ADMIN_ROLE or owner). */
export function isGranter(matrix: AccessMatrix, wallets: string[]): boolean {
  const mine = new Set(wallets.map((w) => w.toLowerCase()));
  return matrix.contracts.some((c) =>
    (['super', 'owner'] as const).some((r) => (c.holders[r] ?? []).some((w) => mine.has(w)))
  );
}

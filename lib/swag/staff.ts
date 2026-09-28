/**
 * The swag team registry: public.swag_staff, read and written through the
 * service role only, and always shown next to what the collection says now.
 *
 * A row is written after the grant transaction has landed and the role reads
 * true on chain, and deleted after the revoke has landed and it reads false.
 * The row is the name; the chain is the permission.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAddress, isHash, type Address } from 'viem';
import { readSwagRoles, type SwagWalletRoles } from './requireSwagAdmin';
import type { SwagStaffRecordBody, SwagStaffRole, SwagStaffView } from '../../types/swag-orders';

export class StaffError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

interface StaffRow {
  address: string;
  role: SwagStaffRole;
  label: string;
  email: string | null;
  privy_did: string | null;
  granted_by: string;
  grant_tx_hash: string | null;
  created_at: string;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ROLES: readonly SwagStaffRole[] = ['admin', 'fulfilment'];

export function parseEmail(raw: unknown): string {
  if (typeof raw !== 'string') throw new StaffError('email is required', 400);
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) throw new StaffError('That is not an email address', 400);
  return email;
}

export function parseAddress(raw: unknown): Address {
  if (typeof raw !== 'string' || !isAddress(raw.trim())) throw new StaffError('address must be a 0x address', 400);
  return raw.trim().toLowerCase() as Address;
}

export function parseRecordBody(raw: unknown): SwagStaffRecordBody {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new StaffError('A JSON body is required', 400);
  const r = raw as Record<string, unknown>;
  const address = parseAddress(r.address);
  if (typeof r.role !== 'string' || !(ROLES as readonly string[]).includes(r.role)) {
    throw new StaffError(`role must be one of ${ROLES.join(', ')}`, 400);
  }
  if (typeof r.label !== 'string' || !r.label.trim() || r.label.trim().length > 80) {
    throw new StaffError('label is required (up to 80 characters)', 400);
  }
  const body: SwagStaffRecordBody = { address, role: r.role as SwagStaffRole, label: r.label.trim() };
  if (r.email !== undefined && r.email !== '') body.email = parseEmail(r.email);
  if (r.did !== undefined) {
    if (typeof r.did !== 'string' || !/^did:privy:[A-Za-z0-9]+$/.test(r.did)) throw new StaffError('did is not a Privy DID', 400);
    body.did = r.did;
  }
  if (r.txHash !== undefined) {
    if (typeof r.txHash !== 'string' || !isHash(r.txHash)) throw new StaffError('txHash must be a transaction hash', 400);
    body.txHash = r.txHash.toLowerCase();
  }
  return body;
}

function held(roles: SwagWalletRoles, role: SwagStaffRole): boolean {
  return role === 'admin' ? roles.admin : roles.fulfilment;
}

function toView(row: StaffRow, onChain: SwagWalletRoles | null): SwagStaffView {
  return {
    address: row.address,
    label: row.label,
    email: row.email,
    role: row.role,
    grantedBy: row.granted_by,
    grantTxHash: row.grant_tx_hash,
    createdAt: row.created_at,
    onChain,
  };
}

async function rolesOrNull(address: string): Promise<SwagWalletRoles | null> {
  try {
    return await readSwagRoles(address as Address);
  } catch {
    return null;
  }
}

/** Every row, with the chain's answer for each (null where the read failed). */
export async function listStaff(db: SupabaseClient): Promise<SwagStaffView[]> {
  const { data, error } = await db.from('swag_staff').select('*').order('created_at', { ascending: true });
  if (error) throw new StaffError(error.message, 500);
  const rows = (data ?? []) as StaffRow[];
  const roles = await Promise.all(rows.map((r) => rolesOrNull(r.address)));
  return rows.map((row, i) => toView(row, roles[i]));
}

/** Upsert a member whose role the chain already confirms. */
export async function recordStaff(
  db: SupabaseClient,
  body: SwagStaffRecordBody,
  grantedBy: string
): Promise<SwagStaffView> {
  const roles = await readSwagRoles(body.address as Address).catch(() => {
    throw new StaffError('Could not read the collection; try again in a moment', 502);
  });
  if (!held(roles, body.role)) {
    throw new StaffError(
      `${body.address} does not hold ${body.role === 'admin' ? 'ADMIN_ROLE' : 'FULFILLMENT_ROLE'} on chain yet. Wait for the grant to confirm.`,
      409
    );
  }

  const { data, error } = await db
    .from('swag_staff')
    .upsert(
      {
        address: body.address,
        role: body.role,
        label: body.label,
        email: body.email ?? null,
        privy_did: body.did ?? null,
        granted_by: grantedBy.toLowerCase(),
        grant_tx_hash: body.txHash ?? null,
      },
      { onConflict: 'address' }
    )
    .select('*')
    .single();
  if (error) throw new StaffError(error.message, 500);
  return toView(data as StaffRow, roles);
}

/** Delete a member once the chain shows neither role. */
export async function forgetStaff(db: SupabaseClient, address: Address): Promise<void> {
  const roles = await readSwagRoles(address).catch(() => {
    throw new StaffError('Could not read the collection; try again in a moment', 502);
  });
  if (roles.admin || roles.fulfilment) {
    throw new StaffError('This wallet still holds a role on chain. Revoke it first.', 409);
  }
  const { error } = await db.from('swag_staff').delete().eq('address', address.toLowerCase());
  if (error) throw new StaffError(error.message, 500);
}

/**
 * Who works the swag desk, and at which level.
 *
 *   Fulfilment  FULFILLMENT_ROLE  orders, addresses, batch, print sheet, shipped
 *   Admin       ADMIN_ROLE        all of that plus prices, caps, pause, vouchers
 *
 * Adding someone is three steps, in order, each owning its own pending state:
 *
 *   1. email → the Privy embedded wallet for that email (created if the person
 *      has never signed in), or a pasted 0x / name.eth as is
 *   2. the grant, from the connected wallet, which must hold DEFAULT_ADMIN_ROLE:
 *      addAdmin(address) or grantRole(FULFILLMENT_ROLE, address)
 *   3. the name, recorded server-side only once the role reads true on chain
 *
 * Removing is the same in reverse: the revoke transaction, then the name.
 * Nothing on this page grants anything by itself; the collection does.
 */
import { useState } from 'react';
import { encodeFunctionData, type Address } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { FULFILLMENT_ROLE } from '../../lib/swag/roles';
import {
  SWAG,
  swagClient,
  looksLikeAddressInput,
  resolveAddressInput,
  useForgetStaff,
  useRecordStaff,
  useResolveStaffEmail,
  useSwagAdminTx,
  useSwagCollectionState,
  useSwagStaff,
} from '../../hooks/swag';
import type { SwagStaffRole, SwagStaffView } from '../../types/swag-orders';
import { HashChip } from './HashChip';
import { CARD, ChainGate, FIELD, LABEL, Pill, Spinner, TxButton } from './AdminPrimitives';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ROLE_LABEL: Record<SwagStaffRole, string> = { admin: 'Admin', fulfilment: 'Fulfilment' };

function grantCall(role: SwagStaffRole, address: Address) {
  return role === 'admin'
    ? encodeFunctionData({ abi: swag1155Abi, functionName: 'addAdmin', args: [address] })
    : encodeFunctionData({ abi: swag1155Abi, functionName: 'grantRole', args: [FULFILLMENT_ROLE, address] });
}

/** Whether the collection already shows this role, so a retry does not grant twice. */
async function alreadyHolds(role: SwagStaffRole, address: Address): Promise<boolean> {
  const target = { address: SWAG.address, abi: swag1155Abi } as const;
  return role === 'admin'
    ? swagClient.readContract({ ...target, functionName: 'isAdmin', args: [address] })
    : swagClient.readContract({ ...target, functionName: 'hasRole', args: [FULFILLMENT_ROLE, address] });
}

function revokeCall(role: SwagStaffRole, address: Address) {
  return role === 'admin'
    ? encodeFunctionData({ abi: swag1155Abi, functionName: 'removeAdmin', args: [address] })
    : encodeFunctionData({ abi: swag1155Abi, functionName: 'revokeRole', args: [FULFILLMENT_ROLE, address] });
}

function AddMember({ reason }: { reason: string | null }) {
  const resolve = useResolveStaffEmail();
  const record = useRecordStaff();
  const grantTx = useSwagAdminTx();

  const [who, setWho] = useState('');
  const [label, setLabel] = useState('');
  const [role, setRole] = useState<SwagStaffRole>('fulfilment');
  const [resolving, setResolving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const input = who.trim();
  const isEmail = EMAIL.test(input);
  const invalid = !input
    ? 'Enter an email or a wallet.'
    : !isEmail && !looksLikeAddressInput(input)
      ? 'That is neither an email nor a 0x address / name.eth.'
      : !label.trim()
        ? 'Give them a name, e.g. “Ana — packing”.'
        : null;

  const add = async () => {
    setError(null);
    setDone(null);

    // Step 1: the wallet to grant to.
    let address: Address | null = null;
    let did: string | undefined;
    setResolving(true);
    try {
      if (isEmail) {
        const r = await resolve.mutateAsync(input.toLowerCase());
        address = r.address as Address;
        did = r.did;
      } else {
        address = await resolveAddressInput(input);
        if (!address) throw new Error('Could not resolve that name to an address.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not look that up.');
      return;
    } finally {
      setResolving(false);
    }

    // Step 2: the grant, from this wallet — skipped when a retry finds it already held.
    let hash: `0x${string}` | undefined;
    const held = await alreadyHolds(role, address).catch(() => false);
    if (!held) {
      const sent = await grantTx.run(grantCall(role, address), { invalidate: [['swag-admin-staff']] });
      if (!sent) return;
      hash = sent;
    }

    // Step 3: the name, now that the chain backs it.
    setRecording(true);
    try {
      await record.mutateAsync({
        address,
        role,
        label: label.trim(),
        ...(isEmail ? { email: input.toLowerCase(), did } : {}),
        ...(hash ? { txHash: hash } : {}),
      });
      setDone(`${label.trim()} can now open the swag desk${isEmail ? ` by signing in with ${input.toLowerCase()}` : ''}.`);
      setWho('');
      setLabel('');
    } catch (e) {
      setError(`The role is on chain but the name was not saved: ${e instanceof Error ? e.message : 'unknown error'}. Add them again to retry; the grant is skipped when it already holds.`);
    } finally {
      setRecording(false);
    }
  };

  const pendingLabel = resolving ? 'Looking up…' : recording ? 'Saving name…' : 'Granting role…';

  return (
    <section className={CARD}>
      <h2 className="font-semibold text-content-primary">Add someone</h2>
      <p className="mt-1 text-sm text-content-muted">
        By email, they just sign in to the app with a one-time code — no wallet to install. By wallet, they connect it.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={LABEL}>Email or wallet</span>
          <input type="text" value={who} onChange={(e) => setWho(e.target.value)} placeholder="ana@ethcali.org or 0x… or name.eth" className={FIELD} spellCheck={false} autoCapitalize="none" disabled={resolving || recording} />
        </label>
        <label className="block">
          <span className={LABEL}>Name</span>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ana — packing" className={FIELD} maxLength={80} disabled={resolving || recording} />
        </label>
        <label className="block">
          <span className={LABEL}>Level</span>
          <select value={role} onChange={(e) => setRole(e.target.value as SwagStaffRole)} className={`${FIELD} appearance-none`} disabled={resolving || recording}>
            <option value="fulfilment">Fulfilment — orders and shipping</option>
            <option value="admin">Admin — also prices, stock, pause</option>
          </select>
        </label>
      </div>
      <div className="mt-4">
        <TxButton
          label="Add to team"
          pendingLabel={pendingLabel}
          tx={grantTx}
          onClick={add}
          reason={resolving || recording ? pendingLabel : reason ?? invalid}
        />
      </div>
      {resolving && <p className="mt-2 inline-flex items-center gap-2 text-xs text-content-muted"><Spinner /> Finding their wallet…</p>}
      {error && <p className="mt-2 text-xs text-signal-reverted">{error}</p>}
      {done && <p className="mt-2 text-xs text-signal-confirmed">{done}</p>}
    </section>
  );
}

function MemberRow({ member, reason }: { member: SwagStaffView; reason: string | null }) {
  const revokeTx = useSwagAdminTx();
  const forget = useForgetStaff();
  const [forgetting, setForgetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const holds = member.onChain ? (member.role === 'admin' ? member.onChain.admin : member.onChain.fulfilment) : null;

  const remove = async () => {
    setError(null);
    if (holds !== false) {
      const hash = await revokeTx.run(revokeCall(member.role, member.address as Address), { invalidate: [['swag-admin-staff']] });
      if (!hash) return;
    }
    setForgetting(true);
    try {
      await forget.mutateAsync(member.address);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove the name.');
    } finally {
      setForgetting(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line-hairline py-3 last:border-0">
      <div className="min-w-0">
        <p className="font-semibold text-content-primary">{member.label}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-content-muted">
          {member.email && <span className="break-all">{member.email}</span>}
          <HashChip hash={member.address} kind="address" />
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={member.role === 'admin' ? 'brand' : 'muted'}>{ROLE_LABEL[member.role]}</Pill>
        {holds === true && <Pill tone="confirmed">On chain</Pill>}
        {holds === false && <Pill tone="reverted">Role not on chain</Pill>}
        {holds === null && <Pill tone="muted">Chain unreadable</Pill>}
        <TxButton
          label={holds === false ? 'Remove name' : 'Remove'}
          pendingLabel={forgetting ? 'Removing name…' : 'Revoking…'}
          tx={revokeTx}
          onClick={remove}
          reason={forgetting ? 'Removing name…' : reason}
          variant="secondary"
          quiet
        />
      </div>
      {error && <p className="w-full text-xs text-signal-reverted">{error}</p>}
    </li>
  );
}

export function AdminTeam() {
  const state = useSwagCollectionState();
  const staff = useSwagStaff(true);

  const reason = state.isLoading
    ? 'Reading your roles…'
    : !state.isSuperAdmin
      ? 'Adding or removing people needs super admin (DEFAULT_ADMIN_ROLE) on the collection, and the connected wallet holds admin only. The current super admin can grant it from Admin → Admins & access.'
      : null;

  const members = staff.data?.staff ?? [];

  return (
    <div className="space-y-4">
      <ChainGate />
      <AddMember reason={reason} />

      <section className={CARD}>
        <h2 className="font-semibold text-content-primary">Team</h2>
        <p className="mt-1 text-sm text-content-muted">
          Named here once their role is on chain. The collection decides access; this list only puts a name to a wallet.
        </p>
        {staff.isLoading && <p className="mt-4 text-sm text-content-faint">Loading…</p>}
        {staff.error && <p className="mt-4 text-sm text-signal-reverted">{staff.error.message}</p>}
        {!staff.isLoading && !staff.error && members.length === 0 && (
          <p className="mt-4 text-sm text-content-faint">Nobody added yet. Wallets granted a role before this page existed hold it still; add them here to put a name to them.</p>
        )}
        <ul className="mt-2">
          {members.map((m) => <MemberRow key={m.address} member={m} reason={reason} />)}
        </ul>
      </section>
    </div>
  );
}

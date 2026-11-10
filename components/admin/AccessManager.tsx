/**
 * Who holds which role, contract by contract, and the grant / revoke /
 * transfer buttons for each — the body of /admin/access and of the Access tab
 * on every product page (pass `only` to scope it to that product).
 *
 * Every button is a transaction from the connected wallet, and each is
 * offered only to a wallet the contract would accept it from: DEFAULT_ADMIN_ROLE
 * for AccessControl, the owner for Ownable. When the connected wallet cannot
 * sign, the button says which wallet can, by name — never a dead button.
 *
 * Adding by email resolves (or creates) the person's Privy embedded wallet
 * first, so a new admin only ever signs in with a one-time code.
 */
import { useState } from 'react';
import { encodeFunctionData, type Address } from 'viem';
import {
  ACCESS_CONTRACTS,
  granterOf,
  type AccessContractDef,
  type AccessContractKey,
  type AccessRoleDef,
  type AccessRoleKey,
} from '../../config/access';
import { useAccessMatrix, useAccessTx, useResolveAccessEmail } from '../../hooks/admin';
import { looksLikeAddressInput, resolveAddressInput } from '../../hooks/swag';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { ACCESS_ABI } from '../../lib/accessAbi';
import type { AccessContractView, AccessMatrix, AccessPerson } from '../../types/access';
import { CARD, ChainGate, ConfirmDialog, FIELD, LABEL, Pill, Spinner, TxButton, useToast } from './primitives';
import { HashChip, truncateHex } from '../shared/HashChip';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface Ctx {
  matrix: AccessMatrix;
  me: string | null;
}

function grantData(contract: AccessContractDef, role: AccessRoleDef, account: Address) {
  return contract.kind === 'ownable'
    ? encodeFunctionData({ abi: ACCESS_ABI, functionName: 'transferOwnership', args: [account] })
    : encodeFunctionData({ abi: ACCESS_ABI, functionName: 'grantRole', args: [role.id!, account] });
}

function holdersOf(view: AccessContractView | undefined, role: AccessRoleKey): string[] {
  return view?.holders[role] ?? [];
}

function nameOf(people: Record<string, AccessPerson>, wallet: string): string {
  return people[wallet]?.label ?? people[wallet]?.email ?? truncateHex(wallet);
}

/**
 * Why the connected wallet cannot grant on this contract, naming who can —
 * or null when it can.
 */
function grantBlock({ matrix, me }: Ctx, contract: AccessContractDef): string | null {
  const view = matrix.contracts.find((c) => c.key === contract.key);
  if (!view?.address) return 'Not deployed.';
  if (view.readError) return 'The contract could not be read; reload to retry.';
  const granters = holdersOf(view, granterOf(contract));
  if (me && granters.includes(me)) return null;
  const who = granters.length ? granters.map((w) => nameOf(matrix.people, w)).join(' or ') : 'nobody (no holder found)';
  return `Only ${who} can sign this on ${contract.name}. Connect that wallet to do it here.`;
}

function Person({ wallet, people, me }: { wallet: string; people: Record<string, AccessPerson>; me: string | null }) {
  const p = people[wallet];
  return (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-content-primary">
        {p?.label ?? p?.email ?? 'Unnamed wallet'}
        {wallet === me && <Pill tone="brand">You</Pill>}
      </p>
      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-content-muted">
        {p?.label && p.email && <span className="break-all">{p.email}</span>}
        <HashChip hash={wallet} kind="address" />
      </p>
    </div>
  );
}

function RevokeButton({ contract, role, wallet, who, block }: { contract: AccessContractDef; role: AccessRoleDef; wallet: string; who: string; block: string | null }) {
  const tx = useAccessTx(contract.address);
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  return (
    <>
      <TxButton label="Revoke" pendingLabel="Revoking…" tx={tx} variant="secondary" quiet reason={block} onClick={() => setAsking(true)} />
      {asking && (
        <ConfirmDialog
          title={`Revoke ${role.label} on ${contract.name}?`}
          body={
            <>
              <span className="font-semibold text-content-primary">{who}</span> loses: {role.unlocks.toLowerCase()}. This is a
              transaction from your wallet; granting it back is another one.
            </>
          }
          confirmLabel="Revoke"
          pendingLabel="Revoking…"
          danger
          onConfirm={async () => {
            const hash = await tx.run(encodeFunctionData({ abi: ACCESS_ABI, functionName: 'revokeRole', args: [role.id!, wallet as Address] }));
            if (hash) toast(`${who} no longer holds ${role.label} on ${contract.name}.`);
          }}
          onClose={() => setAsking(false)}
        />
      )}
    </>
  );
}

function RoleBlock({ ctx, contract, view, role }: { ctx: Ctx; contract: AccessContractDef; view: AccessContractView; role: AccessRoleDef }) {
  const holders = holdersOf(view, role.key);
  const block = grantBlock(ctx, contract);
  const isLastSuper = role.key === 'super' && holders.length <= 1;

  return (
    <div className="border-t border-line-hairline pt-3 first:border-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-content-secondary">{role.label}</p>
        <p className="font-mono text-[11px] text-content-faint">{holders.length} holder{holders.length === 1 ? '' : 's'}</p>
      </div>
      <p className="text-xs text-content-faint">{role.unlocks}</p>
      {holders.length === 0 && <p className="mt-2 text-xs text-content-muted">Nobody holds this role.</p>}
      <ul className="mt-2 space-y-2">
        {holders.map((wallet) => (
          <li key={wallet} className="flex flex-wrap items-center justify-between gap-3">
            <Person wallet={wallet} people={ctx.matrix.people} me={ctx.me} />
            {contract.kind === 'accessControl' && role.grantable && (
              <RevokeButton
                contract={contract}
                role={role}
                wallet={wallet}
                who={nameOf(ctx.matrix.people, wallet)}
                block={isLastSuper ? 'The last super admin. Revoking it would lock this contract for good.' : block}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Email or wallet in, one grant (or ownership transfer) out. */
function GrantForm({ ctx, contract }: { ctx: Ctx; contract: AccessContractDef }) {
  const grantable = contract.roles.filter((r) => r.grantable);
  const tx = useAccessTx(contract.address);
  const resolve = useResolveAccessEmail();
  const [who, setWho] = useState('');
  const [roleKey, setRoleKey] = useState<AccessRoleKey>(grantable.find((r) => r.key === 'admin')?.key ?? grantable[0]?.key);
  const [confirmed, setConfirmed] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (grantable.length === 0) return null;
  const role = grantable.find((r) => r.key === roleKey) ?? grantable[0];
  const ownable = contract.kind === 'ownable';
  const input = who.trim();
  const isEmail = EMAIL.test(input);

  const invalid = !input
    ? 'Enter an email, a 0x address or a name.eth.'
    : !isEmail && !looksLikeAddressInput(input)
      ? 'That is neither an email nor a 0x address / name.eth.'
      : ownable && !confirmed
        ? 'Tick the box: transferring ownership removes it from the current owner.'
        : null;

  const submit = async () => {
    setError(null);
    setDone(null);
    let address: Address | null = null;
    setResolving(true);
    try {
      address = isEmail ? ((await resolve.mutateAsync(input.toLowerCase())).address as Address) : await resolveAddressInput(input);
      if (!address) throw new Error('Could not resolve that name to an address.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not look that up.');
      return;
    } finally {
      setResolving(false);
    }
    if (holdersOf(ctx.matrix.contracts.find((c) => c.key === contract.key), role.key).includes(address.toLowerCase())) {
      setDone(`${truncateHex(address)} already holds ${role.label} on ${contract.name}.`);
      return;
    }
    const hash = await tx.run(grantData(contract, role, address));
    if (hash) {
      setDone(
        `${isEmail ? input.toLowerCase() : truncateHex(address)} now ${ownable ? 'owns' : `holds ${role.label} on`} ${contract.name}.` +
          (isEmail ? ' They sign in to app.ethcali.org with that email to use it.' : '')
      );
      setWho('');
      setConfirmed(false);
    }
  };

  const block = grantBlock(ctx, contract);
  const busy = resolving || tx.submitting || tx.cooldown;

  return (
    <div className="mt-4 rounded-control border border-line-hairline bg-surface-inset/50 p-3 sm:p-4">
      <p className="text-sm font-semibold text-content-primary">{ownable ? 'Transfer ownership' : 'Add someone'}</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="block">
          <span className={LABEL}>Email or wallet</span>
          <input
            type="text"
            value={who}
            onChange={(e) => setWho(e.target.value)}
            placeholder="name@ethcali.org, 0x… or name.eth"
            className={FIELD}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            disabled={busy}
          />
        </label>
        {!ownable && (
          <label className="block">
            <span className={LABEL}>Role</span>
            <select value={role.key} onChange={(e) => setRoleKey(e.target.value as AccessRoleKey)} className={`${FIELD} appearance-none`} disabled={busy}>
              {grantable.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      {ownable && (
        <label className="mt-3 flex items-start gap-2 text-xs text-content-muted">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" disabled={busy} />
          I understand the current owner loses control, and only the new owner can transfer it back.
        </label>
      )}
      <div className="mt-3">
        <TxButton
          label={ownable ? 'Transfer ownership' : `Grant ${role.label}`}
          pendingLabel={resolving ? 'Finding their wallet…' : ownable ? 'Transferring…' : 'Granting…'}
          tx={tx}
          onClick={submit}
          reason={resolving ? 'Finding their wallet…' : block ?? invalid}
        />
      </div>
      {resolving && <p className="mt-2 inline-flex items-center gap-2 text-xs text-content-muted"><Spinner /> Finding or creating their wallet…</p>}
      {error && <p className="mt-2 text-xs text-signal-reverted">{error}</p>}
      {done && <p className="mt-2 text-xs text-signal-confirmed">{done}</p>}
    </div>
  );
}

function ContractCard({ ctx, contract }: { ctx: Ctx; contract: AccessContractDef }) {
  const view = ctx.matrix.contracts.find((c) => c.key === contract.key);
  const canGrant = grantBlock(ctx, contract) === null;
  return (
    <section className={CARD}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-content-primary">{contract.name}</h2>
          {view?.address && <HashChip hash={view.address} kind="address" />}
        </div>
        {canGrant && <Pill tone="brand">You can grant here</Pill>}
      </div>
      {!view?.address && <p className="text-sm text-content-muted">Not deployed on Ethereum.</p>}
      {view?.readError && <p className="text-sm text-signal-reverted">Could not read roles: {view.readError}</p>}
      {view?.address && !view.readError && (
        <>
          <div className="space-y-3">
            {contract.roles.map((role) => <RoleBlock key={role.key} ctx={ctx} contract={contract} view={view} role={role} />)}
          </div>
          <GrantForm ctx={ctx} contract={contract} />
        </>
      )}
    </section>
  );
}

function SeedGrant({ ctx, contract, role, wallet }: { ctx: Ctx; contract: AccessContractDef; role: AccessRoleDef; wallet: Address }) {
  const tx = useAccessTx(contract.address);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-t border-signal-pending/20 pt-2 first:border-0 first:pt-0">
      <p className="text-sm text-content-primary">
        {contract.name} · <span className="font-semibold">{contract.kind === 'ownable' ? 'Owner' : role.label}</span>
      </p>
      {/* Ownership moves are never one click from a banner; the contract card has the confirmed form. */}
      {contract.kind === 'ownable' ? (
        <p className="text-[11px] text-content-faint">Use “Transfer ownership” on the {contract.name} card.</p>
      ) : (
        <TxButton
          label="Grant"
          pendingLabel="Granting…"
          tx={tx}
          variant="secondary"
          quiet
          reason={grantBlock(ctx, contract)}
          onClick={() => tx.run(grantData(contract, role, wallet))}
        />
      )}
    </li>
  );
}

function SeedPanel({ ctx, only }: { ctx: Ctx; only?: readonly AccessContractKey[] }) {
  const rows = ctx.matrix.seed
    .map((s) => ({ ...s, missing: s.missing.filter((m) => !only || only.includes(m.contract)) }))
    .filter((s) => s.missing.length > 0);

  if (rows.length === 0) {
    return (
      <p className="rounded-card border border-line-hairline bg-surface-inset/50 p-4 text-sm text-content-muted">
        <span className="text-signal-confirmed">Seed operator in place.</span> Every role the foundation wallet should hold here reads true on chain.
      </p>
    );
  }

  return (
    <section className="rounded-card border border-signal-pending/40 bg-signal-pending/10 p-4 sm:p-5">
      {rows.map((s) => (
        <div key={s.address}>
          <h2 className="text-sm font-bold text-signal-pending">The seed operator is missing {s.missing.length} role{s.missing.length === 1 ? '' : 's'}</h2>
          <p className="mt-1 text-xs text-content-muted">
            {s.label} · <HashChip hash={s.address} kind="address" /> is the wallet meant to reach every admin page and add everyone else.
            Each grant below has to be signed by the wallet that holds super admin on that contract.
          </p>
          <ul className="mt-3 space-y-2">
            {s.missing.map((m) => {
              const contract = ACCESS_CONTRACTS.find((c) => c.key === m.contract)!;
              const role = contract.roles.find((r) => r.key === m.role)!;
              return <SeedGrant key={`${m.contract}-${m.role}`} ctx={ctx} contract={contract} role={role} wallet={s.address as Address} />;
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function AccessManager({ only }: { only?: readonly AccessContractKey[] }) {
  const matrix = useAccessMatrix();
  const { address } = useActiveWallet();

  if (matrix.isLoading) {
    return <p className="inline-flex items-center gap-2 text-sm text-content-muted"><Spinner /> Reading roles from every contract…</p>;
  }
  if (matrix.error || !matrix.data) {
    return (
      <div className={CARD}>
        <p className="font-semibold text-content-primary">Access could not be loaded</p>
        <p className="mt-1 text-sm text-content-muted">{matrix.error?.message ?? 'Sign in with an operator account.'}</p>
      </div>
    );
  }

  const ctx: Ctx = { matrix: matrix.data, me: address?.toLowerCase() ?? null };
  const contracts = ACCESS_CONTRACTS.filter((c) => !only || only.includes(c.key));

  return (
    <div className="space-y-4">
      <ChainGate />
      <SeedPanel ctx={ctx} only={only} />
      {contracts.map((c) => <ContractCard key={c.key} ctx={ctx} contract={c} />)}
      <p className="text-[11px] text-content-faint">
        Read from the chain {new Date(matrix.data.readAt).toLocaleTimeString()}. Holders are found from each contract&apos;s
        RoleGranted history and confirmed with hasRole; names and emails are labels only.
      </p>
    </div>
  );
}

/**
 * The collection itself: paused or live, where the money goes, and who can
 * do what.
 *
 * pause/unpause need ADMIN_ROLE. Adding or removing an admin or a signer needs
 * DEFAULT_ADMIN_ROLE, which the Safe holds; the buttons stay visible so an
 * operator can see they exist, and say why they are disabled. setTreasury is
 * also DEFAULT_ADMIN and is deliberately not here: it moves every future
 * payment, and that belongs in a Safe transaction, not behind a text field.
 */
import { encodeFunctionData, type Address } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { SWAG, useSwagAdminTx, useSwagCollectionState } from '../../hooks/swag';
import { EXPLORER_URLS } from '../../config/constants';
import { HashChip } from './HashChip';
import { AddressForm, CARD, ChainGate, Pill, TxButton } from './AdminPrimitives';

function RolePill({ held, label }: { held: boolean; label: string }) {
  return <Pill tone={held ? 'confirmed' : 'muted'}>{label}{held ? ' · held' : ' · not held'}</Pill>;
}

export function AdminCollection() {
  const state = useSwagCollectionState();
  const pauseTx = useSwagAdminTx();
  const unpauseTx = useSwagAdminTx();
  const addAdminTx = useSwagAdminTx();
  const removeAdminTx = useSwagAdminTx();
  const addSignerTx = useSwagAdminTx();
  const removeSignerTx = useSwagAdminTx();

  const needsAdmin = state.isLoading ? 'Reading your roles…' : !state.isAdmin ? 'Needs ADMIN_ROLE on the collection.' : null;
  const needsSuper = state.isLoading ? 'Reading your roles…' : !state.isSuperAdmin ? 'Needs DEFAULT_ADMIN_ROLE (the Safe).' : null;

  const call = (fn: 'pause' | 'unpause') => encodeFunctionData({ abi: swag1155Abi, functionName: fn });
  const callWith = (fn: 'addAdmin' | 'removeAdmin' | 'addSigner' | 'removeSigner', address: Address) =>
    encodeFunctionData({ abi: swag1155Abi, functionName: fn, args: [address] });

  return (
    <div className="space-y-4">
      <ChainGate />

      <section className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-content-primary">Store</h2>
            <p className="mt-1 text-sm text-content-muted">
              {state.paused ? 'Paused. buy() and claim() revert until it is unpaused.' : 'Live. Buys and claims go through.'}
            </p>
          </div>
          {!state.isLoading && <Pill tone={state.paused ? 'pending' : 'confirmed'}>{state.paused ? 'Paused' : 'Live'}</Pill>}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {!state.paused && (
            <TxButton label="Pause store" pendingLabel="Pausing…" tx={pauseTx} onClick={() => pauseTx.run(call('pause'))} reason={needsAdmin} variant="secondary" />
          )}
          {state.paused && (
            <TxButton label="Unpause store" pendingLabel="Unpausing…" tx={unpauseTx} onClick={() => unpauseTx.run(call('unpause'))} reason={needsAdmin} />
          )}
        </div>
      </section>

      <section className={CARD}>
        <h2 className="font-semibold text-content-primary">Addresses</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-content-muted">Collection ({SWAG.name})</dt>
            <dd><HashChip hash={SWAG.address} kind="address" /></dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-content-muted">Treasury</dt>
            <dd>{state.treasury ? <HashChip hash={state.treasury} kind="address" /> : <span className="text-content-faint">…</span>}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-content-muted">Payment token (USDC, 6 decimals)</dt>
            <dd><HashChip hash={SWAG.usdc} kind="address" /></dd>
          </div>
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-content-faint">
          Every USDC sale is forwarded to the treasury in the same transaction. Changing it is a
          DEFAULT_ADMIN action and is done from the Safe, not from here.{' '}
          <a href={`${EXPLORER_URLS[SWAG.chainId]}/address/${SWAG.address}#writeContract`} target="_blank" rel="noopener noreferrer" className="text-eth-blue-text hover:underline">
            Contract on Basescan ↗
          </a>
        </p>
      </section>

      <section className={CARD}>
        <h2 className="font-semibold text-content-primary">Your roles</h2>
        <p className="mt-1 text-sm text-content-muted">
          {state.account ? <>Connected as <HashChip hash={state.account} kind="address" /></> : 'No wallet connected.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <RolePill held={state.isAdmin} label="ADMIN_ROLE" />
          <RolePill held={state.isSuperAdmin} label="DEFAULT_ADMIN_ROLE" />
          <RolePill held={state.isSigner} label="SIGNER_ROLE" />
        </div>
        {state.error && <p className="mt-2 text-xs text-signal-reverted">{state.error}</p>}
      </section>

      <section className={`${CARD} grid grid-cols-1 gap-6 lg:grid-cols-2`}>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-content-primary">Admins</h2>
            <p className="mt-1 text-sm text-content-muted">ADMIN_ROLE: caps, prices, pause, cancel vouchers, and this page.</p>
          </div>
          <AddressForm label="Add admin" actionLabel="Grant ADMIN_ROLE" pendingLabel="Granting…" tx={addAdminTx} reason={needsSuper} onSubmit={(a) => addAdminTx.run(callWith('addAdmin', a))} />
          <AddressForm label="Remove admin" actionLabel="Revoke ADMIN_ROLE" pendingLabel="Revoking…" tx={removeAdminTx} reason={needsSuper} onSubmit={(a) => removeAdminTx.run(callWith('removeAdmin', a))} />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-content-primary">Signers</h2>
            <p className="mt-1 text-sm text-content-muted">SIGNER_ROLE: the server key that signs claim vouchers. Grant the new one before rotating the key.</p>
          </div>
          <AddressForm label="Add signer" actionLabel="Grant SIGNER_ROLE" pendingLabel="Granting…" tx={addSignerTx} reason={needsSuper} onSubmit={(a) => addSignerTx.run(callWith('addSigner', a))} />
          <AddressForm label="Remove signer" actionLabel="Revoke SIGNER_ROLE" pendingLabel="Revoking…" tx={removeSignerTx} reason={needsSuper} onSubmit={(a) => removeSignerTx.run(callWith('removeSigner', a))} />
        </div>
      </section>
    </div>
  );
}

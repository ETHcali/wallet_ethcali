/**
 * The small parts every swag admin tab is built from.
 *
 * TxButton is the one way an onchain action is rendered here: it takes the
 * useSwagAdminTx instance that belongs to it, puts both pending flags on
 * `disabled`, and shows the reason it is disabled before any click, the error
 * after a failed one, and the hash after a good one — all under the button,
 * where the eye already is.
 */
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { Address } from 'viem';
import { CHAIN_IDS } from '../../config/constants';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useRequireChain } from '../../hooks/useRequireChain';
import { looksLikeAddressInput, resolveAddressInput, type SwagAdminTxResult } from '../../hooks/swag';
import { HashChip } from './HashChip';

export const FIELD =
  'w-full rounded-control border border-line-strong bg-surface-inset px-3 py-3 text-sm text-content-primary placeholder:text-content-faint focus:border-line-brand focus:outline-none disabled:text-content-faint';

export const LABEL = 'mb-1 block text-xs font-semibold text-content-secondary';

export const CARD = 'rounded-card border border-line-hairline bg-surface-slab p-4 sm:p-5';

const BUTTON: Record<'primary' | 'secondary', string> = {
  primary:
    'bg-eth-blue text-on-brand hover:bg-eth-blue-lift disabled:bg-surface-ridge disabled:text-content-faint',
  secondary:
    'border border-line-strong bg-transparent text-content-primary hover:border-line-brand hover:text-eth-blue-text disabled:border-line-hairline disabled:text-content-faint disabled:hover:text-content-faint',
};

export function buttonClass(variant: 'primary' | 'secondary' = 'primary', extra = ''): string {
  return `inline-flex min-h-tap items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${BUTTON[variant]} ${extra}`;
}

export function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}

export function Pill({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'brand' | 'confirmed' | 'pending' | 'reverted' }) {
  const cls = {
    muted: 'bg-surface-ridge text-content-secondary',
    brand: 'bg-eth-blue-wash text-eth-blue-text',
    confirmed: 'bg-signal-confirmed/15 text-signal-confirmed',
    pending: 'bg-signal-pending/15 text-signal-pending',
    reverted: 'bg-signal-reverted/15 text-signal-reverted',
  }[tone];
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${cls}`}>{children}</span>;
}

interface TxButtonProps {
  label: string;
  pendingLabel: string;
  tx: SwagAdminTxResult;
  onClick: () => unknown;
  /** A reason to disable beyond the wallet and chain checks (validation, role). */
  reason?: string | null;
  variant?: 'primary' | 'secondary';
  className?: string;
  /** Hide the hash chip (when the parent shows it elsewhere). */
  quiet?: boolean;
}

export function TxButton({ label, pendingLabel, tx, onClick, reason = null, variant = 'primary', className = '', quiet = false }: TxButtonProps) {
  const pending = tx.submitting || tx.cooldown;
  const why = reason ?? tx.blocked;
  const disabled = pending || Boolean(why);

  return (
    <div className={`min-w-0 ${className}`}>
      <button type="button" onClick={() => void onClick()} disabled={disabled} className={buttonClass(variant, 'w-full sm:w-auto')} title={why ?? undefined}>
        {pending && <Spinner />}
        {pending ? pendingLabel : label}
      </button>
      {!pending && why && <p className="mt-1 text-[11px] text-content-faint">{why}</p>}
      {tx.error && <p className="mt-1 text-xs text-signal-reverted">{tx.error}</p>}
      {!quiet && !tx.error && tx.txHash && (
        <p className="mt-1 text-xs text-content-muted">
          {tx.cooldown ? 'Confirming' : 'Confirmed'} <HashChip hash={tx.txHash} />
        </p>
      )}
    </div>
  );
}

/**
 * Rule 2: the wrong-network check comes before every action. When the wallet
 * is elsewhere this is the only primary button on the tab; when it is on Base
 * it renders nothing.
 */
export function ChainGate() {
  const { ready, authenticated, login } = usePrivy();
  const { wallet } = useActiveWallet();
  const chain = useRequireChain(CHAIN_IDS.BASE);

  if (!ready) return null;
  if (!authenticated) {
    return (
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
        <p className="text-sm text-content-muted">Sign in with the operator wallet to act on the collection.</p>
        <button type="button" onClick={login} className={buttonClass('primary')}>Sign in</button>
      </div>
    );
  }
  if (!wallet) {
    return <p className="text-sm text-content-muted">Waiting for the wallet…</p>;
  }
  if (chain.ready) return null;
  return (
    <div className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
      <p className="text-sm text-content-muted">
        The collection is on Base. Every button below signs there.
      </p>
      <div>
        <button type="button" onClick={() => void chain.switchTo()} disabled={chain.switching} className={buttonClass('primary')}>
          {chain.switching && <Spinner />}
          {chain.switching ? 'Switching…' : 'Switch to Base'}
        </button>
        {chain.error && <p className="mt-1 text-xs text-signal-reverted">{chain.error}</p>}
      </div>
    </div>
  );
}

interface AddressFormProps {
  label: string;
  actionLabel: string;
  pendingLabel: string;
  tx: SwagAdminTxResult;
  reason?: string | null;
  onSubmit: (address: Address) => Promise<unknown>;
}

/** One address in, one transaction out. Accepts 0x… or a mainnet .eth name. */
export function AddressForm({ label, actionLabel, pendingLabel, tx, reason = null, onSubmit }: AddressFormProps) {
  const [value, setValue] = useState('');
  const [resolving, setResolving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const typed = value.trim().length > 0;
  const valid = looksLikeAddressInput(value);
  const why = reason ?? (!typed ? 'Enter an address or a .eth name.' : !valid ? 'That is not an address or a .eth name.' : null);

  const submit = async () => {
    setLocalError(null);
    setResolving(true);
    try {
      const address = await resolveAddressInput(value);
      if (!address) {
        setLocalError('Could not resolve that name on mainnet.');
        return;
      }
      await onSubmit(address);
      setValue('');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className={LABEL}>{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setLocalError(null); }}
          placeholder="0x… or name.eth"
          spellCheck={false}
          autoComplete="off"
          className={`${FIELD} font-mono`}
          disabled={tx.submitting || tx.cooldown || resolving}
        />
      </label>
      {localError && <p className="text-xs text-signal-reverted">{localError}</p>}
      <TxButton label={actionLabel} pendingLabel={resolving ? 'Resolving…' : pendingLabel} tx={tx} onClick={submit} reason={why} variant="secondary" />
    </div>
  );
}

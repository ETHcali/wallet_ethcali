/**
 * The small parts every admin area is built from: fields, buttons, pills,
 * tabs, the confirm dialog, toasts, and the onchain TxButton / ChainGate.
 * New admin UI imports from here; it does not restyle its own.
 *
 * TxButton is the one way an onchain action is rendered here: it takes the
 * useSwagAdminTx instance that belongs to it, puts both pending flags on
 * `disabled`, and shows the reason it is disabled before any click, the error
 * after a failed one, and the hash after a good one — all under the button,
 * where the eye already is.
 */
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { Address } from 'viem';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useRequireChain } from '../../hooks/useRequireChain';
import { SWAG, looksLikeAddressInput, resolveAddressInput, type SwagAdminTxResult } from '../../hooks/swag';
import { HashChip } from '../shared/HashChip';
import { Sheet } from '../shared/Sheet';

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
 * is elsewhere this is the only primary button on the tab; when it is on the
 * collection's chain it renders nothing.
 */
export function ChainGate() {
  const { ready, authenticated, login } = usePrivy();
  const { wallet } = useActiveWallet();
  const chain = useRequireChain(SWAG.chainId);

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
        Your wallet is on another network. Every button below signs on {chain.chainName}.
      </p>
      <div>
        <button type="button" onClick={() => void chain.switchTo()} disabled={chain.switching} className={buttonClass('primary')}>
          {chain.switching && <Spinner />}
          {chain.switching ? 'Switching…' : `Switch to ${chain.chainName}`}
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

// ── Tabs ────────────────────────────────────────────────────────────────────

export interface TabDef<T extends string> {
  id: T;
  label: string;
  /** A small count beside the label, e.g. orders waiting. Hidden at 0. */
  count?: number;
}

/** The one tab row for every admin area. Scrolls sideways inside the gutter on a phone. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: readonly TabDef<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Accessible name of the tab list. */
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {tabs.map((t) => {
        const current = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={current}
            onClick={() => onChange(t.id)}
            className={`inline-flex min-h-tap shrink-0 items-center gap-2 rounded-control border px-4 text-sm font-semibold transition-colors ${
              current
                ? 'border-eth-blue bg-eth-blue-wash text-eth-blue-text'
                : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
            }`}
          >
            {t.label}
            {Boolean(t.count) && (
              <span className="rounded-full bg-surface-ridge px-2 py-0.5 font-mono text-[10px] text-content-primary">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Confirm ─────────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title: string;
  /** What happens, and what does not (e.g. "the refund itself happens in Shopify"). */
  body: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  /** Destructive actions get the quiet red; everything else the brand button. */
  danger?: boolean;
  /** When set, the confirm button stays disabled until this exact text is typed. */
  typeToConfirm?: string;
  /**
   * The action. The dialog owns its pending flag (cleared in finally) and
   * stays open, undismissable, while it runs; a throw is shown inside it.
   */
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
}

/**
 * The one confirmation for the admin, on the shared Sheet (bottom sheet on a
 * phone, centred dialog above). Replaces window.confirm, which some embedded
 * wallet browsers block outright.
 */
export function ConfirmDialog({ title, body, confirmLabel, pendingLabel, danger = false, typeToConfirm, onConfirm, onClose }: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const blocked = Boolean(typeToConfirm) && typed.trim() !== typeToConfirm;

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not go through.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Sheet onClose={onClose} label={title} dismissable={!pending}>
      <div className="space-y-4 p-5">
        <h2 className="text-lg font-bold text-content-primary">{title}</h2>
        <div className="text-sm leading-relaxed text-content-muted">{body}</div>
        {typeToConfirm && (
          <label className="block">
            <span className={LABEL}>
              Type <span className="font-mono text-content-primary">{typeToConfirm}</span> to confirm
            </span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} className={FIELD} disabled={pending} autoComplete="off" spellCheck={false} />
          </label>
        )}
        {error && <p className="text-xs text-signal-reverted">{error}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={pending} className={buttonClass('secondary')}>
            Keep it
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={pending || blocked}
            className={
              danger
                ? 'inline-flex min-h-tap items-center justify-center gap-2 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-4 text-sm font-semibold text-signal-reverted transition-colors hover:bg-signal-reverted/20 disabled:cursor-not-allowed disabled:opacity-50'
                : buttonClass('primary')
            }
          >
            {pending && <Spinner />}
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ── Toasts ──────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  text: string;
  tone: 'done' | 'error';
}

const ToastContext = createContext<(text: string, tone?: Toast['tone']) => void>(() => {});

/** Say what just happened, briefly, after a dialog or a row has closed. Inline errors stay inline. */
export const useToast = () => useContext(ToastContext);

/** Mounted once by AdminShell. Toasts stack bottom-centre, above the bulk bar, and leave on their own. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((text: string, tone: Toast['tone'] = 'done') => {
    const id = nextId.current++;
    setToasts((all) => [...all.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), tone === 'error' ? 8000 : 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <p
            key={t.id}
            role="status"
            className={`pointer-events-auto max-w-md rounded-control border bg-surface-slab px-4 py-3 text-sm ${
              t.tone === 'error' ? 'border-signal-reverted/40 text-signal-reverted' : 'border-line-strong text-content-primary'
            }`}
          >
            {t.text}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

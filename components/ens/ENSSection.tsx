import React, { useState } from 'react';
import { useENSAvailability, useENSMint, useUserENS } from '../../hooks/ens';
import { useRequireChain } from '../../hooks/useRequireChain';
import { ENS_CONFIG } from '../../config/constants';
import { ENS_CHAIN, explorerAddress, explorerTx } from '../../config/chains';
import { CheckIcon } from '../shared/icons';

interface ENSSectionProps {
  userAddress: string;
}

const Spinner = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <span
    className={`inline-block animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`}
    aria-hidden
  />
);

function truncate(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Claim and show the user's `<label>.ethcali.eth` name.
 *
 * The registrar exists on Base and nowhere else, which makes this the one
 * action the app signs off Ethereum. There is no network picker: the claim
 * button moves the wallet to Base right before signing through
 * `useRequireChain(ENS_CONFIG.chainId)`, and the transaction pins that chain.
 */
const ENSSection: React.FC<ENSSectionProps> = ({ userAddress }) => {
  const owner = userAddress as `0x${string}`;
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const chain = useRequireChain(ENS_CONFIG.chainId);
  const { register, phase, hash, error, reset } = useENSMint();
  const availability = useENSAvailability(input);

  // Once a claim confirms we know the label; the name query verifies it against
  // the registry before it is displayed, so a stale index cannot hide it.
  const justClaimed = phase === 'confirmed' ? availability.label : null;
  const { subdomain, fullName, node, isLoading } = useUserENS(userAddress, justClaimed);

  const busy = phase === 'submitting' || phase === 'confirming' || chain.switching;
  const canClaim = availability.status === 'available' && !busy;

  /** Switch to Base if the wallet is elsewhere, then register. One click, one primary action. */
  const claim = async () => {
    if (!canClaim) return;
    setSwitchError(null);
    if (!chain.ready) {
      const moved = await chain.switchTo();
      if (!moved) {
        setSwitchError(chain.error ?? `Could not switch to ${chain.chainName}.`);
        return;
      }
    }
    await register(availability.label, owner);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lowercase as they type; ENSIP-15 normalisation does the rest in the hook.
    setInput(e.target.value.toLowerCase().replace(/\s+/g, ''));
    if (phase === 'failed') reset();
  };

  const copyName = async () => {
    if (!fullName) return;
    try {
      await navigator.clipboard.writeText(fullName);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable; the name stays selectable.
    }
  };

  /* ── Has a name: emphasis card, the only glow the brand allows ── */
  if (subdomain && fullName && node) {
    return (
      <div
        className="rounded-card border border-line-brand bg-surface-slab p-5"
        style={{ boxShadow: '0 0 32px rgb(var(--eth-blue-rgb) / 0.2)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-content-muted">Your ethcali.eth name</h2>
            <p className="mb-0 mt-1 break-all font-mono text-xl font-medium text-eth-blue-text">
              {fullName}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-signal-confirmed/35 bg-signal-confirmed/10 px-3 py-1.5 text-xs font-semibold text-signal-confirmed">
            <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            Registered
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={copyName}
            className="inline-flex min-h-[44px] items-center justify-center rounded-control border border-line-strong px-3 text-sm font-semibold text-content-primary transition-colors duration-base hover:border-line-brand hover:text-eth-blue-text"
          >
            {copied ? 'Copied' : 'Copy name'}
          </button>
          <a
            href={`${explorerAddress(ENS_CONFIG.chainId, ENS_CONFIG.registry)}?a=${BigInt(node).toString()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-control border border-line-strong px-3 text-sm font-semibold text-content-primary transition-colors duration-base hover:border-line-brand hover:text-eth-blue-text"
          >
            View on explorer ↗
          </a>
        </div>

        <p className="mb-0 mt-4 text-xs text-content-faint">
          Registered on {ENS_CHAIN.name} as an NFT you own. Wallets that resolve ethcali.eth names there
          will show it; mainnet resolution switches on when ethcali.eth points at its L2 resolver.
        </p>
      </div>
    );
  }

  /* ── Loading: a static block, no shimmer ── */
  if (isLoading) {
    return (
      <div className="flex min-h-[96px] items-center justify-center gap-3 rounded-card border border-line-hairline bg-surface-slab text-sm text-content-muted">
        <Spinner className="h-4 w-4 text-eth-blue" />
        Checking your name…
      </div>
    );
  }

  /* ── Confirmed: status panel, then the card above takes over on refetch ── */
  if (phase === 'confirmed' && hash) {
    return (
      <div className="rounded-card border border-signal-confirmed/35 bg-surface-slab p-5">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-signal-confirmed/10 text-signal-confirmed">
          <CheckIcon className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h3 className="mt-4 text-xl font-bold text-content-primary">Your name is ready.</h3>
        <p className="mt-1 text-sm text-content-muted">
          <span className="font-mono text-eth-blue-text">{availability.label}.{ENS_CONFIG.parentName}</span>{' '}
          is registered to this wallet.
        </p>
        <a
          href={explorerTx(ENS_CONFIG.chainId, hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-mono text-xs text-eth-blue-text hover:underline"
        >
          {truncate(hash)} ↗
        </a>
      </div>
    );
  }

  /* ── Claim form ── */
  const statusLine = (() => {
    switch (availability.status) {
      case 'checking':
        return (
          <span className="inline-flex items-center gap-2 text-content-muted">
            <Spinner className="h-3 w-3" /> Checking…
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 text-signal-confirmed">
            <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} /> Available
          </span>
        );
      case 'taken':
        return <span className="text-content-muted">Already taken</span>;
      case 'invalid':
        return <span className="text-content-muted">{availability.reason}</span>;
      case 'error':
        return <span className="text-signal-reverted">{availability.reason}</span>;
      default:
        return null;
    }
  })();

  return (
    <div className="rounded-card border border-line-hairline bg-surface-slab p-5">
      <h2 className="text-lg font-bold text-content-primary">Your ethcali.eth name</h2>
      <p className="mb-0 mt-1 text-sm text-content-muted">Free, and yours to keep. One name per claim.</p>

      <label htmlFor="ens-label" className="mt-4 block text-sm font-medium text-content-secondary">
        Choose a name
      </label>
      <div
        className="mt-2 flex min-h-[52px] items-center rounded-control border border-line-strong bg-surface-inset px-4 transition-colors duration-base focus-within:border-eth-blue focus-within:ring-[3px] focus-within:ring-eth-blue-ring"
      >
        <input
          id="ens-label"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="yourname"
          value={input}
          onChange={handleInput}
          disabled={busy}
          maxLength={32}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-base text-content-primary outline-none placeholder:text-content-faint focus:shadow-none focus:ring-0 disabled:opacity-60"
        />
        <span className="shrink-0 pl-2 font-mono text-base text-content-faint">.{ENS_CONFIG.parentName}</span>
      </div>
      <div className="mt-2 min-h-[20px] text-xs">{statusLine}</div>

      {((phase === 'failed' && error) || switchError) && (
        <div className="mt-3 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 p-3 text-sm text-signal-reverted">
          {switchError ?? error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void claim()}
        disabled={!canClaim}
        className="mt-4 inline-flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-6 text-[15px] font-semibold text-on-brand transition-colors duration-base hover:bg-eth-blue-lift active:bg-eth-blue-deep disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint"
      >
        {chain.switching && (
          <>
            <Spinner /> Switching to {chain.chainName}…
          </>
        )}
        {phase === 'submitting' && (
          <>
            <Spinner /> Confirm in your wallet…
          </>
        )}
        {phase === 'confirming' && (
          <>
            <Spinner /> Registering…
          </>
        )}
        {!busy && (phase === 'failed' ? 'Try again' : 'Claim name')}
      </button>
      <p className="mb-0 mt-2 text-center text-xs text-content-faint">
        No fee, gas sponsored. Names live on {ENS_CHAIN.name}; we switch you there to sign.
      </p>
    </div>
  );
};

export default ENSSection;

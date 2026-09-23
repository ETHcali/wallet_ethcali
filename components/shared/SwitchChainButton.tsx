import React from 'react';
import type { RequireChainResult } from '../../hooks/useRequireChain';

interface SwitchChainButtonProps {
  /** The result of `useRequireChain(chainId)` owned by the calling feature. */
  chain: RequireChainResult;
  className?: string;
}

/**
 * The "Switch to <chain>" primary action. Rendered in place of the signing
 * button whenever `chain.ready` is false, so there is exactly one primary
 * action on screen and it is the one that unblocks the next step.
 *
 * It owns nothing: the caller keeps the `useRequireChain` instance, so the
 * pending state here is the same one the caller can read.
 */
const SwitchChainButton: React.FC<SwitchChainButtonProps> = ({ chain, className = '' }) => (
  <div className={className}>
    <button
      type="button"
      onClick={() => void chain.switchTo()}
      disabled={chain.switching || !chain.chain}
      className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-4 font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
    >
      {chain.switching && (
        <span
          className="inline-block h-4 w-4 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {chain.switching ? 'Switching…' : `Switch to ${chain.chainName}`}
    </button>
    {chain.error && <p className="mt-2 text-center text-xs text-signal-reverted">{chain.error}</p>}
  </div>
);

export default SwitchChainButton;

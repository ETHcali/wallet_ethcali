/**
 * VerifiedStep - Shows verification result and mint button
 */
import React from 'react';
import type { RequireChainResult } from '../../../hooks/useRequireChain';
import SwitchChainButton from '../../shared/SwitchChainButton';

interface VerifiedStepProps {
  uniqueIdentifier: `0x${string}` | null;
  isOver18: boolean;
  nationality: string | null;
  /** Wallet-vs-chain state from the verification hook. */
  chain: RequireChainResult;
  isMinting: boolean;
  errorMessage: string | null;
  onMint: () => void;
  onReset: () => void;
}

// Helper to mask unique identifier for privacy
const maskIdentifier = (uid: string): string => {
  if (!uid || uid.length < 12) return '***';
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
};

export const VerifiedStep: React.FC<VerifiedStepProps> = ({
  uniqueIdentifier,
  isOver18,
  nationality,
  chain,
  isMinting,
  errorMessage,
  onMint,
  onReset,
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-control border border-signal-confirmed/30 bg-signal-confirmed/10 px-4 py-3">
        <p className="mb-0 text-sm font-medium text-content-primary">Passport checked. One step left: mint.</p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="min-w-0">
            <dt className="text-content-muted">ID</dt>
            <dd className="truncate font-mono text-content-primary">{maskIdentifier(uniqueIdentifier ?? '')}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Age</dt>
            <dd className="font-mono text-content-primary">{isOver18 ? '18+' : '—'}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Nationality</dt>
            <dd className="font-mono text-content-primary">{nationality ?? '—'}</dd>
          </div>
        </dl>
      </div>

      {errorMessage && (
        <p role="alert" className="mb-0 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-4 py-3 text-sm text-signal-reverted">
          {errorMessage}
        </p>
      )}

      {/* One primary action: switch first, then mint */}
      {!chain.ready ? (
        <SwitchChainButton chain={chain} />
      ) : (
        <button type="button" onClick={onMint} disabled={isMinting} className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-5 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint">
          {isMinting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
          {isMinting ? 'Minting…' : 'Mint identity NFT'}
        </button>
      )}

      <button type="button" onClick={onReset} disabled={isMinting} className="flex min-h-[44px] w-full items-center justify-center rounded-control text-sm font-medium text-content-muted transition-colors hover:text-content-primary disabled:opacity-50">
        Start over
      </button>
    </div>
  );
};

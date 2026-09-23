/**
 * ErrorStep - Shows failed, rejected, or duplicate states
 */
import React from 'react';

interface ErrorStepProps {
  status: 'failed' | 'rejected' | 'duplicate';
  errorMessage: string | null;
  uniqueIdentifier: string | null;
  onReset: () => void;
}

// Helper to mask unique identifier for privacy
const maskIdentifier = (uid: string): string => {
  if (!uid || uid.length < 12) return '***';
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
};

export const ErrorStep: React.FC<ErrorStepProps> = ({
  status,
  errorMessage,
  uniqueIdentifier,
  onReset,
}) => {
  const duplicate = status === 'duplicate';
  return (
    <div className="space-y-3">
      <div
        role="alert"
        className={`rounded-control border px-4 py-3 text-sm ${
          duplicate ? 'border-signal-pending/30 bg-signal-pending/10' : 'border-signal-reverted/30 bg-signal-reverted/10'
        }`}
      >
        <p className={`mb-0 font-medium ${duplicate ? 'text-signal-pending' : 'text-signal-reverted'}`}>
          {duplicate
            ? 'This passport is already linked to another wallet.'
            : status === 'rejected'
              ? 'Verification was declined in the app.'
              : 'Verification failed.'}
        </p>
        {duplicate && uniqueIdentifier && (
          <p className="mb-0 mt-1 text-content-muted">
            ID <span className="font-mono">{maskIdentifier(uniqueIdentifier)}</span> — one passport, one identity NFT.
          </p>
        )}
        {!duplicate && errorMessage && <p className="mb-0 mt-1 text-content-muted">{errorMessage}</p>}
      </div>
      <button type="button" onClick={onReset} className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-5 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint">
        Try again
      </button>
    </div>
  );
};

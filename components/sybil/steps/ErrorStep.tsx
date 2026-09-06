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
  return `${uid.slice(0, 6)}...${uid.slice(-4)}`;
};

export const ErrorStep: React.FC<ErrorStepProps> = ({
  status,
  errorMessage,
  uniqueIdentifier,
  onReset,
}) => {
  if (status === 'duplicate') {
    return (
      <div className="space-y-3">
        <div className="bg-signal-pending/10 border border-signal-pending/30 rounded-chip p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-signal-pending rounded-full"></div>
            <span className="text-[10px] text-signal-pending font-mono tracking-wider">DUPLICATE</span>
          </div>
          <p className="text-[10px] text-signal-pending/70 font-mono">
            {uniqueIdentifier && `ID: ${maskIdentifier(uniqueIdentifier)}`}
          </p>
        </div>
        <button
          onClick={onReset}
          className="w-full py-2 text-[10px] text-content-faint hover:text-content-muted font-mono"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-signal-reverted/10 border border-signal-reverted/30 rounded-chip p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-signal-reverted rounded-full"></div>
          <span className="text-[10px] text-signal-reverted font-mono tracking-wider">
            {status === 'rejected' ? 'REJECTED' : 'ERROR'}
          </span>
        </div>
        {errorMessage && (
          <p className="text-[9px] text-signal-reverted/70 font-mono">{errorMessage}</p>
        )}
      </div>
      <button
        onClick={onReset}
        className="w-full py-2.5 bg-eth-blue/20 hover:bg-eth-blue/30 border border-eth-blue/40 rounded-chip text-eth-blue-text font-mono text-[10px] font-bold transition-all"
      >
        RETRY →
      </button>
    </div>
  );
};

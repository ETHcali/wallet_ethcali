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
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-[10px] text-yellow-400 font-mono tracking-wider">DUPLICATE</span>
          </div>
          <p className="text-[10px] text-yellow-400/70 font-mono">
            {uniqueIdentifier && `ID: ${maskIdentifier(uniqueIdentifier)}`}
          </p>
        </div>
        <button
          onClick={onReset}
          className="w-full py-2 text-[10px] text-gray-500 hover:text-gray-400 font-mono"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-[10px] text-red-400 font-mono tracking-wider">
            {status === 'rejected' ? 'REJECTED' : 'ERROR'}
          </span>
        </div>
        {errorMessage && (
          <p className="text-[9px] text-red-400/70 font-mono">{errorMessage}</p>
        )}
      </div>
      <button
        onClick={onReset}
        className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded text-cyan-400 font-mono text-[10px] font-bold transition-all"
      >
        RETRY →
      </button>
    </div>
  );
};

/**
 * MintingStep - Shows minting in progress
 */
import React from 'react';

export const MintingStep: React.FC = () => {
  return (
    <div className="flex items-center gap-3 rounded-control bg-surface-inset px-4 py-3">
      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-eth-blue border-t-transparent" aria-hidden />
      <div className="text-sm">
        <p className="mb-0 font-medium text-content-primary">Minting your identity NFT…</p>
        <p className="mb-0 text-content-muted">Confirm in your wallet if it asks.</p>
      </div>
    </div>
  );
};

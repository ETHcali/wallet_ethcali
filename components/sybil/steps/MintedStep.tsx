/**
 * MintedStep - Shows successful mint with transaction link
 */
import React from 'react';
import { explorerTx } from '../../../config/chains';

interface MintedStepProps {
  mintTxHash: string;
  chainId: number;
}

export const MintedStep: React.FC<MintedStepProps> = ({ mintTxHash, chainId }) => {
  const link = explorerTx(chainId, mintTxHash);
  const short = `${mintTxHash.slice(0, 6)}…${mintTxHash.slice(-4)}`;
  return (
    <div className="rounded-control border border-signal-confirmed/30 bg-signal-confirmed/10 px-4 py-3 text-sm">
      <p className="mb-0 font-medium text-content-primary">Minted. Your identity is on chain.</p>
      <p className="mb-0 mt-1 text-content-muted">
        Transaction{' '}
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="font-mono text-eth-blue-text hover:underline">
            {short} ↗
          </a>
        ) : (
          <span className="font-mono">{short}</span>
        )}
      </p>
    </div>
  );
};

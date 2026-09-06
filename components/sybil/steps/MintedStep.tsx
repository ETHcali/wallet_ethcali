/**
 * MintedStep - Shows successful mint with transaction link
 */
import React from 'react';
import { getExplorerUrl } from '../../../utils/contracts';

interface MintedStepProps {
  mintTxHash: string;
  chainId: number;
}

export const MintedStep: React.FC<MintedStepProps> = ({ mintTxHash, chainId }) => {
  return (
    <div className="bg-black/40 rounded-chip p-3 border border-eth-blue/20">
      <div className="text-[10px] text-content-faint font-mono mb-2 tracking-wider">TRANSACTION</div>
      <a
        href={getExplorerUrl(chainId, mintTxHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[9px] text-eth-blue-text hover:text-eth-blue-text font-mono block"
      >
        tx: {mintTxHash.slice(0, 10)}...{mintTxHash.slice(-6)} →
      </a>
    </div>
  );
};

/**
 * MintingStep - Shows minting in progress
 */
import React from 'react';

export const MintingStep: React.FC = () => {
  return (
    <div className="bg-black/40 rounded-chip p-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-eth-blue border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-eth-blue-text font-mono tracking-wider">MINTING...</span>
      </div>
      <p className="text-[9px] text-content-faint font-mono mt-2">Confirm transaction</p>
    </div>
  );
};

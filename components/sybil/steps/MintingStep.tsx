/**
 * MintingStep - Shows minting in progress
 */
import React from 'react';

export const MintingStep: React.FC = () => {
  return (
    <div className="bg-black/40 rounded p-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-cyan-400 font-mono tracking-wider">MINTING...</span>
      </div>
      <p className="text-[9px] text-gray-600 font-mono mt-2">CONFIRM_TX</p>
    </div>
  );
};

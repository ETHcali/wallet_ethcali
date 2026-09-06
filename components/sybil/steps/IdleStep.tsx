/**
 * IdleStep - Initial verification step with start button
 */
import React from 'react';

interface IdleStepProps {
  isClient: boolean;
  onStart: () => void;
}

export const IdleStep: React.FC<IdleStepProps> = ({ isClient, onStart }) => {
  return (
    <div className="space-y-3">
      {/* Compact Steps */}
      <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-content-faint">
        <div className="text-center p-2 bg-surface-slab/50 rounded-chip">
          <div className="text-eth-blue-text text-lg mb-1">1</div>
          <span>SCAN</span>
        </div>
        <div className="text-center p-2 bg-surface-slab/50 rounded-chip">
          <div className="text-eth-blue-text text-lg mb-1">2</div>
          <span>NFC</span>
        </div>
        <div className="text-center p-2 bg-surface-slab/50 rounded-chip">
          <div className="text-eth-blue-text text-lg mb-1">3</div>
          <span>FACE</span>
        </div>
        <div className="text-center p-2 bg-surface-slab/50 rounded-chip">
          <div className="text-eth-blue-text text-lg mb-1">4</div>
          <span>MINT</span>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!isClient}
        className="w-full py-3 bg-eth-blue/20 hover:bg-eth-blue/30 border border-eth-blue/50 rounded-chip text-eth-blue-text font-mono font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!isClient ? 'INIT...' : 'START →'}
      </button>
    </div>
  );
};

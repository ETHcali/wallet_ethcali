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
      <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-gray-500">
        <div className="text-center p-2 bg-gray-900/50 rounded">
          <div className="text-cyan-500 text-lg mb-1">1</div>
          <span>SCAN</span>
        </div>
        <div className="text-center p-2 bg-gray-900/50 rounded">
          <div className="text-cyan-500 text-lg mb-1">2</div>
          <span>NFC</span>
        </div>
        <div className="text-center p-2 bg-gray-900/50 rounded">
          <div className="text-cyan-500 text-lg mb-1">3</div>
          <span>FACE</span>
        </div>
        <div className="text-center p-2 bg-gray-900/50 rounded">
          <div className="text-cyan-500 text-lg mb-1">4</div>
          <span>MINT</span>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!isClient}
        className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 font-mono font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!isClient ? 'INIT...' : 'START →'}
      </button>
    </div>
  );
};

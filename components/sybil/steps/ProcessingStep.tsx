/**
 * ProcessingStep - Shows progress during verification
 */
import React from 'react';

interface ProcessingStepProps {
  requestReceived: boolean;
  generatingProof: boolean;
  proofsGenerated: number;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  requestReceived,
  generatingProof,
  proofsGenerated,
}) => {
  return (
    <div className="bg-black/40 rounded-chip p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-4 h-4 border-2 border-eth-blue border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-eth-blue-text font-mono tracking-wider">PROCESSING</span>
      </div>
      <div className="space-y-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${requestReceived ? 'bg-signal-confirmed' : 'bg-surface-ridge'}`}></div>
          <span className={requestReceived ? 'text-signal-confirmed' : 'text-content-faint'}>REQUEST</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${generatingProof ? 'bg-eth-blue animate-pulse' : 'bg-surface-ridge'}`}></div>
          <span className={generatingProof ? 'text-eth-blue-text' : 'text-content-faint'}>
            PROOF {proofsGenerated > 0 && `[${proofsGenerated}/4]`}
          </span>
        </div>
      </div>
    </div>
  );
};

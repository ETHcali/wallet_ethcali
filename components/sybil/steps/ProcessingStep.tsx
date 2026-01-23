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
    <div className="bg-black/40 rounded p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-cyan-400 font-mono tracking-wider">PROCESSING</span>
      </div>
      <div className="space-y-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${requestReceived ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <span className={requestReceived ? 'text-green-400' : 'text-gray-600'}>REQUEST</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${generatingProof ? 'bg-cyan-500 animate-pulse' : 'bg-gray-600'}`}></div>
          <span className={generatingProof ? 'text-cyan-400' : 'text-gray-600'}>
            PROOF {proofsGenerated > 0 && `[${proofsGenerated}/4]`}
          </span>
        </div>
      </div>
    </div>
  );
};

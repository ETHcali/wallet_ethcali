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
    <div className="space-y-3">
      <p className="mb-0 flex items-center gap-2 text-sm font-medium text-content-primary">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-eth-blue border-t-transparent" aria-hidden />
        Checking your passport…
      </p>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${requestReceived ? 'bg-signal-confirmed' : 'bg-surface-ridge'}`} aria-hidden />
          <span className={requestReceived ? 'text-content-primary' : 'text-content-faint'}>Request received by the app</span>
        </li>
        <li className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${generatingProof ? 'animate-pulse bg-eth-blue' : 'bg-surface-ridge'}`} aria-hidden />
          <span className={generatingProof ? 'text-content-primary' : 'text-content-faint'}>
            Building the proof{proofsGenerated > 0 && <span className="font-mono"> · {proofsGenerated}/4</span>}
          </span>
        </li>
      </ul>
    </div>
  );
};

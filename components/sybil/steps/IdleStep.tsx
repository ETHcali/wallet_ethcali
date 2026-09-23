/**
 * IdleStep - Initial verification step with start button
 */
import React from 'react';

interface IdleStepProps {
  isClient: boolean;
  onStart: () => void;
}

/** The four things the ZKPassport app will ask for, in order. */
const STEPS = [
  { title: 'Scan', detail: 'open the ZKPassport app with the code' },
  { title: 'Tap your passport', detail: 'the chip is read over NFC' },
  { title: 'Face check', detail: 'on your phone, never uploaded' },
  { title: 'Mint', detail: 'a soulbound NFT proves it, gas sponsored' },
];

export const IdleStep: React.FC<IdleStepProps> = ({ isClient, onStart }) => {
  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-eth-blue-wash font-mono text-xs text-eth-blue-text">
              {i + 1}
            </span>
            <span className="min-w-0 text-sm">
              <span className="font-medium text-content-primary">{step.title}</span>
              <span className="text-content-muted"> — {step.detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <button type="button" onClick={onStart} disabled={!isClient} className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-5 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint">
        {isClient ? 'Start verification' : 'Loading…'}
      </button>
    </div>
  );
};

/**
 * VerifiedStep - Shows verification result and mint button
 */
import React from 'react';
import { getNetworkName } from '../../../utils/contracts';

interface VerifiedStepProps {
  uniqueIdentifier: `0x${string}` | null;
  isOver18: boolean;
  nationality: string | null;
  chainId: number;
  isMinting: boolean;
  errorMessage: string | null;
  onMint: () => void;
  onReset: () => void;
}

// Helper to mask unique identifier for privacy
const maskIdentifier = (uid: string): string => {
  if (!uid || uid.length < 12) return '***';
  return `${uid.slice(0, 6)}...${uid.slice(-4)}`;
};

export const VerifiedStep: React.FC<VerifiedStepProps> = ({
  uniqueIdentifier,
  isOver18,
  nationality,
  chainId,
  isMinting,
  errorMessage,
  onMint,
  onReset,
}) => {
  return (
    <div className="space-y-3">
      {/* Success Badge */}
      <div className="flex items-center gap-2 p-2 bg-signal-confirmed/10 border border-signal-confirmed/30 rounded-chip">
        <div className="w-2 h-2 bg-signal-confirmed rounded-full"></div>
        <span className="text-[10px] text-signal-confirmed font-mono tracking-wider">VERIFIED</span>
      </div>

      {/* NFT Preview - Compact */}
      <div className="bg-eth-blue-wash border border-eth-blue/20 rounded-chip p-3">
        <div className="text-[10px] text-content-faint font-mono mb-2 tracking-wider">NFT traits</div>

        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between items-center py-1.5 border-b border-line-hairline">
            <span className="text-content-faint">uid</span>
            <span className="text-eth-blue-text">{maskIdentifier(uniqueIdentifier ?? '')}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-line-hairline">
            <span className="text-content-faint">age</span>
            <span className={isOver18 ? 'text-signal-confirmed' : 'text-content-faint'}>
              {isOver18 ? '18+' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-content-faint">nationality</span>
            <span className={nationality ? 'text-signal-confirmed' : 'text-content-faint'}>
              {nationality ?? 'N/A'}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-line-hairline">
          <span className="text-[9px] text-content-faint font-mono">
            {getNetworkName(chainId).toUpperCase()} • SOULBOUND
          </span>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="text-[10px] text-signal-reverted font-mono p-2 bg-signal-reverted/10 border border-signal-reverted/20 rounded-chip">
          {errorMessage}
        </div>
      )}

      {/* Mint Button */}
      <button
        onClick={onMint}
        disabled={isMinting}
        className="w-full py-3 bg-eth-blue hover:bg-eth-blue-lift rounded-chip text-on-brand font-mono font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isMinting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-signal-confirmed border-t-transparent rounded-full animate-spin"></div>
            MINTING...
          </span>
        ) : (
          'MINT →'
        )}
      </button>

      <button
        onClick={onReset}
        disabled={isMinting}
        className="w-full py-2 text-[10px] text-content-faint hover:text-content-muted font-mono disabled:opacity-50"
      >
        RESTART
      </button>
    </div>
  );
};

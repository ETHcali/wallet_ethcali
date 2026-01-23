/**
 * VerifiedStep - Shows verification result and mint button
 */
import React from 'react';
import { getNetworkName } from '../../../utils/contracts';

interface VerifiedStepProps {
  uniqueIdentifier: string;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
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
  faceMatchPassed,
  personhoodVerified,
  chainId,
  isMinting,
  errorMessage,
  onMint,
  onReset,
}) => {
  return (
    <div className="space-y-3">
      {/* Success Badge */}
      <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-[10px] text-green-400 font-mono tracking-wider">VERIFIED</span>
      </div>

      {/* NFT Preview - Compact */}
      <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border border-purple-500/20 rounded p-3">
        <div className="text-[10px] text-gray-500 font-mono mb-2 tracking-wider">NFT_TRAITS</div>

        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
            <span className="text-gray-500">uid</span>
            <span className="text-cyan-400">{maskIdentifier(uniqueIdentifier)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
            <span className="text-gray-500">face</span>
            <span className={faceMatchPassed ? 'text-green-400' : 'text-gray-600'}>
              {faceMatchPassed ? 'PASS' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-500">human</span>
            <span className={personhoodVerified ? 'text-green-400' : 'text-gray-600'}>
              {personhoodVerified ? 'TRUE' : 'FALSE'}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-800">
          <span className="text-[9px] text-gray-600 font-mono">
            {getNetworkName(chainId).toUpperCase()} • SOULBOUND
          </span>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="text-[10px] text-red-400 font-mono p-2 bg-red-500/10 border border-red-500/20 rounded">
          {errorMessage}
        </div>
      )}

      {/* Mint Button */}
      <button
        onClick={onMint}
        disabled={isMinting}
        className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-green-400 font-mono font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isMinting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            MINTING...
          </span>
        ) : (
          'MINT →'
        )}
      </button>

      <button
        onClick={onReset}
        disabled={isMinting}
        className="w-full py-2 text-[10px] text-gray-600 hover:text-gray-400 font-mono disabled:opacity-50"
      >
        RESTART
      </button>
    </div>
  );
};

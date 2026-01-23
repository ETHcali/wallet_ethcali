import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getNetworkName } from '../../utils/contracts';

interface NFTCardProps {
  chainId: number;
  alreadyHasNFT: boolean;
  isLoading: boolean;
  tokenId: bigint | null;
  tokenData: {
    uniqueIdentifier: string;
    faceMatchPassed: boolean;
    personhoodVerified: boolean;
  } | null;
  nftMetadata: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  } | null;
  onRefresh?: () => void;
}

const maskIdentifier = (uid: string): string => {
  if (!uid || uid.length < 12) return '***';
  return `${uid.slice(0, 6)}...${uid.slice(-4)}`;
};

const getIPFSImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${imageUrl.replace('ipfs://', '')}`;
  }
  return imageUrl;
};

const NFTCard: React.FC<NFTCardProps> = ({
  chainId,
  alreadyHasNFT,
  isLoading,
  tokenId,
  tokenData,
  nftMetadata,
  onRefresh,
}) => {
  // Always render - like swag page pattern
  return (
    <div className="bg-black/60 border border-green-500/40 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shadow-lg ${alreadyHasNFT ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div>
            <h2 className={`text-sm font-bold font-mono tracking-wide ${alreadyHasNFT ? 'text-green-400' : 'text-gray-400'}`}>
              {alreadyHasNFT ? 'VERIFIED' : 'NO_VERIFICATION'}
            </h2>
            <p className="text-gray-600 text-[10px] font-mono">{getNetworkName(chainId).toUpperCase()}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-2 py-1 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded text-gray-400 hover:text-cyan-400 font-mono text-[9px] transition-all disabled:opacity-50"
            title="Refresh"
          >
            {isLoading ? '⟳' : '↻'}
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-[10px] text-cyan-400 font-mono">CHECKING NFT...</span>
        </div>
      )}

      {/* NFT Content - ALWAYS show when has NFT */}
      {alreadyHasNFT && (
        <>
          {/* NFT Details - Always show something */}
          <div className="space-y-1.5 text-[10px] font-mono">
            {tokenId !== null && tokenId !== undefined && (
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-600">token_id</span>
                <span className="text-cyan-400">#{tokenId.toString()}</span>
              </div>
            )}
            {tokenData ? (
              <>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-600">uid</span>
                  <span className="text-cyan-400">{maskIdentifier(tokenData.uniqueIdentifier)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-600">face_match</span>
                  <span className={tokenData.faceMatchPassed ? 'text-green-400' : 'text-gray-600'}>
                    {tokenData.faceMatchPassed ? 'PASS' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">personhood</span>
                  <span className={tokenData.personhoodVerified ? 'text-green-400' : 'text-gray-600'}>
                    {tokenData.personhoodVerified ? 'VERIFIED' : 'FALSE'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">status</span>
                <span className="text-green-400">VERIFIED</span>
              </div>
            )}
          </div>

          {/* NFT Image */}
          {nftMetadata?.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-cyan-500/20 relative aspect-square">
              <Image 
                src={getIPFSImageUrl(nftMetadata.image)} 
                alt="ZKPassport NFT" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized={nftMetadata.image.startsWith('ipfs://')}
              />
            </div>
          )}

          {/* NFT Name */}
          {nftMetadata?.name && (
            <div className="mb-2">
              <h3 className="text-sm font-bold text-cyan-400 font-mono">{nftMetadata.name}</h3>
            </div>
          )}

          {/* NFT Description */}
          {nftMetadata?.description && (
            <div className="mb-2">
              <p className="text-[10px] text-gray-500 font-mono">{nftMetadata.description}</p>
            </div>
          )}


          {/* Attributes */}
          {nftMetadata?.attributes && nftMetadata.attributes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="text-[9px] text-gray-600 font-mono mb-2 tracking-wider">ATTRIBUTES</div>
              <div className="flex flex-wrap gap-1.5">
                {nftMetadata.attributes.map((attr: any, idx: number) => (
                  <div 
                    key={idx}
                    className="px-2 py-1 bg-gray-900/50 border border-gray-800 rounded text-[9px] font-mono"
                  >
                    <span className="text-gray-500">{attr.trait_type}:</span>{' '}
                    <span className="text-cyan-400">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/faucet"
            className="block w-full py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded text-green-400 font-mono text-xs font-bold text-center transition-all"
          >
            CLAIM_FAUCET →
          </Link>
        </>
      )}

      {/* Empty State - No NFT */}
      {!isLoading && !alreadyHasNFT && (
        <div className="text-center py-8">
          <div className="text-gray-600 text-[10px] font-mono mb-4">
            VERIFY YOUR IDENTITY TO MINT YOUR ZKPASSPORT NFT
          </div>
          <div className="text-gray-700 text-[9px] font-mono">
            • PRIVACY_FIRST • NO_KYC • SOULBOUND
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTCard;

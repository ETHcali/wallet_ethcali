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
    uniqueIdentifier: `0x${string}`;
    personhoodVerified: boolean;
    isOver18: boolean;
    nationality: string;
  } | null;
  nftMetadata: {
    name?: string;
    description?: string;
    image?: string;
    external_url?: string;
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

  // Handle ipfs:// protocol
  if (imageUrl.startsWith('ipfs://')) {
    const cid = imageUrl.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  // Handle IPFS gateway URLs that might need conversion
  if (imageUrl.includes('/ipfs/')) {
    const parts = imageUrl.split('/ipfs/');
    const cid = parts[parts.length - 1];
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  // Already an HTTP/HTTPS URL
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
  // Determine display state: prioritize showing NFT if minted, only show loading on initial fetch
  const showNFTContent = alreadyHasNFT;
  const showEmptyState = !isLoading && !alreadyHasNFT;
  const showInitialLoading = isLoading && !alreadyHasNFT;

  return (
    <div className="bg-black/60 border border-line-hairline rounded-control p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full  ${alreadyHasNFT ? 'bg-signal-confirmed animate-pulse' : isLoading ? 'bg-signal-pending animate-pulse' : 'bg-surface-ridge'}`}></div>
          <div>
            <h2 className={`text-sm font-bold font-mono tracking-wide ${alreadyHasNFT ? 'text-signal-confirmed' : isLoading ? 'text-signal-pending' : 'text-content-muted'}`}>
              {alreadyHasNFT ? 'VERIFIED' : isLoading ? 'CHECKING...' : 'NO_VERIFICATION'}
            </h2>
            <p className="text-content-faint text-[10px] font-mono">{getNetworkName(chainId).toUpperCase()}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`px-2 py-1 bg-surface-inset/50 hover:bg-surface-ridge/50 border border-line-hairline rounded-chip text-content-muted hover:text-eth-blue-text font-mono text-[9px] transition-all disabled:opacity-50 ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh"
          >
            ↻
          </button>
        )}
      </div>

      {/* Initial Loading State - Only show when we don't have NFT data yet */}
      {showInitialLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-eth-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-[10px] text-eth-blue-text font-mono">CHECKING NFT...</span>
        </div>
      )}

      {/* NFT Content - ALWAYS show when has NFT (even during refetch) */}
      {showNFTContent && (
        <>
          {/* NFT Image */}
          {nftMetadata?.image && (
            <div className="mb-3 rounded-control overflow-hidden border border-eth-blue/20 relative aspect-square bg-surface-slab/50">
              <Image
                src={getIPFSImageUrl(nftMetadata.image)}
                alt={nftMetadata?.name || 'ZKPassport NFT'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized={nftMetadata.image.includes('ipfs') || nftMetadata.image.includes('pinata')}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* NFT Name */}
          {nftMetadata?.name && (
            <div className="mb-2">
              <h3 className="text-sm font-bold text-eth-blue-text font-mono">{nftMetadata.name}</h3>
            </div>
          )}

          {/* NFT Description */}
          {nftMetadata?.description && (
            <div className="mb-2">
              <p className="text-[10px] text-content-faint font-mono">{nftMetadata.description}</p>
            </div>
          )}

          {/* External URL */}
          {nftMetadata?.external_url && (
            <div className="mb-3">
              <a
                href={nftMetadata.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-eth-blue-text hover:text-eth-blue-text font-mono underline"
              >
                View on website →
              </a>
            </div>
          )}

          {/* NFT Details */}
          <div className="space-y-1.5 text-[10px] font-mono">
            {tokenId !== null && tokenId !== undefined && (
              <div className="flex justify-between py-1 border-b border-line-hairline">
                <span className="text-content-faint">token_id</span>
                <span className="text-eth-blue-text">#{tokenId.toString()}</span>
              </div>
            )}
            {tokenData ? (
              <>
                <div className="flex justify-between py-1 border-b border-line-hairline">
                  <span className="text-content-faint">uid</span>
                  <span className="text-eth-blue-text">{maskIdentifier(tokenData.uniqueIdentifier)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line-hairline">
                  <span className="text-content-faint">age</span>
                  <span className={tokenData.isOver18 ? 'text-signal-confirmed' : 'text-signal-pending'}>
                    {tokenData.isOver18 ? '18+' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-content-faint">nationality</span>
                  <span className="text-eth-blue-text">
                    {tokenData.nationality || 'N/A'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1">
                <span className="text-content-faint">status</span>
                <span className="text-signal-confirmed">VERIFIED</span>
              </div>
            )}
          </div>

          {/* Attributes */}
          {nftMetadata?.attributes && nftMetadata.attributes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-line-hairline">
              <div className="text-[9px] text-content-faint font-mono mb-2 tracking-wider">ATTRIBUTES</div>
              <div className="flex flex-wrap gap-1.5">
                {nftMetadata.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-1 bg-surface-slab/50 border border-line-hairline rounded-chip text-[9px] font-mono"
                  >
                    <span className="text-content-faint">{attr.trait_type}:</span>{' '}
                    <span className="text-eth-blue-text">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/faucet"
            className="block w-full py-2.5 bg-eth-blue hover:bg-eth-blue-lift rounded-chip text-on-brand font-mono text-xs font-bold text-center transition-all"
          >
            CLAIM_FAUCET →
          </Link>
        </>
      )}

      {/* Empty State - No NFT (only show after loading completes with no NFT) */}
      {showEmptyState && (
        <div className="text-center py-8">
          <div className="text-content-faint text-[10px] font-mono mb-4">
            VERIFY YOUR IDENTITY TO MINT YOUR ZKPassport NFT
          </div>
          <div className="text-content-faint text-[9px] font-mono">
            • Privacy first • No KYC • SOULBOUND
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTCard;

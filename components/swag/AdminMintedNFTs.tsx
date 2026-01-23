import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useAllMintedNFTs, useMarkRedemptionFulfilled, RedemptionStatus } from '../../hooks/swag';
import type { MintedNFT } from '../../hooks/swag';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { useSwagAddresses } from '../../utils/network';
import { AdminQRScanner } from './AdminQRScanner';
import { AdminNFTFulfillmentModal } from './AdminNFTFulfillmentModal';
import { logger } from '../../utils/logger';

type FilterStatus = 'all' | 'pending' | 'fulfilled' | 'not-redeemed';

const statusLabels: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'Not Redeemed',
  [RedemptionStatus.PendingFulfillment]: 'Pending Fulfillment',
  [RedemptionStatus.Fulfilled]: 'Fulfilled',
};

const statusColors: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'bg-slate-500/10 text-slate-400',
  [RedemptionStatus.PendingFulfillment]: 'bg-yellow-500/10 text-yellow-400',
  [RedemptionStatus.Fulfilled]: 'bg-green-500/10 text-green-400',
};

interface AdminMintedNFTsProps {
  urlTokenId?: bigint;
  urlOwner?: string;
  urlChainId?: number;
}

export function AdminMintedNFTs({ 
  urlTokenId, 
  urlOwner, 
  urlChainId 
}: AdminMintedNFTsProps = {}) {
  const { explorerUrl, chainId: currentChainId, swag1155 } = useSwagAddresses();
  // Use swag1155 as the Design address (in new system, each Design is a separate contract)
  const designAddress = swag1155 || '';
  const chainId = urlChainId || currentChainId;
  
  const { mintedNFTs, isLoading, error, refetch } = useAllMintedNFTs(designAddress, chainId);
  const { markRedemptionFulfilled, canMarkFulfilled } = useMarkRedemptionFulfilled(designAddress, chainId);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchOwner, setSearchOwner] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<{
    tokenId: string;
    owner: string;
    chainId: number;
    contract: string;
    status: number;
  } | null>(null);
  const [fulfillmentModalNft, setFulfillmentModalNft] = useState<MintedNFT | null>(null);

  const filteredNFTs = useMemo(() => {
    return mintedNFTs.filter((nft) => {
      // Status filter
      if (filterStatus === 'pending' && nft.redemptionStatus !== RedemptionStatus.PendingFulfillment) {
        return false;
      }
      if (filterStatus === 'fulfilled' && nft.redemptionStatus !== RedemptionStatus.Fulfilled) {
        return false;
      }
      if (filterStatus === 'not-redeemed' && nft.redemptionStatus !== RedemptionStatus.NotRedeemed) {
        return false;
      }

      // Owner search filter
      if (searchOwner && !nft.owner.toLowerCase().includes(searchOwner.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [mintedNFTs, filterStatus, searchOwner]);

  // Handle URL parameters - show modal when URL params are provided
  useEffect(() => {
    if (urlTokenId && urlOwner && !fulfillmentModalNft && mintedNFTs.length > 0) {
      // Validate chain ID if provided
      if (urlChainId && urlChainId !== currentChainId) {
        logger.warn('Chain ID mismatch', { urlChainId, currentChainId });
        // Still try to find the NFT, but warn about chain mismatch
      }

      // Refetch latest data before opening modal to ensure fresh status
      refetch();

      // Find matching NFT
      const matchingNFT = mintedNFTs.find(
        (nft) =>
          nft.tokenId.toString() === urlTokenId.toString() &&
          nft.owner.toLowerCase() === urlOwner.toLowerCase()
      );

      if (matchingNFT) {
        logger.debug('Found matching NFT from URL params', { tokenId: matchingNFT.tokenId.toString(), owner: matchingNFT.owner });
        setFulfillmentModalNft(matchingNFT);
        // Auto-filter to pending for better visibility
        if (matchingNFT.redemptionStatus === RedemptionStatus.PendingFulfillment) {
          setFilterStatus('pending');
        }
      } else {
        logger.warn('No matching NFT found for URL params', { urlTokenId: urlTokenId?.toString(), urlOwner });
      }
    }
  }, [urlTokenId, urlOwner, urlChainId, mintedNFTs, currentChainId, fulfillmentModalNft, refetch]);

  const handleMarkFulfilled = async (nft: MintedNFT) => {
    const key = `${nft.tokenId.toString()}-${nft.owner}`;
    setProcessingIds((prev) => new Set(prev).add(key));

    try {
      await markRedemptionFulfilled(nft.tokenId, nft.owner);
      refetch();
      setScannedData(null);
      setFulfillmentModalNft(null); // Close modal after fulfillment
    } catch (err) {
      logger.error('Failed to mark fulfilled', err);
      alert(err instanceof Error ? err.message : 'Failed to mark as fulfilled');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleModalFulfill = async (_tokenId: bigint, _owner: string) => {
    const nft = fulfillmentModalNft;
    if (!nft) return;

    await handleMarkFulfilled(nft);
  };

  const handleQRScan = async (data: string) => {
    logger.debug('Received QR scan data', { data: data?.substring(0, 100) });

    if (!data || typeof data !== 'string') {
      logger.error('Invalid scan data', { data });
      alert('Invalid QR code format.');
      return;
    }

    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://') || data.startsWith('/')) {
      logger.debug('QR code contains URL, navigating', { url: data });
      setIsQRScannerOpen(false);
      
      // Extract relative path if it's a full URL
      let url = data;
      if (data.startsWith('http://') || data.startsWith('https://')) {
        try {
          const urlObj = new URL(data);
          url = urlObj.pathname + urlObj.search;
        } catch (e) {
          logger.error('Invalid URL in QR code', e);
          alert('Invalid URL in QR code.');
          return;
        }
      }
      
      // Navigate to the URL (will trigger URL parameter handling)
      window.location.href = url;
      return;
    }

    // Otherwise, try to parse as JSON (backward compatibility)
    try {
      const parsed = JSON.parse(data);
      logger.debug('Parsed QR data as JSON', { tokenId: parsed.tokenId, owner: parsed.owner });
      
      if (
        parsed.tokenId &&
        parsed.owner &&
        parsed.chainId &&
        parsed.contract &&
        parsed.status === RedemptionStatus.PendingFulfillment
      ) {
        // Validate contract matches current chain
        if (parsed.chainId === currentChainId && parsed.contract.toLowerCase() === swag1155?.toLowerCase()) {
          setScannedData(parsed);
          setIsQRScannerOpen(false);
          
          // Refetch latest data before showing modal to ensure fresh status
          await refetch();
          
          // Find matching NFT and show modal (data will be fresh after refetch completes)
          // Note: React Query will update mintedNFTs after refetch, but we need to find from current state
          // The useEffect will handle opening the modal once fresh data arrives
          const matchingNFT = mintedNFTs.find(
            (nft) =>
              nft.tokenId.toString() === parsed.tokenId.toString() &&
              nft.owner.toLowerCase() === parsed.owner.toLowerCase()
          );

          if (matchingNFT) {
            if (matchingNFT.redemptionStatus === RedemptionStatus.PendingFulfillment) {
              logger.debug('Found matching NFT from JSON QR, showing modal', { tokenId: matchingNFT.tokenId.toString() });
              setFulfillmentModalNft(matchingNFT);
            } else {
              const statusText = matchingNFT.redemptionStatus === RedemptionStatus.Fulfilled 
                ? 'already fulfilled' 
                : 'not yet redeemed';
              alert(`This NFT is ${statusText}. Current status: ${statusLabels[matchingNFT.redemptionStatus]}`);
            }
          } else {
            logger.warn('No matching NFT found from QR scan', {
              tokenId: parsed.tokenId,
              owner: parsed.owner,
              availableNFTs: mintedNFTs.length
            });
            alert(`NFT with Token ID ${parsed.tokenId} and owner ${parsed.owner.slice(0, 6)}... not found. Please refresh the page.`);
          }
        } else {
          logger.warn('Chain/contract mismatch in QR code', {
            scannedChainId: parsed.chainId,
            currentChainId
          });
          alert('QR code is for a different contract or chain. Please ensure you are on the correct network.');
        }
      } else {
        logger.warn('Invalid QR code format', { parsed });
        alert('Invalid redemption QR code format. Expected JSON with tokenId, owner, chainId, contract, and status.');
      }
    } catch (err) {
      // Not valid JSON or URL
      logger.error('QR parse error', { error: err, dataPreview: data?.substring(0, 50) });
      alert(`Invalid QR code format. Expected a URL or JSON data. Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading minted NFTs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading minted NFTs: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingCount = mintedNFTs.filter((n) => n.redemptionStatus === RedemptionStatus.PendingFulfillment).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Minted NFTs</h2>
          <p className="text-sm text-slate-500">
            {mintedNFTs.length} total NFTs minted
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-400">({pendingCount} pending fulfillment)</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20 transition"
            >
              Scan QR Code
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'fulfilled', 'not-redeemed'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {status === 'all' && 'All'}
              {status === 'pending' && 'Pending'}
              {status === 'fulfilled' && 'Fulfilled'}
              {status === 'not-redeemed' && 'Not Redeemed'}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by owner address..."
            value={searchOwner}
            onChange={(e) => setSearchOwner(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {filteredNFTs.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          No NFTs found matching your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredNFTs.map((nft) => {
                const key = `${nft.tokenId.toString()}-${nft.owner}`;
                const isProcessing = processingIds.has(key);

                return (
                  <tr key={key} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {nft.metadata?.image && (
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700">
                            <Image
                              src={getIPFSGatewayUrl(nft.metadata.image)}
                              alt={nft.metadata?.name || 'NFT'}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">
                            {nft.metadata?.name || `Token ${nft.tokenId.toString().slice(-6)}`}
                          </p>
                          <span className="font-mono text-xs text-slate-500">
                            #{nft.tokenId.toString().slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`${explorerUrl}/address/${nft.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition"
                      >
                        {truncateAddress(nft.owner)}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{nft.size || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">{nft.balance}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[nft.redemptionStatus]}`}>
                        {statusLabels[nft.redemptionStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {nft.redemptionStatus === RedemptionStatus.PendingFulfillment && (
                        <button
                          onClick={() => handleMarkFulfilled(nft)}
                          disabled={isProcessing || !canMarkFulfilled}
                          className="rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-1">
                              <div className="h-3 w-3 animate-spin rounded-full border border-green-400 border-t-transparent" />
                              Processing...
                            </span>
                          ) : (
                            'Mark Fulfilled'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Scanner Modal */}
      {isQRScannerOpen && (
        <AdminQRScanner
          onScan={handleQRScan}
          onClose={() => setIsQRScannerOpen(false)}
        />
      )}

      {/* Fulfillment Modal */}
      {fulfillmentModalNft && (
        <AdminNFTFulfillmentModal
          nft={fulfillmentModalNft}
          onClose={() => setFulfillmentModalNft(null)}
          onFulfill={handleModalFulfill}
          isProcessing={processingIds.has(`${fulfillmentModalNft.tokenId.toString()}-${fulfillmentModalNft.owner}`)}
        />
      )}

      {/* Scanned Data Confirmation */}
      {scannedData && (
        <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">QR Code Scanned Successfully</p>
              <p className="text-xs text-slate-400 mt-1">
                Token ID: {scannedData.tokenId} | Owner: {scannedData.owner.slice(0, 6)}...{scannedData.owner.slice(-4)}
              </p>
            </div>
            <button
              onClick={() => setScannedData(null)}
              className="text-green-400 hover:text-green-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

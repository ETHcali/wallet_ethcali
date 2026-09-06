import { useState } from 'react';
import Image from 'next/image';
import { useWallets } from '@privy-io/react-auth';
import { UserNFT } from '../../hooks/useUserNFTs';
import { RedemptionStatus } from '../../types/swag';
import { NFTQRModal } from './NFTQRModal';
import { useRedeem } from '../../hooks/useRedemption';
import { useVariantUri } from '../../hooks/swag';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { useSwagAddresses } from '../../utils/network';
import { logger } from '../../utils/logger';
import type { Swag1155Metadata } from '../../types/swag';

interface NFTCardProps {
  nft: UserNFT;
  onRedeemSuccess?: () => void;
}

const statusLabels: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'Not Redeemed',
  [RedemptionStatus.PendingFulfillment]: 'Pending Fulfillment',
  [RedemptionStatus.Fulfilled]: 'Fulfilled',
};

const statusColors: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'bg-surface-ridge/10 text-content-muted border-line-strong',
  [RedemptionStatus.PendingFulfillment]: 'bg-signal-pending/10 text-signal-pending border-signal-pending/30',
  [RedemptionStatus.Fulfilled]: 'bg-signal-confirmed/10 text-signal-confirmed border-signal-confirmed/30',
};

export function NFTCard({ nft, onRedeemSuccess }: NFTCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const { wallets: _wallets } = useWallets();
  const { chainId: defaultChainId } = useSwagAddresses();
  
  // Use designAddress and chainId from NFT, or fallback to defaults
  const designAddress = nft.designAddress;
  const chainId = nft.chainId || defaultChainId;

  // Fetch metadata URI from contract
  const { uri } = useVariantUri(designAddress || '', chainId, Number(nft.tokenId));
  const [metadata, setMetadata] = useState<Swag1155Metadata | null>(null);
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  if (uri && !metadataLoaded) {
    setMetadataLoaded(true);
    const url = getIPFSGatewayUrl(uri) || uri;
    fetch(url)
      .then(r => r.json())
      .then(data => setMetadata(data as Swag1155Metadata))
      .catch(() => {});
  }

  // Only initialize useRedeem if we have designAddress
  const { redeem, canRedeem } = useRedeem(designAddress || '', chainId);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!designAddress) {
      alert('Design address not available for this NFT');
      return;
    }
    
    if (!canRedeem || nft.redemptionStatus !== RedemptionStatus.NotRedeemed) {
      return;
    }

    setIsRedeeming(true);
    try {
      await redeem(nft.tokenId);
      // Wait a moment for blockchain state to update, then refetch
      setTimeout(() => {
        onRedeemSuccess?.();
        setIsRedeeming(false);
      }, 2000);
    } catch (error) {
      logger.error('Error redeeming NFT:', error);
      alert(error instanceof Error ? error.message : 'Failed to redeem NFT');
      setIsRedeeming(false);
    }
  };

  // Use image from metadata URI, fallback to NFT metadata image
  const imageUrl = metadata?.image
    ? getIPFSGatewayUrl(metadata.image) || metadata.image
    : (nft.image ? getIPFSGatewayUrl(nft.image) || nft.image : '');

  // Use name and description from metadata URI, fallback to NFT metadata
  const displayName = metadata?.name || nft.name;
  const displayDescription = metadata?.description || nft.description;

  return (
    <>
      <div className="nft-card">
        <div className="nft-card-header">
          <div className="nft-image-wrapper">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={displayName}
                fill
                className="nft-image"
                sizes="120px"
                unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
              />
            ) : (
              <div className="nft-image-placeholder" />
            )}
          </div>
          <div className="nft-header-info">
            <h3 className="nft-name">{displayName}</h3>
            <div className="nft-balance">
              <span className="balance-label">Balance:</span>
              <span className="balance-value">{nft.balance}</span>
            </div>
            <div className={`nft-status ${statusColors[nft.redemptionStatus]}`}>
              {statusLabels[nft.redemptionStatus]}
            </div>
          </div>
        </div>

        {displayDescription && (
          <p className="nft-description">{displayDescription}</p>
        )}

        <div className="nft-actions">
          {nft.redemptionStatus === RedemptionStatus.NotRedeemed && (
            <button
              onClick={handleRedeem}
              disabled={!canRedeem || isRedeeming || !designAddress}
              className="action-btn redeem-btn"
            >
              {isRedeeming ? 'Processing...' : !designAddress ? 'Design Address Missing' : 'Redeem Physical Item'}
            </button>
          )}

          {nft.redemptionStatus === RedemptionStatus.PendingFulfillment && (
            <button
              onClick={() => setShowQRModal(true)}
              className="action-btn qr-btn"
            >
              Show QR Code
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="action-btn details-btn"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {isExpanded && (
          <div className="nft-details">
            <div className="detail-row">
              <span className="detail-label">Token ID:</span>
              <span className="detail-value font-mono">#{nft.tokenId.toString()}</span>
            </div>

            {/* Show attributes from metadata URI if available */}
            {metadata?.attributes && metadata.attributes.length > 0 && (
              <div className="nft-attributes">
                <div className="attributes-header">Attributes</div>
                <div className="attributes-grid">
                  {metadata.attributes.map((attr, idx) => (
                    <div key={idx} className="attribute-item">
                      <span className="attribute-type">{attr.trait_type}:</span>
                      <span className="attribute-value">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback to NFT metadata attributes */}
            {!metadata?.attributes && nft.attributes && nft.attributes.length > 0 && (
              <div className="nft-attributes">
                <div className="attributes-header">Attributes</div>
                <div className="attributes-grid">
                  {nft.attributes.map((attr, idx) => (
                    <div key={idx} className="attribute-item">
                      <span className="attribute-type">{attr.trait_type}:</span>
                      <span className="attribute-value">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showQRModal && (
        <NFTQRModal
          tokenId={nft.tokenId}
          nftName={displayName}
          onClose={() => setShowQRModal(false)}
        />
      )}

      <style jsx>{`
        .nft-card {
          background: var(--surface-slab);
          border: 1px solid var(--line-hairline);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .nft-card:hover {
          border-color: rgb(var(--eth-blue-rgb) / 0.4);
        }

        .nft-card-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .nft-image-wrapper {
          flex-shrink: 0;
          width: 120px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--line-hairline);
          background: rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .nft-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }

        .nft-image-placeholder {
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nft-header-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nft-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0;
        }

        .nft-balance {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .balance-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .balance-value {
          color: var(--eth-blue);
          font-weight: 600;
          font-size: 1rem;
        }

        .nft-status {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid;
          width: fit-content;
        }

        .nft-description {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .nft-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .redeem-btn {
          background: rgb(var(--eth-blue-rgb) / 0.1);
          color: var(--eth-blue-text);
          border-color: rgb(var(--eth-blue-rgb) / 0.3);
        }

        .redeem-btn:hover:not(:disabled) {
          background: rgb(var(--eth-blue-rgb) / 0.2);
          border-color: rgb(var(--eth-blue-rgb) / 0.5);
        }

        .redeem-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qr-btn {
          background: rgb(var(--signal-pending-rgb) / 0.1);
          color: var(--signal-pending);
          border-color: rgb(var(--signal-pending-rgb) / 0.3);
        }

        .qr-btn:hover {
          background: rgb(var(--signal-pending-rgb) / 0.2);
          border-color: rgb(var(--signal-pending-rgb) / 0.5);
        }

        .details-btn {
          background: var(--line-hairline);
          color: var(--text-muted);
          border-color: var(--line-hairline);
        }

        .details-btn:hover {
          background: var(--line-hairline);
          border-color: var(--surface-ridge);
        }

        .nft-details {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--line-hairline);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .detail-value {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .nft-attributes {
          margin-top: 1rem;
        }

        .attributes-header {
          font-size: 0.75rem;
          color: var(--text-faint);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .attributes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.5rem;
        }

        .attribute-item {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--line-hairline);
          border-radius: 6px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .attribute-type {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .attribute-value {
          font-size: 0.875rem;
          color: var(--eth-blue-text);
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .nft-card-header {
            flex-direction: column;
          }

          .nft-image-wrapper {
            width: 100%;
            height: 200px;
          }

          .nft-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }

          .attributes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

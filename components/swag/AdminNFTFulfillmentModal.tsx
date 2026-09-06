import { useState } from 'react';
import Image from 'next/image';
import { RedemptionStatus } from '../../hooks/swag';
import type { MintedNFT } from '../../hooks/swag';
import { logger } from '../../utils/logger';
import { getIPFSGatewayUrl } from '../../lib/pinata';

interface AdminNFTFulfillmentModalProps {
  nft: MintedNFT;
  onClose: () => void;
  onFulfill: (tokenId: bigint, owner: string) => Promise<void>;
  isProcessing?: boolean;
}

const statusLabels: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'Not Redeemed',
  [RedemptionStatus.PendingFulfillment]: 'Pending Fulfillment',
  [RedemptionStatus.Fulfilled]: 'Fulfilled',
};

const statusColors: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'bg-surface-ridge/10 text-content-muted',
  [RedemptionStatus.PendingFulfillment]: 'bg-signal-pending/10 text-signal-pending',
  [RedemptionStatus.Fulfilled]: 'bg-signal-confirmed/10 text-signal-confirmed',
};

export function AdminNFTFulfillmentModal({ 
  nft, 
  onClose, 
  onFulfill, 
  isProcessing = false 
}: AdminNFTFulfillmentModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFulfill = async () => {
    if (nft.redemptionStatus !== RedemptionStatus.PendingFulfillment) {
      alert('This NFT is not pending fulfillment.');
      return;
    }

    setIsConfirming(true);
    try {
      await onFulfill(nft.tokenId, nft.owner);
      // Modal will be closed by parent component after successful fulfillment
    } catch (error) {
      logger.error('Error fulfilling NFT:', error);
      setIsConfirming(false);
    }
  };

  const imageUrl = nft.metadata?.image ? getIPFSGatewayUrl(nft.metadata.image) : '/logo_eth_cali.png';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>FULFILL REDEMPTION</h3>
          <button onClick={onClose} className="close-button" disabled={isConfirming || isProcessing}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* NFT Image */}
          <div className="nft-image-section">
            <div className="nft-image-wrapper">
              <Image
                src={imageUrl}
                alt={nft.metadata?.name || 'NFT'}
                width={200}
                height={200}
                className="nft-image"
                unoptimized={nft.metadata?.image?.startsWith('ipfs://')}
              />
            </div>
          </div>

          {/* NFT Details */}
          <div className="nft-details-section">
            <h4 className="nft-name">
              {nft.metadata?.name || `Token #${nft.tokenId.toString().slice(-6)}`}
            </h4>
            
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Token ID:</span>
                <span className="detail-value font-mono">#{nft.tokenId.toString()}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Owner:</span>
                <span className="detail-value font-mono text-xs">
                  {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Balance:</span>
                <span className="detail-value">{nft.balance}</span>
              </div>
              
              {nft.size && (
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{nft.size}</span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-badge ${statusColors[nft.redemptionStatus]}`}>
                  {statusLabels[nft.redemptionStatus]}
                </span>
              </div>
            </div>

            {nft.metadata?.description && (
              <div className="description-section">
                <p className="description-text">{nft.metadata.description}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {nft.redemptionStatus === RedemptionStatus.PendingFulfillment ? (
              <button
                onClick={handleFulfill}
                disabled={isConfirming || isProcessing}
                className="action-btn fulfill-btn"
              >
                {isConfirming || isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  'MARK AS FULFILLED'
                )}
              </button>
            ) : (
              <div className="info-message">
                This NFT is {statusLabels[nft.redemptionStatus].toLowerCase()}. No action needed.
              </div>
            )}
            
            <button
              onClick={onClose}
              disabled={isConfirming || isProcessing}
              className="action-btn cancel-btn"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-container {
          background: var(--surface-slab);
          border: 1px solid rgb(var(--signal-pending-rgb) / 0.3);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          color: var(--text-secondary);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgb(var(--signal-pending-rgb) / 0.2);
          position: sticky;
          top: 0;
          background: var(--surface-slab);
          z-index: 10;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--signal-pending);
          font-size: 1rem;
          font-weight: 600;
          font-family: monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .close-button {
          background: rgb(var(--signal-pending-rgb) / 0.1);
          border: 1px solid rgb(var(--signal-pending-rgb) / 0.3);
          border-radius: 4px;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--signal-pending);
          padding: 0.25rem 0.5rem;
          width: auto;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-button:hover:not(:disabled) {
          background: rgb(var(--signal-pending-rgb) / 0.2);
          border-color: rgb(var(--signal-pending-rgb) / 0.5);
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .nft-image-section {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .nft-image-wrapper {
          display: inline-block;
          width: 200px;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgb(var(--signal-pending-rgb) / 0.3);
          background: rgba(0, 0, 0, 0.3);
        }

        .nft-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nft-details-section {
          margin-bottom: 1.5rem;
        }

        .nft-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          width: fit-content;
        }

        .description-section {
          background: rgb(var(--signal-pending-rgb) / 0.05);
          border: 1px solid rgb(var(--signal-pending-rgb) / 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .description-text {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-btn {
          width: 100%;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: monospace;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
        }

        .fulfill-btn {
          background: rgb(var(--signal-confirmed-rgb) / 0.1);
          color: var(--signal-confirmed);
          border-color: rgb(var(--signal-confirmed-rgb) / 0.3);
        }

        .fulfill-btn:hover:not(:disabled) {
          background: rgb(var(--signal-confirmed-rgb) / 0.2);
          border-color: rgb(var(--signal-confirmed-rgb) / 0.5);
        }

        .fulfill-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: var(--line-hairline);
          color: var(--text-muted);
          border-color: var(--line-hairline);
        }

        .cancel-btn:hover:not(:disabled) {
          background: var(--line-hairline);
          border-color: var(--surface-ridge);
        }

        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-message {
          background: var(--line-strong);
          border: 1px solid var(--line-strong);
          border-radius: 8px;
          padding: 0.875rem 1rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .modal-container {
            width: 95%;
            max-width: none;
          }

          .modal-body {
            padding: 1rem;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .nft-image-wrapper {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
}

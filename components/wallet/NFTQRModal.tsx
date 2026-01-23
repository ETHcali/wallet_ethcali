import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useSwagAddresses } from '../../utils/network';
import { useWallets } from '@privy-io/react-auth';

import { logger } from '../../utils/logger';
interface NFTQRModalProps {
  tokenId: bigint;
  nftName: string;
  onClose: () => void;
}

export function NFTQRModal({ tokenId, nftName, onClose }: NFTQRModalProps) {
  const { chainId, swag1155 } = useSwagAddresses();
  const { wallets } = useWallets();
  const userAddress = wallets?.[0]?.address;
  const [copied, setCopied] = useState(false);

  if (!userAddress || !chainId || !swag1155) {
    return null;
  }

  // Create URL for QR code that links to admin panel
  const adminUrl = `/swag/admin?tokenId=${tokenId.toString()}&owner=${encodeURIComponent(userAddress)}&chainId=${chainId}`;
  // Use full URL for better compatibility across devices
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${adminUrl}`
    : adminUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>REDEMPTION QR CODE</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          {/* NFT Info */}
          <div className="nft-info-section">
            <h4 className="nft-name">{nftName}</h4>
            <p className="token-id">Token ID: #{tokenId.toString().slice(-6)}</p>
          </div>

          {/* QR Code */}
          <div className="qr-section">
            <div className="qr-wrapper">
              {/* Scanning guide frame */}
              <div className="scanning-frame">
                <div className="corner corner-tl"></div>
                <div className="corner corner-tr"></div>
                <div className="corner corner-bl"></div>
                <div className="corner corner-br"></div>
              </div>
              <QRCodeSVG
                value={fullUrl}
                size={260}
                level="H"
                includeMargin={true}
                bgColor="#0a0a0a"
                fgColor="#22d3ee"
              />
            </div>
            <p className="qr-hint">SCAN WITH PHONE CAMERA</p>
            <p className="qr-status">Status: Pending Fulfillment</p>
            <p className="qr-instruction">Keep QR code steady and well-lit</p>
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <p className="instructions-text">
              Present this QR code to an admin in person. They will scan it with their phone camera to open the admin panel and mark your redemption as fulfilled.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ COPIED' : 'COPY URL'}
            </button>
            <button
              className="action-btn close-btn"
              onClick={onClose}
            >
              CLOSE
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
          align-items: flex-start;
          padding: 1rem;
          overflow-y: auto;
          z-index: 1000;
        }

        .modal-container {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          max-height: 90vh;
          overflow-y: auto;
          margin-top: 2rem;
          margin-bottom: 2rem;
          box-shadow: 
            0 0 30px rgba(34, 211, 238, 0.2),
            0 10px 40px rgba(0, 0, 0, 0.5);
          color: #e5e7eb;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(34, 211, 238, 0.2);
        }

        .modal-header h3 {
          margin: 0;
          color: #22d3ee;
          font-size: 1rem;
          font-weight: 600;
          font-family: monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .close-button {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 4px;
          font-size: 1.25rem;
          cursor: pointer;
          color: #22d3ee;
          padding: 0.25rem 0.5rem;
          width: auto;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: rgba(34, 211, 238, 0.2);
          border-color: rgba(34, 211, 238, 0.5);
        }

        .modal-body {
          padding: 1rem 1.5rem;
        }

        .nft-info-section {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .nft-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e5e7eb;
          margin: 0 0 0.5rem 0;
        }

        .token-id {
          font-size: 0.875rem;
          color: #9ca3af;
          font-family: monospace;
          margin: 0;
        }

        .qr-section {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .qr-wrapper {
          background: #ffffff;
          padding: 1rem;
          border: 2px solid rgba(34, 211, 238, 0.4);
          border-radius: 12px;
          display: inline-block;
          box-shadow: 
            0 0 20px rgba(34, 211, 238, 0.2),
            inset 0 0 20px rgba(34, 211, 238, 0.05);
          position: relative;
          min-width: 280px;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scanning-frame {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 3px solid #22d3ee;
        }

        .corner-tl {
          top: 10px;
          left: 10px;
          border-right: none;
          border-bottom: none;
          border-top-left-radius: 8px;
        }

        .corner-tr {
          top: 10px;
          right: 10px;
          border-left: none;
          border-bottom: none;
          border-top-right-radius: 8px;
        }

        .corner-bl {
          bottom: 10px;
          left: 10px;
          border-right: none;
          border-top: none;
          border-bottom-left-radius: 8px;
        }

        .corner-br {
          bottom: 10px;
          right: 10px;
          border-left: none;
          border-top: none;
          border-bottom-right-radius: 8px;
        }

        .qr-hint {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
          font-family: monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .qr-status {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #fbbf24;
          font-weight: 500;
        }

        .qr-instruction {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
          font-style: italic;
        }

        .instructions-section {
          background: rgba(34, 211, 238, 0.05);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .instructions-text {
          font-size: 0.875rem;
          color: #9ca3af;
          line-height: 1.6;
          margin: 0;
          text-align: center;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-btn {
          background: rgba(34, 211, 238, 0.1);
          color: #22d3ee;
        }

        .copy-btn:hover {
          background: rgba(34, 211, 238, 0.2);
          border-color: rgba(34, 211, 238, 0.5);
        }

        .copy-btn.copied {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(34, 197, 94, 0.4);
          color: #22c55e;
        }

        .close-btn {
          background: rgba(75, 85, 99, 0.2);
          color: #9ca3af;
          border-color: rgba(75, 85, 99, 0.3);
        }

        .close-btn:hover {
          background: rgba(75, 85, 99, 0.3);
          border-color: rgba(75, 85, 99, 0.5);
        }

        @media (max-width: 480px) {
          .modal-container {
            width: 95%;
            max-width: none;
          }

          .modal-body {
            padding: 1rem;
          }

          .qr-wrapper {
            min-width: 280px;
            min-height: 280px;
            padding: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

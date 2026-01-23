import React, { useState } from 'react';
import Image from 'next/image';

import { logger } from '../../utils/logger';
interface ReceiveModalProps {
  address: string;
  onClose: () => void;
  onScanQR?: () => void;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ address, onClose, onScanQR }) => {
  const [copied, setCopied] = useState(false);

  // Generate QR code URL with dark cypherpunk style (dark bg, cyan/neon color)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${address}&bgcolor=0a0a0a&color=22d3ee&margin=1`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wallet Address',
          text: `Send crypto to my wallet:\n${address}`,
        });
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>RECEIVE</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          {/* QR Code - Cypherpunk Style */}
          <div className="qr-section">
            <div className="qr-wrapper">
              <Image 
                src={qrCodeUrl} 
                alt="Wallet QR Code" 
                width={250}
                height={250}
                className="qr-image"
                priority
                unoptimized
              />
            </div>
            <p className="qr-hint">SCAN TO SEND</p>
          </div>

          {/* Address */}
          <div className="address-section">
            <div className="address-box">
              <span className="address-text">{address}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ COPIED' : 'COPY'}
            </button>
            <button
              className="action-btn share-btn"
              onClick={handleShare}
            >
              SHARE
            </button>
            {onScanQR && (
              <button 
                className="action-btn scan-btn"
                onClick={onScanQR}
              >
                SCAN
              </button>
            )}
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
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
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
          padding: 1.5rem;
        }

        .qr-section {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .qr-wrapper {
          background: #0a0a0a;
          padding: 1rem;
          border: 2px solid rgba(34, 211, 238, 0.4);
          border-radius: 8px;
          display: inline-block;
          box-shadow: 
            0 0 20px rgba(34, 211, 238, 0.2),
            inset 0 0 20px rgba(34, 211, 238, 0.05);
        }

        .qr-image {
          display: block;
          width: 250px;
          height: 250px;
        }

        .qr-hint {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
          font-family: monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .address-section {
          margin-bottom: 1.5rem;
        }

        .address-box {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1rem;
          word-break: break-all;
        }

        .address-text {
          font-family: monospace;
          font-size: 0.75rem;
          color: #22d3ee;
          line-height: 1.6;
          letter-spacing: 0.05em;
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

        .share-btn {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          border-color: rgba(139, 92, 246, 0.3);
        }

        .share-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .scan-btn {
          background: rgba(75, 85, 99, 0.2);
          color: #9ca3af;
          border-color: rgba(75, 85, 99, 0.3);
        }

        .scan-btn:hover {
          background: rgba(75, 85, 99, 0.3);
          border-color: rgba(75, 85, 99, 0.5);
        }

        @media (max-width: 480px) {
          .modal-container {
            width: 95%;
            max-width: none;
          }

          .qr-image {
            width: 200px;
            height: 200px;
          }

          .modal-body {
            padding: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiveModal;

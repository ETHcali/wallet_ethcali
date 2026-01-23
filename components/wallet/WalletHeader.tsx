/**
 * WalletHeader - Address display with copy, explorer link, and export actions
 */
import React, { useState } from 'react';
import { getExplorerBaseUrl } from '../../utils/explorer';

interface WalletHeaderProps {
  address: string;
  chainId?: number;
  onExport?: () => void;
  showExport?: boolean;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({
  address,
  chainId,
  onExport,
  showExport = true,
}) => {
  const [copied, setCopied] = useState(false);

  const explorerUrl = chainId ? getExplorerBaseUrl(chainId) : null;

  const formatAddress = (addr: string) => {
    if (addr.length > 20) {
      return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    }
    return addr;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wallet-address-card">
      <div className="address-row">
        <div className="address-info">
          <div className="address-text">
            <span className="address-label">Wallet Address</span>
            <span className="address-value">{formatAddress(address)}</span>
          </div>
        </div>
        <div className="address-actions-row">
          <button className="action-icon-btn" onClick={handleCopy} title="Copy address">
            {copied ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
          {explorerUrl && (
            <a
              href={`${explorerUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="action-icon-btn"
              title="View on explorer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          {showExport && onExport && (
            <button className="action-icon-btn" onClick={onExport} title="Export wallet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .wallet-address-card {
          background: rgba(17, 24, 39, 0.8);
          border-radius: 12px;
          padding: 0.875rem 1rem;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .address-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .address-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .address-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .address-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .address-value {
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 0.875rem;
          color: #06b6d4;
          font-weight: 500;
        }

        .address-actions-row {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.4);
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .action-icon-btn:hover {
          background: rgba(55, 65, 81, 0.8);
          border-color: rgba(75, 85, 99, 0.6);
          color: #f3f4f6;
        }

        .action-icon-btn svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
};

export default WalletHeader;

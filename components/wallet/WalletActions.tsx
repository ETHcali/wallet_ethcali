/**
 * WalletActions - Quick action buttons (Buy, Send, Receive, Refresh)
 */
import React from 'react';

interface WalletActionsProps {
  onBuy: () => void;
  onSend: () => void;
  onReceive: () => void;
  onRefresh: () => void;
  isBuying?: boolean;
  isRefreshing?: boolean;
  showBuy?: boolean;
}

const WalletActions: React.FC<WalletActionsProps> = ({
  onBuy,
  onSend,
  onReceive,
  onRefresh,
  isBuying = false,
  isRefreshing = false,
  showBuy = true,
}) => {
  return (
    <div className="quick-actions">
      {showBuy && (
        <button
          className="quick-action-btn fund-btn"
          onClick={onBuy}
          disabled={isBuying}
        >
          <div className="action-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <span>{isBuying ? 'Loading...' : 'Buy'}</span>
        </button>
      )}
      <button className="quick-action-btn send-btn" onClick={onSend}>
        <div className="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
        <span>Send</span>
      </button>
      <button className="quick-action-btn receive-btn" onClick={onReceive}>
        <div className="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
        <span>Receive</span>
      </button>
      <button
        className="quick-action-btn refresh-btn"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <div className="action-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={isRefreshing ? 'spinning' : ''}
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </div>
        <span>Refresh</span>
      </button>

      <style jsx>{`
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          padding: 0.75rem 0.5rem;
          border-radius: 12px;
          border: 1px solid rgba(75, 85, 99, 0.3);
          background: rgba(55, 65, 81, 0.4);
          color: #f3f4f6;
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .quick-action-btn:hover:not(:disabled) {
          background: rgba(55, 65, 81, 0.6);
          border-color: rgba(75, 85, 99, 0.5);
          transform: translateY(-1px);
        }

        .quick-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-icon svg {
          width: 20px;
          height: 20px;
        }

        .fund-btn {
          border-color: rgba(34, 197, 94, 0.3);
        }

        .fund-btn:hover:not(:disabled) {
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
        }

        .fund-btn .action-icon {
          color: #22c55e;
        }

        .send-btn {
          border-color: rgba(6, 182, 212, 0.3);
        }

        .send-btn:hover:not(:disabled) {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
        }

        .send-btn .action-icon {
          color: #06b6d4;
        }

        .receive-btn {
          border-color: rgba(139, 92, 246, 0.3);
        }

        .receive-btn:hover:not(:disabled) {
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.2);
        }

        .receive-btn .action-icon {
          color: #8b5cf6;
        }

        .refresh-btn {
          border-color: rgba(156, 163, 175, 0.3);
        }

        .refresh-btn:hover:not(:disabled) {
          border-color: rgba(156, 163, 175, 0.5);
        }

        .refresh-btn .action-icon {
          color: #9ca3af;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .action-icon svg.spinning {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 400px) {
          .quick-actions {
            gap: 0.375rem;
          }

          .quick-action-btn {
            padding: 0.625rem 0.375rem;
            font-size: 0.65rem;
          }

          .action-icon svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletActions;

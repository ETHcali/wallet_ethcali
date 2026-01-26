import React, { useState, useEffect } from 'react';
import { useENSAvailability, useENSMint, useUserENS } from '../../hooks/ens';
import { ENS_CONFIG, CHAIN_IDS, EXPLORER_URLS } from '../../config/constants';

interface ENSSectionProps {
  userAddress: string;
  chainId: number;
}

const ENSSection: React.FC<ENSSectionProps> = ({ userAddress, chainId }) => {
  const [label, setLabel] = useState('');
  const { subdomain, fullName, isLoading: isLoadingUserENS, refetch: refetchUserENS } = useUserENS(userAddress);
  const { isAvailable, isLoading: isCheckingAvailability } = useENSAvailability(label);
  const { mintSubdomain, isPending, isSuccess, hash, error, reset } = useENSMint();

  const previewName = label ? `${label}.${ENS_CONFIG.parentName}` : `your-name.${ENS_CONFIG.parentName}`;
  const canMint = label && isAvailable && !isPending;
  const isWrongChain = chainId !== ENS_CONFIG.chainId;

  // Refetch user ENS after successful mint
  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        refetchUserENS();
        reset();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, refetchUserENS, reset]);

  const handleMint = async () => {
    if (!canMint) return;
    try {
      await mintSubdomain(label, userAddress);
    } catch {
      // Error is handled in hook state
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase alphanumeric and hyphens
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setLabel(value);
  };

  // If user already has an ENS subdomain, show the badge
  if (subdomain && !isLoadingUserENS) {
    return (
      <div className="ens-section">
        <div className="ens-badge-container">
          <div className="ens-badge">
            <div className="badge-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="badge-content">
              <span className="badge-label">Your ENS Name</span>
              <span className="badge-name">{fullName}</span>
            </div>
            <div className="verified-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>
        </div>

        <style jsx>{`
          .ens-section {
            margin-bottom: 1rem;
          }

          .ens-badge-container {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1));
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 12px;
            padding: 1rem;
          }

          .ens-badge {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .badge-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
            border-radius: 10px;
            color: #06b6d4;
          }

          .badge-icon svg {
            width: 20px;
            height: 20px;
          }

          .badge-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
          }

          .badge-label {
            font-size: 0.6875rem;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .badge-name {
            font-size: 1rem;
            font-weight: 600;
            color: #06b6d4;
            font-family: 'SF Mono', 'Menlo', monospace;
          }

          .verified-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: #10b981;
            border-radius: 50%;
            color: white;
          }

          .verified-badge svg {
            width: 14px;
            height: 14px;
          }
        `}</style>
      </div>
    );
  }

  // Show loading state
  if (isLoadingUserENS) {
    return (
      <div className="ens-section">
        <div className="ens-loading">
          <div className="loading-spinner" />
          <span>Checking ENS...</span>
        </div>

        <style jsx>{`
          .ens-section {
            margin-bottom: 1rem;
          }

          .ens-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(17, 24, 39, 0.6);
            border: 1px solid rgba(75, 85, 99, 0.3);
            border-radius: 12px;
            color: #9ca3af;
            font-size: 0.875rem;
          }

          .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(6, 182, 212, 0.3);
            border-top-color: #06b6d4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show mint form
  return (
    <div className="ens-section">
      <div className="ens-mint-card">
        {/* Header */}
        <div className="mint-header">
          <div className="header-left">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="header-text">
              <h4>Claim Your ENS Name</h4>
              <span className="header-subtitle">Free subdomain on Base</span>
            </div>
          </div>
          <span className="gas-badge">GAS SPONSORED</span>
        </div>

        {/* Wrong Chain Warning */}
        {isWrongChain && (
          <div className="chain-warning">
            <svg viewBox="0 0 24 24" fill="currentColor" className="warning-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>Switch to Base network to mint</span>
          </div>
        )}

        {/* Input */}
        <div className="input-section">
          <label className="input-label">Choose your subdomain</label>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="yourname"
              value={label}
              onChange={handleLabelChange}
              className="subdomain-input"
              disabled={isWrongChain || isPending}
              maxLength={32}
            />
            <span className="input-suffix">.{ENS_CONFIG.parentName}</span>
          </div>
          <p className="preview-text">Preview: {previewName}</p>
        </div>

        {/* Availability Status */}
        {label && !isWrongChain && (
          <div className="availability-status">
            {isCheckingAvailability ? (
              <span className="status checking">
                <div className="status-spinner" />
                Checking availability...
              </span>
            ) : isAvailable ? (
              <span className="status available">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Available
              </span>
            ) : isAvailable === false ? (
              <span className="status taken">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
                Already taken
              </span>
            ) : null}
          </div>
        )}

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={!canMint || isWrongChain}
          className={`mint-button ${canMint && !isWrongChain ? 'enabled' : 'disabled'}`}
        >
          {isPending ? (
            <>
              <div className="button-spinner" />
              Minting...
            </>
          ) : (
            'Mint for Free'
          )}
        </button>

        {/* Success Message */}
        {isSuccess && hash && (
          <div className="success-message">
            <svg viewBox="0 0 24 24" fill="currentColor" className="success-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <div className="success-content">
              <span className="success-title">Successfully minted!</span>
              <a
                href={`${EXPLORER_URLS[CHAIN_IDS.BASE]}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View transaction
              </a>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="currentColor" className="error-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{error.message}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .ens-section {
          margin-bottom: 1rem;
        }

        .ens-mint-card {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .mint-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 10px;
          color: #06b6d4;
        }

        .header-icon svg {
          width: 20px;
          height: 20px;
        }

        .header-text h4 {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #e5e7eb;
        }

        .header-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .gas-badge {
          font-size: 0.625rem;
          font-weight: 600;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .chain-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          margin-bottom: 1rem;
          color: #f59e0b;
          font-size: 0.8125rem;
        }

        .warning-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .input-section {
          margin-bottom: 1rem;
        }

        .input-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(75, 85, 99, 0.4);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(6, 182, 212, 0.5);
        }

        .subdomain-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          color: #e5e7eb;
          font-family: 'SF Mono', 'Menlo', monospace;
          outline: none;
        }

        .subdomain-input::placeholder {
          color: #4b5563;
        }

        .subdomain-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-suffix {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #6b7280;
          background: rgba(55, 65, 81, 0.3);
          border-left: 1px solid rgba(75, 85, 99, 0.4);
          font-family: 'SF Mono', 'Menlo', monospace;
        }

        .preview-text {
          margin: 0.5rem 0 0 0;
          font-size: 0.75rem;
          color: #4b5563;
        }

        .availability-status {
          margin-bottom: 1rem;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .status svg {
          width: 14px;
          height: 14px;
        }

        .status.checking {
          color: #9ca3af;
        }

        .status-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(156, 163, 175, 0.3);
          border-top-color: #9ca3af;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .status.available {
          color: #10b981;
        }

        .status.taken {
          color: #ef4444;
        }

        .mint-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mint-button.enabled {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3));
          border: 1px solid rgba(6, 182, 212, 0.5);
          color: #06b6d4;
        }

        .mint-button.enabled:hover {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4));
          transform: translateY(-1px);
        }

        .mint-button.disabled {
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.3);
          color: #6b7280;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          padding: 0.875rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
        }

        .success-icon {
          width: 20px;
          height: 20px;
          color: #10b981;
          flex-shrink: 0;
        }

        .success-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .success-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #10b981;
        }

        .tx-link {
          font-size: 0.75rem;
          color: #06b6d4;
          text-decoration: none;
        }

        .tx-link:hover {
          text-decoration: underline;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.8125rem;
        }

        .error-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .ens-mint-card {
            padding: 1rem;
          }

          .mint-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .gas-badge {
            align-self: flex-start;
          }

          .input-wrapper {
            flex-direction: column;
          }

          .input-suffix {
            width: 100%;
            text-align: center;
            border-left: none;
            border-top: 1px solid rgba(75, 85, 99, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default ENSSection;

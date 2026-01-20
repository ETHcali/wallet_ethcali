import React, { useState, useEffect } from 'react';
import Button from '../shared/Button';
import Loading from '../shared/Loading';
import QRScanner from './QRScanner';

interface TokenOption {
  symbol: string;
  balance: string;
  name: string;
}

interface SendTokenModalProps {
  onClose: () => void;
  onSend: (recipient: string, amount: string, tokenType: string) => Promise<void>;
  availableTokens: TokenOption[];
  isSending: boolean;
  txHash?: string | null;
  initialRecipient?: string;
  chainId?: number;
}

const SendTokenModal: React.FC<SendTokenModalProps> = ({
  onClose,
  onSend,
  availableTokens,
  isSending,
  txHash = null,
  initialRecipient = '',
  chainId,
}) => {
    const explorerBase = (() => {
      switch (chainId) {
        case 1:
          return 'https://etherscan.io';
        case 10:
          return 'https://optimism.etherscan.io';
        case 8453:
          return 'https://basescan.org';
        case 130:
          return 'https://unichain.blockscout.com';
        default:
          return undefined;
      }
    })();
  // Initialize selectedToken safely
  const getInitialToken = (): TokenOption | null => {
    if (availableTokens.length === 0) return null;
    return availableTokens.find(t => t.symbol === 'ETH') || availableTokens[0];
  };

  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(getInitialToken());
  const [recipient, setRecipient] = useState<string>(initialRecipient);
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [recipientError, setRecipientError] = useState<string>('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  
  // Update recipient if initialRecipient changes
  useEffect(() => {
    if (initialRecipient) {
      setRecipient(initialRecipient);
    }
  }, [initialRecipient]);

  // Update selected token when availableTokens changes
  useEffect(() => {
    if (availableTokens.length > 0) {
      const currentToken = selectedToken;
      if (!currentToken || !availableTokens.find(t => t.symbol === currentToken.symbol)) {
        const newToken = availableTokens.find(t => t.symbol === 'ETH') || availableTokens[0];
        setSelectedToken(newToken);
      }
    } else {
      setSelectedToken(null);
    }
  }, [availableTokens, selectedToken]);

  // Real-time validation for recipient address
  useEffect(() => {
    if (!recipient) {
      setRecipientError('');
      return;
    }
    
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      setRecipientError('Invalid Ethereum address format');
    } else {
      setRecipientError('');
    }
  }, [recipient]);

  // Real-time validation for amount
  useEffect(() => {
    if (!amount) {
      setAmountError('');
      return;
    }

    if (!selectedToken) {
      setAmountError('');
      return;
    }

    const amountNum = Number(amount);
    const balanceNum = Number(selectedToken.balance);

    if (balanceNum === 0) {
      setAmountError(`You have 0 ${selectedToken.symbol} balance. Cannot send.`);
    } else if (isNaN(amountNum) || amountNum <= 0) {
      setAmountError('Please enter a valid amount');
    } else if (amountNum > balanceNum) {
      setAmountError(`Insufficient balance. Max: ${selectedToken.balance} ${selectedToken.symbol}`);
    } else {
      setAmountError('');
    }
  }, [amount, selectedToken]);

  const handleSend = async () => {
    if (!selectedToken) {
      setError('No token selected');
      return;
    }

    // Final validation before sending
    if (recipientError || amountError) {
      setError('Please fix the errors above before sending');
      return;
    }

    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      setRecipientError('Please enter a valid Ethereum address');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    if (Number(amount) > Number(selectedToken.balance)) {
      setAmountError(`Insufficient balance. Max: ${selectedToken.balance} ${selectedToken.symbol}`);
      return;
    }

    setError('');
    setRecipientError('');
    setAmountError('');
    
    try {
      await onSend(recipient, amount, selectedToken.symbol);
      if (!txHash) {
        // Only close if no transaction hash is returned
        // If we have a txHash, we might want to show the transaction info
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
    }
  };

  const handleClose = () => {
    setRecipient('');
    setAmount('');
    setError('');
    setAmountError('');
    setRecipientError('');
    onClose();
  };

  const handleSetMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Validate if it's a valid Ethereum address
      if (text.startsWith('0x') && text.length === 42) {
        setRecipient(text);
        setError('');
      } else {
        setError('Invalid address in clipboard. Please paste a valid Ethereum address.');
      }
    } catch (err) {
      setError('Failed to read from clipboard. Please paste the address manually.');
    }
  };

  // Handle QR code scan result
  const handleQRScan = (address: string) => {
    setRecipient(address);
    setIsQRScannerOpen(false);
    setError(''); // Clear any previous errors
  };

  // Open QR scanner
  const openQRScanner = () => {
    setIsQRScannerOpen(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Send Token</h3>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          {/* Token Selection */}
          <div className="form-group">
            <label htmlFor="token">Select Token</label>
            {availableTokens.length > 0 ? (
              <div className="token-selector">
                {availableTokens.map((token) => {
                  const hasBalance = parseFloat(token.balance) > 0;
                  return (
                    <button
                      key={token.symbol}
                      type="button"
                      className={`token-option ${selectedToken?.symbol === token.symbol ? 'active' : ''} ${!hasBalance ? 'no-balance' : ''}`}
                      onClick={() => setSelectedToken(token)}
                      disabled={isSending}
                      title={!hasBalance ? `No ${token.symbol} balance available` : `Send ${token.symbol}`}
                    >
                      <span className="token-symbol">{token.symbol}</span>
                      <span className={`token-balance-small ${!hasBalance ? 'zero-balance' : ''}`}>
                        {parseFloat(token.balance).toFixed(6)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="no-tokens-message">
                <p>Loading tokens...</p>
              </div>
            )}
          </div>

          {selectedToken && parseFloat(selectedToken.balance) === 0 && (
            <div className="warning-message">
              <span className="warning-icon">⚠</span>
              <span>You have 0 {selectedToken.symbol} balance. You cannot send this token.</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <div className="recipient-input-container">
              <button 
                onClick={openQRScanner} 
                className="scan-button"
                disabled={isSending}
                title="Scan QR Code"
              >
                📷
              </button>
              <button 
                onClick={handlePaste} 
                className="paste-button"
                disabled={isSending}
                title="Paste Address"
              >
                📋
              </button>
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                disabled={isSending}
                className={recipientError ? 'input-error' : ''}
              />
            </div>
            {recipientError && <div className="field-error-message">{recipientError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            {selectedToken && (
              <div className="balance-info-top">
                Available: <span className="balance-amount">{selectedToken.balance}</span> {selectedToken.symbol}
              </div>
            )}
            <div className="amount-input-container">
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                disabled={isSending || !selectedToken}
                className={amountError ? 'input-error' : ''}
              />
              <button 
                onClick={handleSetMaxAmount} 
                className="max-button"
                disabled={isSending || !selectedToken}
              >
                MAX
              </button>
            </div>
            {amountError && <div className="field-error-message">{amountError}</div>}
            {selectedToken && !amountError && amount && Number(amount) > 0 && Number(amount) <= Number(selectedToken.balance) && (
              <div className="amount-preview">
                ≈ {((Number(amount) / Number(selectedToken.balance)) * 100).toFixed(2)}% of balance
            </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          
          {txHash && (
            <div className="transaction-info">
              <p><strong>Transaction sent!</strong></p>
              <p className="tx-hash">{txHash}</p>
              {explorerBase && (
                <a 
                  href={`${explorerBase}/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block-explorer-link"
                >
                  View on Explorer
                </a>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button 
            onClick={handleClose} 
            variant="secondary"
            disabled={isSending}
          >
            {txHash ? 'Close' : 'Cancel'}
          </Button>
          {!txHash && (
            <Button 
              onClick={handleSend} 
              variant="primary"
              disabled={isSending || !selectedToken || !recipient || !amount || !!recipientError || !!amountError || (selectedToken && parseFloat(selectedToken.balance) === 0)}
            >
              {isSending ? (
                <span className="sending-indicator">
                  <Loading size="small" text="" /> Sending...
                </span>
              ) : selectedToken && parseFloat(selectedToken.balance) === 0 ? (
                `No ${selectedToken.symbol} Balance`
              ) : (
                selectedToken ? `Send ${selectedToken.symbol}` : 'No Token Selected'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* QR Scanner */}
      {isQRScannerOpen && (
        <QRScanner 
          onScan={handleQRScan} 
          onClose={() => setIsQRScannerOpen(false)} 
        />
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 20, 0.98));
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-container {
          background: linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(0, 0, 0, 0.98));
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(34, 211, 238, 0.1);
          color: #e5e7eb;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(34, 211, 238, 0.2);
          background: rgba(0, 0, 0, 0.3);
        }

        .modal-header h3 {
          margin: 0;
          color: #22d3ee;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .close-button {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 6px;
          font-size: 1.5rem;
          cursor: pointer;
          color: #22d3ee;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          line-height: 1;
        }

        .close-button:hover {
          background: rgba(34, 211, 238, 0.2);
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
        }
        
        .transaction-info {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 8px;
        }
        
        .transaction-info p {
          margin: 0.5rem 0;
          color: #22d3ee;
        }
        
        .tx-hash {
          word-break: break-all;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          font-size: 0.85rem;
          margin: 0.5rem 0;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 6px;
          color: #22d3ee;
        }
        
        .block-explorer-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #22d3ee;
          text-decoration: none;
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(34, 211, 238, 0.5);
          transition: all 0.2s;
        }

        .block-explorer-link:hover {
          color: #67e8f9;
          border-color: rgba(34, 211, 238, 0.8);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid rgba(34, 211, 238, 0.2);
          background: rgba(0, 0, 0, 0.2);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        input {
          width: 100%;
          padding: 0.875rem;
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 8px;
          font-size: 0.95rem;
          background: rgba(0, 0, 0, 0.5);
          color: #e5e7eb;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1), 0 0 12px rgba(34, 211, 238, 0.2);
          background: rgba(0, 0, 0, 0.7);
        }

        input::placeholder {
          color: #6b7280;
        }

        input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        input.input-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1), 0 0 12px rgba(239, 68, 68, 0.2);
        }

        .field-error-message {
          color: #ef4444;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          padding-left: 0.25rem;
        }

        .balance-info-top {
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .balance-info-top .balance-amount {
          color: #22d3ee;
          font-weight: 600;
        }

        .amount-preview {
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: #6b7280;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          padding-left: 0.25rem;
        }

        .token-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .token-option {
          flex: 1;
          min-width: 80px;
          padding: 0.875rem 0.75rem;
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .token-option:hover:not(:disabled) {
          border-color: #22d3ee;
          background: rgba(34, 211, 238, 0.1);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
        }

        .token-option.active {
          border-color: #22d3ee;
          background: rgba(34, 211, 238, 0.15);
          box-shadow: 0 0 16px rgba(34, 211, 238, 0.3);
        }

        .token-option:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .token-option.no-balance {
          opacity: 0.6;
          border-color: rgba(107, 114, 128, 0.3);
          background: rgba(0, 0, 0, 0.3);
        }

        .token-option.no-balance:hover:not(:disabled) {
          border-color: rgba(107, 114, 128, 0.5);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: none;
        }

        .token-symbol {
          font-weight: 700;
          font-size: 0.9rem;
          color: #22d3ee;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .token-option.no-balance .token-symbol {
          color: #6b7280;
        }

        .token-balance-small {
          font-size: 0.7rem;
          color: #9ca3af;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .token-balance-small.zero-balance {
          color: #6b7280;
        }

        .no-tokens-message {
          padding: 2rem;
          text-align: center;
          color: #9ca3af;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .no-tokens-message p {
          margin: 0;
          font-size: 0.85rem;
        }

        .warning-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 8px;
          color: #fbbf24;
          font-size: 0.8rem;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          margin-bottom: 1rem;
        }

        .warning-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .recipient-input-container {
          display: flex;
          gap: 0.5rem;
        }

        .recipient-input-container input {
          flex: 1;
        }

        .paste-button,
        .scan-button {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          padding: 0.875rem;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          color: #22d3ee;
          min-width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .paste-button:hover:not(:disabled),
        .scan-button:hover:not(:disabled) {
          background: rgba(34, 211, 238, 0.2);
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
        }

        .paste-button:disabled,
        .scan-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .amount-input-container {
          display: flex;
          gap: 0.5rem;
        }

        .max-button {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          padding: 0 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          color: #22d3ee;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s;
        }

        .max-button:hover:not(:disabled) {
          background: rgba(34, 211, 238, 0.2);
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
        }

        .max-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .balance-info {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: right;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .error-message {
          color: #ef4444;
          margin-top: 1rem;
          font-size: 0.85rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .sending-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 480px) {
          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-container {
            max-width: 100%;
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-footer {
            padding: 1rem;
            flex-direction: column;
          }

          .token-option {
            min-width: 70px;
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SendTokenModal; 
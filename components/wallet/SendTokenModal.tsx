import React, { useState, useEffect } from 'react';
import Button from '../shared/Button';
import Loading from '../shared/Loading';
import QRScanner from './QRScanner';

interface SendTokenModalProps {
  onClose: () => void;
  onSend: (recipient: string, amount: string) => Promise<void>;
  tokenType: string;
  balance: string;
  isSending: boolean;
  txHash?: string | null;
  initialRecipient?: string;
  chainId?: number;
}

const SendTokenModal: React.FC<SendTokenModalProps> = ({
  onClose,
  onSend,
  tokenType,
  balance,
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
  const [recipient, setRecipient] = useState<string>(initialRecipient);
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  
  // Update recipient if initialRecipient changes
  useEffect(() => {
    if (initialRecipient) {
      setRecipient(initialRecipient);
    }
  }, [initialRecipient]);

  const handleSend = async () => {
    // Validate recipient address
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate amount is not more than max
    if (Number(amount) > Number(balance)) {
      setError(`You don't have enough ${tokenType}. Max amount: ${balance}`);
      return;
    }

    setError('');
    
    try {
      await onSend(recipient, amount);
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
    onClose();
  };

  const handleSetMaxAmount = () => {
    setAmount(balance);
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
          <h3>Send {tokenType}</h3>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
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
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                disabled={isSending}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <div className="amount-input-container">
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                disabled={isSending}
              />
              <button 
                onClick={handleSetMaxAmount} 
                className="max-button"
                disabled={isSending}
              >
                MAX
              </button>
            </div>
            <div className="balance-info">
              Available: {balance} {tokenType}
            </div>
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
              disabled={isSending}
            >
              {isSending ? (
                <span className="sending-indicator">
                  <Loading size="small" text="" /> Sending...
                </span>
              ) : (
                `Send ${tokenType}`
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
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-container {
          background-color: var(--card-bg);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
          color: var(--text-color);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--card-border);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-color);
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
        }
        
        .transaction-info {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }
        
        .tx-hash {
          word-break: break-all;
          font-family: monospace;
          font-size: 0.9rem;
          margin: 0.5rem 0;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        
        .block-explorer-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: var(--primary-color);
          text-decoration: underline;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid #eee;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: #4B66F3;
          box-shadow: 0 0 0 2px rgba(75, 102, 243, 0.2);
        }

        .recipient-input-container {
          display: flex;
          gap: 0.5rem;
        }

        .recipient-input-container input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .amount-input-container {
          display: flex;
          gap: 0.5rem;
        }

        .scan-button {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          color: #555;
          min-width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .scan-button:hover:not(:disabled) {
          background-color: #e0e0e0;
        }

        .scan-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .max-button {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          padding: 0 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          color: #555;
        }

        .max-button:hover {
          background-color: #e0e0e0;
        }

        .balance-info {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #666;
          text-align: right;
        }

        .error-message {
          color: #d32f2f;
          margin-top: 1rem;
          font-size: 0.9rem;
          padding: 0.5rem;
          background-color: #ffebee;
          border-radius: 4px;
        }

        .sending-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default SendTokenModal; 
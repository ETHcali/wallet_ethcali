import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

export interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  validator?: (data: string) => { valid: boolean; error?: string };
  theme?: 'cyan' | 'amber';
  showScanCount?: boolean;
}

const THEME_COLORS = {
  cyan: {
    primary: '#22d3ee',
    primaryRgb: '34, 211, 238',
  },
  amber: {
    primary: '#fbbf24',
    primaryRgb: '251, 191, 36',
  },
};

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  title = 'Scan QR Code',
  description = 'Point your camera at a QR code',
  validator,
  theme = 'cyan',
  showScanCount = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const colors = THEME_COLORS[theme];

  const handleScan = (result: any) => {
    if (result) {
      const scannedText = result?.text;

      if (scannedText && scannedText !== lastScanned) {
        setLastScanned(scannedText);
        setScanCount(prev => prev + 1);

        // Run custom validator if provided
        if (validator) {
          const validation = validator(scannedText);
          if (!validation.valid) {
            setError(validation.error || 'Invalid QR code');
            setTimeout(() => setError(null), 3000);
            return;
          }
        }

        setError(null);
        onScan(scannedText);
      }
    }
  };

  
  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="qr-reader">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            scanDelay={500}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button
              onClick={() => setError(null)}
              className="error-close-btn"
            >
              ×
            </button>
          </div>
        )}

        {showScanCount && scanCount > 0 && (
          <div className="scan-success">
            <span className="scan-indicator">Scanning ({scanCount} attempts)</span>
          </div>
        )}

        <p className="scanner-help">{description}</p>
      </div>

      <style jsx>{`
        .qr-scanner-overlay {
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
          z-index: 2000;
          padding: 1rem;
          box-sizing: border-box;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .qr-scanner-container {
          width: 100%;
          max-width: 600px;
          background: linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(0, 0, 0, 0.98));
          border: 1px solid rgba(${colors.primaryRgb}, 0.3);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(${colors.primaryRgb}, 0.1);
          margin: auto;
        }

        .qr-scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(${colors.primaryRgb}, 0.2);
        }

        .qr-scanner-header h3 {
          margin: 0;
          font-size: 1rem;
          color: ${colors.primary};
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .close-button {
          background: rgba(${colors.primaryRgb}, 0.1);
          border: 1px solid rgba(${colors.primaryRgb}, 0.3);
          border-radius: 6px;
          color: ${colors.primary};
          font-size: 1.5rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          line-height: 1;
        }

        .close-button:hover {
          background: rgba(${colors.primaryRgb}, 0.2);
          border-color: rgba(${colors.primaryRgb}, 0.5);
          box-shadow: 0 0 12px rgba(${colors.primaryRgb}, 0.3);
        }

        .qr-reader {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #000;
        }

        .qr-reader > div {
          position: relative !important;
          width: 100%;
          height: auto;
        }

        .qr-reader video {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        @media (min-width: 768px) {
          .qr-reader {
            aspect-ratio: 16 / 9;
            max-height: 60vh;
          }

          .qr-reader video {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }

        @media (max-width: 767px) {
          .qr-reader {
            aspect-ratio: 4 / 3;
            min-height: 300px;
          }

          .qr-reader video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .scanner-help {
          text-align: center;
          padding: 1rem;
          color: #9ca3af;
          font-size: 0.8rem;
          margin: 0;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.75rem 1rem;
          margin: 0.5rem 1rem;
          text-align: center;
          font-size: 0.85rem;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-close-btn {
          margin-left: 0.5rem;
          font-size: 1.2rem;
          cursor: pointer;
          background: transparent;
          border: none;
          color: #ef4444;
        }

        .scan-success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          padding: 0.5rem 1rem;
          margin: 0.5rem 1rem;
          border-radius: 6px;
          text-align: center;
        }

        .scan-indicator {
          color: #22c55e;
          font-size: 0.8rem;
          font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 767px) {
          .qr-scanner-overlay {
            padding: 0.5rem;
            align-items: flex-start;
            padding-top: 2rem;
          }

          .qr-scanner-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            border-radius: 12px;
          }

          .qr-scanner-header {
            padding: 0.875rem 1rem;
          }

          .qr-scanner-header h3 {
            font-size: 0.9rem;
          }

          .qr-reader {
            min-height: 300px;
          }

          .scanner-help {
            font-size: 0.7rem;
            padding: 0.75rem;
          }

          .error-message {
            font-size: 0.75rem;
            padding: 0.625rem 0.875rem;
          }
        }

        @media (min-width: 768px) {
          .qr-scanner-container {
            max-width: 700px;
          }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;

// Validators for common use cases
export const ethereumAddressValidator = (data: string) => {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (ethAddressRegex.test(data)) {
    return { valid: true };
  }
  return { valid: false, error: 'Invalid Ethereum address QR code. Please scan a valid wallet address.' };
};

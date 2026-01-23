/**
 * Wallet QR Scanner - for scanning wallet addresses
 * Uses the shared QRScanner component with Ethereum address validation
 */
import React from 'react';
import QRScanner, { ethereumAddressValidator } from '../shared/QRScanner';

interface WalletQRScannerProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

const WalletQRScanner: React.FC<WalletQRScannerProps> = ({ onScan, onClose }) => {
  return (
    <QRScanner
      onScan={onScan}
      onClose={onClose}
      title="Scan Wallet QR Code"
      description="Point your camera at a QR code of an Ethereum wallet address"
      validator={ethereumAddressValidator}
      theme="cyan"
    />
  );
};

export default WalletQRScanner;

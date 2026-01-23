/**
 * Admin QR Scanner - for scanning redemption codes
 * Uses the shared QRScanner component with amber theme
 */
import React from 'react';
import QRScanner from '../shared/QRScanner';

interface AdminQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const AdminQRScanner: React.FC<AdminQRScannerProps> = ({ onScan, onClose }) => {
  return (
    <QRScanner
      onScan={onScan}
      onClose={onClose}
      title="Scan Redemption QR Code"
      description="Point your camera at a redemption QR code from the user's wallet"
      theme="amber"
      showScanCount={true}
    />
  );
};

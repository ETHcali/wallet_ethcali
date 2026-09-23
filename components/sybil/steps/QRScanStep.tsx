/**
 * QRScanStep - QR code display for verification scanning
 */
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRScanStepProps {
  verificationUrl: string;
  onCancel: () => void;
}

export const QRScanStep: React.FC<QRScanStepProps> = ({ verificationUrl, onCancel }) => {
  return (
    <div className="space-y-3 text-center">
      <p className="mb-0 text-sm text-content-secondary">Scan with your phone&apos;s camera, or open the app on this device.</p>
      <div className="inline-block rounded-control bg-surface-paper p-3">
        <QRCodeSVG value={verificationUrl} size={184} level="H" includeMargin={false} />
      </div>
      <p className="mb-0 flex items-center justify-center gap-2 text-sm text-content-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-eth-blue" aria-hidden />
        Waiting for the app…
      </p>
      <a
        href={verificationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-tap w-full items-center justify-center rounded-control border border-line-strong text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
      >
        Open ZKPassport on this phone
      </a>
      <button type="button" onClick={onCancel} className="flex min-h-[44px] w-full items-center justify-center rounded-control text-sm font-medium text-content-muted transition-colors hover:text-content-primary disabled:opacity-50">
        Cancel
      </button>
    </div>
  );
};

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
    <div className="space-y-3">
      <div className="bg-black/40 rounded-chip p-4 text-center">
        <p className="text-[10px] text-content-faint font-mono mb-3 tracking-wider">Scan QR</p>
        <div className="bg-surface-paper p-3 rounded-chip inline-block">
          <QRCodeSVG
            value={verificationUrl}
            size={160}
            level="H"
            includeMargin={false}
          />
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-1.5 h-1.5 bg-eth-blue rounded-full animate-pulse"></div>
          <span className="text-[10px] text-content-faint font-mono">WAITING...</span>
        </div>
        <a
          href={verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-eth-blue-text/70 hover:text-eth-blue-text font-mono mt-2 block"
        >
          open_app →
        </a>
      </div>

      <button
        onClick={onCancel}
        className="w-full py-2 bg-surface-slab/50 hover:bg-surface-inset border border-line-hairline rounded-chip text-content-faint font-mono text-[10px]"
      >
        CANCEL
      </button>
    </div>
  );
};

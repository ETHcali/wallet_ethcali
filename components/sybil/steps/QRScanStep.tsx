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
      <div className="bg-black/40 rounded p-4 text-center">
        <p className="text-[10px] text-gray-500 font-mono mb-3 tracking-wider">SCAN_QR</p>
        <div className="bg-white p-3 rounded inline-block">
          <QRCodeSVG
            value={verificationUrl}
            size={160}
            level="H"
            includeMargin={false}
          />
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-gray-600 font-mono">WAITING...</span>
        </div>
        <a
          href={verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-cyan-500/70 hover:text-cyan-400 font-mono mt-2 block"
        >
          open_app →
        </a>
      </div>

      <button
        onClick={onCancel}
        className="w-full py-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono text-[10px]"
      >
        CANCEL
      </button>
    </div>
  );
};

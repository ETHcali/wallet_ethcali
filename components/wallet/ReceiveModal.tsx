import React, { useState } from 'react';
import Image from 'next/image';
import { DEFAULT_CHAIN, explorerAddress } from '../../config/chains';
import { logger } from '../../utils/logger';
import { CameraIcon, CheckIcon, CloseIcon, CopyIcon, ExternalIcon, ShareIcon } from '../shared/icons';
import { Sheet, SHEET_BODY } from '../shared/Sheet';

interface ReceiveModalProps {
  address: string;
  onClose: () => void;
  onScanQR?: () => void;
}

/** What this wallet shows a balance for, so nobody sends a token they will not see. */
const ASSETS = [DEFAULT_CHAIN.nativeSymbol, ...DEFAULT_CHAIN.tokens.map((t) => t.symbol)].join(', ');

const SECONDARY =
  'flex min-h-tap flex-1 items-center justify-center gap-2 rounded-control border border-line-strong px-3 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text';

/** Your address as a QR code and as text, with copy and share. A bottom sheet on a phone. */
const ReceiveModal: React.FC<ReceiveModalProps> = ({ address, onClose, onScanQR }) => {
  const [copied, setCopied] = useState(false);

  // Black on white: scanners read that reliably, whatever the theme.
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${address}&bgcolor=ffffff&color=000000&margin=1`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      void handleCopy();
      return;
    }
    try {
      await navigator.share({ title: 'My wallet address', text: address });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') void handleCopy();
    }
  };

  return (
    <Sheet onClose={onClose} label="Receive">
      <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-2 md:pt-4">
        <h3 className="text-lg font-bold text-content-primary">Receive</h3>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-content-faint transition-colors hover:text-content-primary"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      <div className={`${SHEET_BODY} space-y-4 px-5 pb-5`}>
        <p className="mb-0 text-sm text-content-muted">
          Send only {DEFAULT_CHAIN.name} assets to this address: {ASSETS}.
        </p>

        <div className="mx-auto w-fit rounded-card bg-surface-paper p-3">
          <Image src={qrCodeUrl} alt="QR code of your wallet address" width={220} height={220} className="block h-[220px] w-[220px]" priority unoptimized />
        </div>

        <p className="mb-0 break-all rounded-control bg-surface-inset px-4 py-3 font-mono text-sm leading-relaxed text-content-primary">
          {address}
        </p>

        <div className="flex gap-2">
          <button type="button" onClick={handleCopy} className={SECONDARY}>
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" onClick={handleShare} className={SECONDARY}>
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
          {onScanQR && (
            <button type="button" onClick={onScanQR} className={SECONDARY} aria-label="Scan a code to send">
              <CameraIcon className="h-4 w-4" />
              Scan
            </button>
          )}
        </div>

        <a
          href={explorerAddress(DEFAULT_CHAIN.id, address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-tap items-center justify-center gap-1.5 text-sm text-eth-blue-text hover:underline"
        >
          View on {DEFAULT_CHAIN.explorerName}
          <ExternalIcon className="h-4 w-4" />
        </a>
      </div>
    </Sheet>
  );
};

export default ReceiveModal;

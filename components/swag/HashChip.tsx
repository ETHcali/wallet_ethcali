import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '../shared/icons';
import { EXPLORER_URLS, CHAIN_IDS } from '../../config/constants';

interface HashChipProps {
  hash: string;
  /** 'tx' links to the transaction, 'address' to the account. */
  kind?: 'tx' | 'address';
  className?: string;
}

/** `0x55C9…711d` — a real ellipsis, mono, with copy and the explorer link. */
export function truncateHex(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function HashChip({ hash, kind = 'tx', className = '' }: HashChipProps) {
  const [copied, setCopied] = useState(false);
  const href = `${EXPLORER_URLS[CHAIN_IDS.BASE]}/${kind}/${hash}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is unavailable in some embedded browsers; the link still works.
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-eth-blue-text underline-offset-2 hover:underline"
        title={hash}
      >
        {truncateHex(hash)}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-7 w-7 items-center justify-center rounded-chip text-content-faint transition-colors hover:bg-surface-inset hover:text-content-primary"
        aria-label={copied ? 'Copied' : 'Copy'}
      >
        {copied ? <CheckIcon className="h-4 w-4 text-signal-confirmed" /> : <ClipboardIcon className="h-4 w-4" />}
      </button>
    </span>
  );
}

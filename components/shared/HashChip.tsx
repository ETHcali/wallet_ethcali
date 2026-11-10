import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { CheckIcon, ClipboardIcon } from './icons';
import { ETHEREUM, explorerAddress, explorerTx, publicClientFor } from '../../config/chains';

interface HashChipProps {
  hash: string;
  /** 'tx' links to the transaction, 'address' to the account. */
  kind?: 'tx' | 'address';
  className?: string;
}

/** `0x55C9…711d` — a real ellipsis. */
export function truncateHex(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

/**
 * The primary ENS name of an address on mainnet, or null. Cached for the
 * session: names rarely change and the same few operator wallets repeat on
 * every admin page. A failed lookup is just "no name".
 */
function useEnsName(address: string | null) {
  return useQuery({
    queryKey: ['ens-name', address?.toLowerCase()],
    queryFn: () =>
      publicClientFor(ETHEREUM.id)
        .getEnsName({ address: address as Address })
        .catch(() => null),
    enabled: Boolean(address && /^0x[0-9a-fA-F]{40}$/.test(address)),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });
}

/**
 * A hash or an address on Ethereum: mono, truncated, a link to the explorer
 * and a copy button. An address shows its ENS name when it has one; the full
 * address stays in the title, the link and the clipboard.
 */
export function HashChip({ hash, kind = 'tx', className = '' }: HashChipProps) {
  const [copied, setCopied] = useState(false);
  const { data: name } = useEnsName(kind === 'address' ? hash : null);
  const href = kind === 'tx' ? explorerTx(ETHEREUM.id, hash) : explorerAddress(ETHEREUM.id, hash);

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
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate font-mono text-sm text-eth-blue-text underline-offset-2 hover:underline"
        title={name ? `${name} · ${hash}` : hash}
      >
        {name ?? truncateHex(hash)}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-chip text-content-faint transition-colors hover:bg-surface-inset hover:text-content-primary"
        aria-label={copied ? 'Copied' : kind === 'address' ? 'Copy address' : 'Copy hash'}
      >
        {copied ? <CheckIcon className="h-4 w-4 text-signal-confirmed" /> : <ClipboardIcon className="h-4 w-4" />}
      </button>
    </span>
  );
}

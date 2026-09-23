import React, { useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { DEFAULT_CHAIN, explorerAddress } from '../../config/chains';
import { useUserENS } from '../../hooks/ens';
import { ClipboardIcon } from '../shared/icons';

interface IdentityHeaderProps {
  address: string;
}

/** Real ellipsis, per BRAND.md: `0x55C9…711d`. */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const smallControl =
  'inline-flex min-h-[36px] items-center gap-1.5 rounded-chip border border-line-hairline bg-surface-inset px-3 font-mono text-xs text-content-secondary transition-colors hover:border-line-brand hover:text-eth-blue-text';

/**
 * Who is signed in, compactly: the account they signed in with, their
 * ethcali.eth name if they hold one, and the active address. This replaced
 * the profile page; the ENS claim itself lives on Identity, and Sign out lives
 * in the navigation — the one place, not two.
 */
const IdentityHeader: React.FC<IdentityHeaderProps> = ({ address }) => {
  const { user } = usePrivy();
  const { fullName, isLoading: isNameLoading } = useUserENS(address);
  const [copied, setCopied] = useState(false);

  // Email first, then Google, then the method itself. A wallet login has no
  // email to show, and inventing one from the address would be noise.
  const email = user?.email?.address ?? user?.google?.email ?? null;
  const signedInWith = email
    ? null
    : user?.linkedAccounts?.some((a) => a.type === 'passkey')
      ? 'Signed in with passkey'
      : 'Signed in with wallet';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable over plain http or when denied; the
      // address stays selectable in the title attribute.
    }
  };

  return (
    <section
      className="rounded-card border border-line-hairline bg-surface-slab p-4 sm:p-5"
      aria-label="Account"
    >
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">Signed in as</p>
        <p className="mt-1 truncate text-sm text-content-primary" title={email ?? undefined}>
          {email ?? signedInWith}
        </p>

        {fullName ? (
          <p className="mt-1 break-all font-mono text-sm text-eth-blue-text">{fullName}</p>
        ) : isNameLoading ? (
          <p className="mt-1 font-mono text-xs text-content-faint">Checking your ethcali.eth name…</p>
        ) : (
          <Link href="/sybil" className="mt-1 inline-block font-mono text-xs text-content-muted hover:text-eth-blue-text">
            Claim your ethcali.eth name →
          </Link>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-content-primary" title={address}>
            {truncateAddress(address)}
          </span>
          <button type="button" onClick={copy} className={smallControl} aria-label="Copy address">
            <ClipboardIcon className="h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <a
            href={explorerAddress(DEFAULT_CHAIN.id, address)}
            target="_blank"
            rel="noopener noreferrer"
            className={smallControl}
          >
            Explorer ↗
          </a>
        </div>
      </div>
    </section>
  );
};

export default IdentityHeader;

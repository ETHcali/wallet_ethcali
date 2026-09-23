import React, { useState } from 'react';
import { useBeneficiaryProfile, useBeneficiarySafe } from '../../hooks/donations';
import { getChain } from '../../config/chains';
import { logger } from '../../utils/logger';

interface BeneficiaryCardProps {
  beneficiary: string;
  chainId: number;
  /** Router mode — donations reach the Safe in the same transaction. */
  autoForward: boolean;
}

function truncate(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Shows exactly where a donation ends up, before the donor commits.
 *
 * Covers the address-UX requirements in one place: ENS name, avatar, explorer
 * link, copy-to-clipboard, safe truncation — plus the multisig threshold, which
 * is the part that actually earns trust.
 */
const BeneficiaryCard: React.FC<BeneficiaryCardProps> = ({
  beneficiary,
  chainId,
  autoForward,
}) => {
  const { data: profile } = useBeneficiaryProfile(beneficiary);
  const { data: safe } = useBeneficiarySafe(beneficiary, chainId);
  const [copied, setCopied] = useState(false);

  const explorer = getChain(chainId)?.explorerUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(beneficiary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('[BeneficiaryCard] copy failed', err);
    }
  };

  return (
    <div className="rounded-card border border-line-hairline bg-surface-slab p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-content-secondary">Funds go to</h3>
        {safe && (
          <span className="shrink-0 rounded-full bg-eth-blue-wash px-2 py-0.5 text-xs font-semibold text-eth-blue-text">
            {safe.threshold}-of-{safe.ownerCount} multisig
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {profile?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar}
            alt=""
            className="h-10 w-10 rounded-full border border-line-strong object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-surface-ridge text-sm font-bold text-eth-blue-text">
            EC
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-content-primary">
            {profile?.ensName || truncate(beneficiary)}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-content-muted">
            <span className="font-mono">{truncate(beneficiary)}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[44px] items-center text-content-faint transition-colors hover:text-eth-blue-text"
              title="Copy address"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            {explorer && (
              <a
                href={`${explorer}/address/${beneficiary}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center text-content-faint transition-colors hover:text-eth-blue-text"
              >
                Explorer ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="mb-0 mt-2 text-xs leading-relaxed text-content-muted">
        {autoForward ? (
          <>
            Every donation is forwarded to this wallet{' '}
            <span className="text-content-secondary">in the same transaction</span>. The
            contract never holds your funds and no administrator can redirect them.
          </>
        ) : (
          <>
            Funds are held by the donation contract and can only ever be withdrawn
            to this address.
          </>
        )}
      </p>

      {profile?.url && (
        <a
          href={profile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-eth-blue-text hover:underline"
        >
          {profile.url.replace(/^https?:\/\//, '')} ↗
        </a>
      )}
    </div>
  );
};

export default BeneficiaryCard;

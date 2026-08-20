import React, { useState } from 'react';
import { useBeneficiaryProfile, useBeneficiarySafe } from '../../hooks/donations';
import { EXPLORER_URLS, type ChainId } from '../../config/constants';
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

  const explorer = EXPLORER_URLS[chainId as ChainId];

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
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Funds go to</h3>
        {safe && (
          <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-400">
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
            className="h-10 w-10 rounded-full border border-slate-600 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-sm font-bold text-cyan-400">
            EC
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">
            {profile?.ensName || truncate(beneficiary)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono">{truncate(beneficiary)}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-500 transition-colors hover:text-cyan-400"
              title="Copy address"
            >
              {copied ? 'copied' : 'copy'}
            </button>
            {explorer && (
              <a
                href={`${explorer}/address/${beneficiary}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 transition-colors hover:text-cyan-400"
              >
                explorer ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {autoForward ? (
          <>
            Every donation is forwarded to this wallet{' '}
            <span className="text-slate-300">in the same transaction</span>. The
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
          className="mt-2 inline-block text-xs text-cyan-400 hover:underline"
        >
          {profile.url.replace(/^https?:\/\//, '')} ↗
        </a>
      )}
    </div>
  );
};

export default BeneficiaryCard;

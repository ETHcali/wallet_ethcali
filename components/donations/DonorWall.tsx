import React from 'react';
import { useDonorWall, useDisplayCurrency } from '../../hooks/donations';
import type { DonationToken } from '../../types/donations';
import { EXPLORER_URLS, type ChainId } from '../../config/constants';

interface DonorWallProps {
  campaignId: number;
  token: DonationToken;
  chainId: number;
}

function truncate(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const DonorWall: React.FC<DonorWallProps> = ({ campaignId, token, chainId }) => {
  const { data, isLoading } = useDonorWall(campaignId, token, chainId);
  const { format, formatToken } = useDisplayCurrency();

  const explorer = EXPLORER_URLS[chainId as ChainId];
  const entries = data?.entries ?? [];

  return (
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content-secondary">
          Donors <span className="text-content-faint">· {token.symbol}</span>
        </h3>
        {data?.source === 'chain' && (
          <span
            className="text-[10px] text-content-faint"
            title="Reading directly from the contract — individual messages appear once the indexer catches up"
          >
            live from chain
          </span>
        )}
      </div>

      {isLoading && <p className="py-6 text-center text-sm text-content-faint">Loading…</p>}

      {!isLoading && entries.length === 0 && (
        <p className="py-6 text-center text-sm text-content-faint">
          No donations in {token.symbol} yet. Be the first.
        </p>
      )}

      <ul className="space-y-2">
        {entries.map((entry, i) => (
          <li
            key={entry.txHash ?? `${entry.donor}-${i}`}
            className="flex items-start justify-between gap-3 rounded-control border border-line-hairline bg-surface-slab/40 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-content-primary">
                  {entry.ensName || truncate(entry.donor)}
                </span>
                {entry.blockTime && (
                  <span className="text-[10px] text-content-faint">
                    {timeAgo(entry.blockTime)}
                  </span>
                )}
              </div>
              {entry.message && (
                <p className="mt-1 break-words text-xs italic text-content-muted">
                  “{entry.message}”
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold text-eth-blue-text">
                {formatToken(entry.amount, token)}
              </div>
              <div className="text-[10px] text-content-faint">
                {format(entry.amount, token)}
              </div>
              {entry.txHash && explorer && (
                <a
                  href={`${explorer}/tx/${entry.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-content-faint hover:text-eth-blue-text"
                >
                  tx ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonorWall;

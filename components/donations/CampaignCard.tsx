import React, { useMemo } from 'react';
import {
  useCampaignTotals,
  useDisplayCurrency,
  useFxRates,
  tokenToUsd,
} from '../../hooks/donations';
import type { Campaign } from '../../types/donations';
import { formatCop, formatUsd } from '../../utils/money';

interface CampaignCardProps {
  campaign: Campaign;
  chainId: number;
  onDonate: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, chainId, onDonate }) => {
  const { data: totals = [], isLoading } = useCampaignTotals(campaign.id, chainId);
  const { convert, formatValue, formatToken, currency } = useDisplayCurrency();
  const { data: fx } = useFxRates();

  // Totals span several currencies with different decimals, so each is
  // normalised to the display currency before being added.
  const grandTotal = useMemo(
    () => totals.reduce((sum, t) => sum + convert(t.raised, t.token), 0),
    [totals, convert]
  );

  const withFunds = totals.filter((t) => t.raised > 0n);

  return (
    <div className="rounded-card border border-line-hairline bg-surface-slab p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-lg font-bold leading-snug text-content-primary">{campaign.name}</h2>
          {campaign.description && (
            <p className="mb-0 mt-1 text-sm leading-relaxed text-content-muted">
              {campaign.description}
            </p>
          )}
        </div>
        {campaign.active ? (
          <span className="shrink-0 rounded-full bg-eth-blue-wash px-2 py-0.5 text-xs font-semibold text-eth-blue-text">
            Open
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-surface-inset px-2 py-0.5 text-xs font-semibold text-content-muted">
            Closed
          </span>
        )}
      </div>

      {/* Raised — always totalRaised, never the vault balance. In router mode the
          balance is ~0 because funds forward immediately, which would render a
          live campaign as permanently empty. */}
      <div className="mb-4">
        <div className="font-mono text-3xl font-bold tabular-nums tracking-tight text-content-primary">
          {isLoading ? '—' : formatValue(grandTotal)}
        </div>
        <div className="text-xs text-content-faint">
          raised in total{currency !== 'USD' ? ` (shown in ${currency})` : ''}
        </div>
      </div>

      {/* Per token: the quantity actually received, then what it is worth. The
          quantity is the fact — it is what the chain recorded. The dollar and
          peso figures are estimates that move with the market, so they are
          rendered as secondary and labelled approximate. Pesos use the TRM. */}
      {withFunds.length > 0 && fx && (
        <div className="mb-4 divide-y divide-line-hairline border-y border-line-hairline">
          {withFunds.map((t) => {
            const usd = tokenToUsd(t.raised, t.token, fx);
            return (
              <div
                key={t.token.address}
                className="flex flex-wrap items-baseline justify-between gap-x-3 py-2"
              >
                <span className="font-mono text-sm text-content-secondary">
                  {formatToken(t.raised, t.token)}
                </span>
                <span className="font-mono text-xs text-content-faint">
                  ≈ {formatUsd(usd)} · {formatCop(usd * fx.usdToCop, { approx: false })}
                </span>
              </div>
            );
          })}
          {fx.usdToCopIsStale && (
            <p className="mb-0 py-2 text-xs text-content-muted">
              Peso values are approximate — the TRM feed is unavailable right now.
            </p>
          )}
        </div>
      )}

      <div className="mb-4 flex gap-4 text-xs text-content-faint">
        <span>
          <span className="font-semibold text-content-secondary">{campaign.donorCount}</span> donors
        </span>
        <span>
          <span className="font-semibold text-content-secondary">{campaign.donationCount}</span>{' '}
          donations
        </span>
      </div>

      <button
        type="button"
        onClick={onDonate}
        disabled={!campaign.active}
        className="min-h-tap w-full rounded-control bg-eth-blue text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
      >
        {campaign.active ? 'Donate' : 'Campaign closed'}
      </button>
    </div>
  );
};

export default CampaignCard;

import React, { useMemo } from 'react';
import {
  useCampaignTotals,
  useDisplayCurrency,
  useFxRates,
  tokenToUsd,
} from '../../hooks/donations';
import type { Campaign } from '../../types/donations';

/** Pesos are not quoted in cents; dollars are. */
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

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
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-white">{campaign.name}</h2>
          {campaign.description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              {campaign.description}
            </p>
          )}
        </div>
        {campaign.active ? (
          <span className="shrink-0 rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-400">
            Open
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-slate-600 bg-slate-700/40 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
            Closed
          </span>
        )}
      </div>

      {/* Raised — always totalRaised, never the vault balance. In router mode the
          balance is ~0 because funds forward immediately, which would render a
          live campaign as permanently empty. */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-white">
          {isLoading ? '—' : formatValue(grandTotal)}
        </div>
        <div className="text-xs text-slate-500">
          raised in total{currency !== 'USD' ? ` (shown in ${currency})` : ''}
        </div>
      </div>

      {/* Per token: the quantity actually received, then what it is worth. The
          quantity is the fact — it is what the chain recorded. The dollar and
          peso figures are estimates that move with the market, so they are
          rendered as secondary and labelled approximate. Pesos use the TRM. */}
      {withFunds.length > 0 && fx && (
        <div className="mb-4 space-y-1.5">
          {withFunds.map((t) => {
            const usd = tokenToUsd(t.raised, t.token, fx);
            return (
              <div
                key={t.token.address}
                className="flex items-baseline justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2"
              >
                <span className="font-mono text-sm text-slate-200">
                  {formatToken(t.raised, t.token)}
                </span>
                <span className="shrink-0 font-mono text-xs text-slate-500">
                  ≈ {usdFormatter.format(usd)} · {copFormatter.format(usd * fx.usdToCop)}
                </span>
              </div>
            );
          })}
          {fx.usdToCopIsStale && (
            <p className="pt-0.5 text-[11px] text-amber-400/80">
              Peso values are approximate — the TRM feed is unavailable right now.
            </p>
          )}
        </div>
      )}

      <div className="mb-4 flex gap-4 text-xs text-slate-500">
        <span>
          <span className="font-semibold text-slate-300">{campaign.donorCount}</span> donors
        </span>
        <span>
          <span className="font-semibold text-slate-300">{campaign.donationCount}</span>{' '}
          donations
        </span>
      </div>

      <button
        type="button"
        onClick={onDonate}
        disabled={!campaign.active}
        className="w-full rounded-lg bg-green-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {campaign.active ? 'Donate' : 'Campaign closed'}
      </button>
    </div>
  );
};

export default CampaignCard;

import React from 'react';
import { useDisplayCurrency } from '../../hooks/donations';
import type { DisplayCurrency } from '../../types/donations';

const OPTIONS: Array<{ value: DisplayCurrency; label: string; title: string }> = [
  { value: 'USD', label: 'USD', title: 'Show totals in US dollars' },
  { value: 'COP', label: 'COP', title: 'Show totals in Colombian pesos' },
  { value: 'ETH', label: 'ETH', title: 'Show totals in ETH' },
];

/**
 * Switches the currency every total on the page is displayed in.
 * Donors in Cali think in pesos; the wider audience thinks in dollars or ETH.
 * The choice persists across visits.
 */
const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency, isLoading } = useDisplayCurrency();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-control border border-line-hairline bg-surface-inset/60 p-1"
      role="group"
      aria-label="Display currency"
    >
      {OPTIONS.map((option) => {
        const active = currency === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setCurrency(option.value)}
            title={option.title}
            aria-pressed={active}
            className={`min-h-[36px] rounded-chip px-3 text-xs font-semibold transition-colors sm:min-h-0 sm:py-1 ${
              active
                ? 'bg-eth-blue text-on-brand'
                : 'text-content-muted hover:bg-surface-ridge hover:text-content-primary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
      {isLoading && (
        <span className="px-2 text-[10px] text-content-faint" aria-live="polite">
          rates…
        </span>
      )}
    </div>
  );
};

export default CurrencyToggle;

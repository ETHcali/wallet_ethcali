/**
 * Display currency for donation totals — USD, COP or ETH.
 *
 * Donors in Cali think in pesos; the wider crypto audience thinks in dollars or
 * ETH. Totals are summed across several tokens with different decimals, so every
 * amount is normalised to one unit before being added. Formatting always uses the
 * token's own decimals, never a hardcoded 18.
 */
import { formatCop, formatUsd } from '../../utils/money';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DisplayCurrency, DonationToken } from '../../types/donations';
import { logger } from '../../utils/logger';
import { fetchUsdPrices } from '../useTokenPrices';

interface DisplayCurrencyState {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
}

/** Persisted so a Colombian donor is not re-asked to pick COP on every visit. */
export const useDisplayCurrencyStore = create<DisplayCurrencyState>()(
  persist(
    (set) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'ethcali-display-currency' }
  )
);

export interface FxRates {
  /** USD price of one unit of each CoinGecko id. */
  usd: Record<string, number>;
  /** How many COP one USD buys — the official TRM. */
  usdToCop: number;
  /** True when the TRM feed failed and usdToCop is the stale constant below. */
  usdToCopIsStale: boolean;
  /** USD price of 1 ETH, used for the ETH display mode. 0 when unknown. */
  ethUsd: number;
  /** True when no price source answered; USD/COP/ETH conversions are unknown. */
  pricesUnavailable: boolean;
}

/**
 * Last-resort rate, used only when the TRM endpoint is unreachable.
 *
 * This was 4000 and never updated, because the code path that was supposed to
 * replace it could not work: CoinGecko does not support COP — it is absent from
 * /simple/supported_vs_currencies, so `cop` came back undefined on every call
 * and the fallback WAS the production rate. Against a real TRM of ~3063 that
 * overstated every peso amount on the site by roughly 31%.
 *
 * Kept as a genuine observed TRM (21 Aug 2026) rather than a round number, and
 * flagged as stale whenever it is used, so a wrong figure cannot pass silently
 * for an official one.
 */
const STALE_TRM = 3062.96;

/**
 * Before the first answer: no crypto prices at all. `usd` empty means every
 * USD figure reads 0 and `pricesUnavailable` tells the UI to show a dash —
 * there is no hardcoded ETH price (a $3,500 fallback here once overstated
 * every dollar figure by ~31%).
 */
const NO_RATES: FxRates = {
  usd: {},
  usdToCop: STALE_TRM,
  usdToCopIsStale: true,
  ethUsd: 0,
  pricesUnavailable: true,
};

/**
 * Crypto prices come from /api/prices (CoinGecko, then Coinbase, edge-cached);
 * the peso rate comes from the TRM endpoint, which reads the Superintendencia
 * Financiera feed. Two sources because no single one is both authoritative
 * for COP and useful for crypto.
 */
async function fetchFxRates(): Promise<FxRates> {
  const [priceRes, trmRes] = await Promise.allSettled([fetchUsdPrices(), fetch('/api/fx/trm')]);

  const usd: Record<string, number> = {};
  if (priceRes.status === 'fulfilled') {
    for (const [id, quote] of Object.entries(priceRes.value.prices)) if (quote) usd[id] = quote.usd;
  } else {
    logger.debug('[useDisplayCurrency] prices unavailable; USD figures will show as unknown');
  }
  const ethUsd = usd.ethereum ?? 0;

  let usdToCop = STALE_TRM;
  let usdToCopIsStale = true;

  if (trmRes.status === 'fulfilled' && trmRes.value.ok) {
    const trm = (await trmRes.value.json()) as { rate?: number };
    if (typeof trm.rate === 'number' && trm.rate > 0) {
      usdToCop = trm.rate;
      usdToCopIsStale = false;
    }
  } else {
    logger.debug('[useDisplayCurrency] TRM unavailable, peso figures are approximate');
  }

  return { usd, usdToCop, usdToCopIsStale, ethUsd, pricesUnavailable: ethUsd === 0 };
}

export function useFxRates() {
  return useQuery({
    queryKey: ['donation-fx-rates'],
    queryFn: fetchFxRates,
    // Rates move slowly relative to a donation session; do not hammer the API.
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 15,
    retry: 1,

  });
}

export interface CurrencyFormatter {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  isLoading: boolean;
  /** Value of a raw token amount in the selected display currency. */
  convert: (amount: bigint, token: DonationToken) => number;
  /** Formatted value in the selected display currency, e.g. "$1,250.00". */
  format: (amount: bigint, token: DonationToken) => string;
  /** No price source answered: show token amounts only. */
  pricesUnavailable: boolean;
  /** Formatted plain number, e.g. "1,250.00" — no symbol. */
  formatValue: (value: number) => string;
  /** The token amount itself, e.g. "25.00 USDC" — uses the token's decimals. */
  formatToken: (amount: bigint, token: DonationToken) => string;
}

/**
 * Raw token amount → USD.
 *
 * Module-level and pure so a component that has to show several currencies at
 * once (the campaign page shows the token amount, the dollar value and the peso
 * value side by side) can reuse it instead of re-deriving prices.
 */
export function tokenToUsd(amount: bigint, token: DonationToken, fx: FxRates): number {
  const units = Number(formatUnits(amount, token.decimals));

  if (!token.coingeckoId) {
    logger.debug('[useDisplayCurrency] no price source for token', token.symbol);
    return 0;
  }

  return units * (fx.usd[token.coingeckoId] ?? 0);
}

export function useDisplayCurrency(): CurrencyFormatter {
  const { currency, setCurrency } = useDisplayCurrencyStore();
  const { data: rates, isLoading } = useFxRates();

  const fx = rates ?? NO_RATES;

  const toUsd = useCallback(
    (amount: bigint, token: DonationToken): number => tokenToUsd(amount, token, fx),
    [fx]
  );

  const convert = useCallback(
    (amount: bigint, token: DonationToken): number => {
      const usd = toUsd(amount, token);
      if (currency === 'USD') return usd;
      if (currency === 'COP') return usd * fx.usdToCop;
      return fx.ethUsd > 0 ? usd / fx.ethUsd : 0;
    },
    [toUsd, currency, fx]
  );

  const formatValue = useCallback(
    (value: number): string => {
      if (currency === 'ETH') {
        return `${value.toLocaleString('en-US', {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        })} ETH`;
      }

      // One format for the whole app: utils/money. Pesos here are a conversion.
      return currency === 'COP' ? formatCop(value) : formatUsd(value, { cents: true });
    },
    [currency]
  );

  // A conversion with no price is unknown, not zero.
  const format = useCallback(
    (amount: bigint, token: DonationToken) => (fx.pricesUnavailable ? '—' : formatValue(convert(amount, token))),
    [convert, formatValue, fx.pricesUnavailable]
  );

  const formatToken = useCallback((amount: bigint, token: DonationToken): string => {
    // The token's OWN decimals. USDC is 6 — assuming 18 here would be a
    // 10^12 error on a USDC total.
    const units = Number(formatUnits(amount, token.decimals));
    const digits = units > 0 && units < 0.01 ? 6 : 2;
    return `${units.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    })} ${token.symbol}`;
  }, []);

  return { currency, setCurrency, isLoading, pricesUnavailable: fx.pricesUnavailable, convert, format, formatValue, formatToken };
}

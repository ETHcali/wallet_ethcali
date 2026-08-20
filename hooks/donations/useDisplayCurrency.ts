/**
 * Display currency for donation totals — USD, COP or ETH.
 *
 * Donors in Cali think in pesos; the wider crypto audience thinks in dollars or
 * ETH. Totals are summed across several tokens with different decimals, so every
 * amount is normalised to one unit before being added. Formatting always uses the
 * token's own decimals, never a hardcoded 18.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DisplayCurrency, DonationToken } from '../../types/donations';
import { logger } from '../../utils/logger';

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
  /** How many COP one USD buys. */
  usdToCop: number;
  /** USD price of 1 ETH, used for the ETH display mode. */
  ethUsd: number;
}

const FALLBACK_RATES: FxRates = {
  usd: { ethereum: 3500, 'usd-coin': 1, celo: 0.5 },
  usdToCop: 4000,
  ethUsd: 3500,
};

/**
 * CoinGecko quotes crypto in several fiat currencies at once, so USD and COP
 * come back in a single request.
 */
async function fetchFxRates(): Promise<FxRates> {
  const ids = 'ethereum,usd-coin,celo';
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,cop`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);

  const data = (await res.json()) as Record<string, { usd?: number; cop?: number }>;

  const ethUsd = data.ethereum?.usd ?? FALLBACK_RATES.ethUsd;
  const ethCop = data.ethereum?.cop;

  return {
    usd: {
      ethereum: ethUsd,
      'usd-coin': data['usd-coin']?.usd ?? 1,
      celo: data.celo?.usd ?? FALLBACK_RATES.usd.celo,
    },
    // Derive USD→COP from any asset quoted in both, so we need no separate feed.
    usdToCop: ethCop && ethUsd ? ethCop / ethUsd : FALLBACK_RATES.usdToCop,
    ethUsd,
  };
}

export function useFxRates() {
  return useQuery({
    queryKey: ['donation-fx-rates'],
    queryFn: fetchFxRates,
    // Rates move slowly relative to a donation session; do not hammer the API.
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    retry: 1,
    placeholderData: FALLBACK_RATES,
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
  /** Formatted plain number, e.g. "1,250.00" — no symbol. */
  formatValue: (value: number) => string;
  /** The token amount itself, e.g. "25.00 USDC" — uses the token's decimals. */
  formatToken: (amount: bigint, token: DonationToken) => string;
}

export function useDisplayCurrency(): CurrencyFormatter {
  const { currency, setCurrency } = useDisplayCurrencyStore();
  const { data: rates, isLoading } = useFxRates();

  const fx = rates ?? FALLBACK_RATES;

  /** Raw token amount → USD. */
  const toUsd = useCallback(
    (amount: bigint, token: DonationToken): number => {
      const units = Number(formatUnits(amount, token.decimals));

      // COPm is a Colombian peso stablecoin: 1 COPm ≈ 1 COP.
      if (token.symbol === 'COPm') {
        return fx.usdToCop > 0 ? units / fx.usdToCop : 0;
      }

      if (!token.coingeckoId) {
        logger.debug('[useDisplayCurrency] no price source for token', token.symbol);
        return 0;
      }

      return units * (fx.usd[token.coingeckoId] ?? 0);
    },
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

      return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US', {
        style: 'currency',
        currency,
        // Pesos are not quoted in cents.
        minimumFractionDigits: currency === 'COP' ? 0 : 2,
        maximumFractionDigits: currency === 'COP' ? 0 : 2,
      }).format(value);
    },
    [currency]
  );

  const format = useCallback(
    (amount: bigint, token: DonationToken) => formatValue(convert(amount, token)),
    [convert, formatValue]
  );

  const formatToken = useCallback((amount: bigint, token: DonationToken): string => {
    // The token's OWN decimals. USDC 6, COPm 18 — assuming 18 here would be a
    // 10^12 error on a USDC total.
    const units = Number(formatUnits(amount, token.decimals));
    const digits = units > 0 && units < 0.01 ? 6 : 2;
    return `${units.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    })} ${token.symbol}`;
  }, []);

  return { currency, setCurrency, isLoading, convert, format, formatValue, formatToken };
}

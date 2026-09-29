/**
 * USD prices, from the app's own /api/prices (edge-cached 15 minutes).
 *
 * One query key for the whole app — the navbar ticker, wallet balances, the
 * faucet and the donation totals share it, so a page load is one request.
 * When prices are unavailable the price reads 0 and every caller shows a
 * dash; there is no hardcoded fallback price anywhere.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { COINGECKO_IDS } from '../utils/tokenUtils';
import type { PriceId, PricesResponse } from '../lib/prices';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const pricesKey = ['usd-prices'] as const;

export async function fetchUsdPrices(): Promise<PricesResponse> {
  const res = await fetch('/api/prices');
  if (!res.ok) throw new Error('Prices are unavailable right now');
  return (await res.json()) as PricesResponse;
}

export function usePricesQuery() {
  return useQuery({
    queryKey: pricesKey,
    queryFn: fetchUsdPrices,
    staleTime: FIFTEEN_MINUTES,
    refetchInterval: FIFTEEN_MINUTES,
    retry: 1,
  });
}

export function useTokenPrices() {
  const query = usePricesQuery();
  const prices = query.data?.prices;

  /** { price: 0 } means unknown — callers render a dash, never $0.00. */
  const getPriceForToken = useCallback(
    (tokenSymbol: string): { price: number; change24h: number | null } => {
      const quote = prices?.[COINGECKO_IDS[tokenSymbol] as PriceId];
      return quote ? { price: quote.usd, change24h: quote.change24h } : { price: 0, change24h: null };
    },
    [prices]
  );

  return {
    prices,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    getPriceForToken,
  };
}

import { useQuery } from '@tanstack/react-query';
import { getQuote, type LiFiQuoteRequest, type LiFiQuoteResponse } from '../lib/lifi';

interface UseSwapQuoteParams {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  slippage?: number;
  enabled?: boolean;
}

interface UseSwapQuoteResult {
  quote: LiFiQuoteResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React Query hook for fetching LiFi swap quotes
 * Automatically refetches when parameters change
 */
export function useSwapQuote({
  fromChain,
  toChain,
  fromToken,
  toToken,
  fromAmount,
  fromAddress,
  slippage = 0.03,
  enabled = true,
}: UseSwapQuoteParams): UseSwapQuoteResult {
  // Only fetch if we have valid parameters
  const shouldFetch = Boolean(
    enabled &&
    fromChain > 0 &&
    toChain > 0 &&
    fromToken &&
    toToken &&
    fromAmount &&
    fromAmount !== '0' &&
    fromAddress
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery<LiFiQuoteResponse>({
    queryKey: ['lifi-quote', fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, slippage],
    queryFn: async () => {
      const params: LiFiQuoteRequest = {
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
        slippage,
      };
      return getQuote(params);
    },
    enabled: shouldFetch,
    staleTime: 30_000, // Quote valid for 30 seconds
    gcTime: 60_000, // Keep in cache for 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    quote: data,
    isLoading: isLoading && shouldFetch,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}

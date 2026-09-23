/**
 * The wallet's balances on Ethereum: ETH plus every ERC-20 the registry lists.
 *
 * One query, read with the registry's own client — never the wallet's
 * provider — so what is shown does not depend on which network the wallet
 * happens to be on. A failed read reports `isError` and the rows stay zero;
 * the UI must not present those zeros as balances.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_CHAIN, publicClientFor, type TokenInfo } from '../config/chains';
import { logger } from '../utils/logger';

const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface BalanceRow {
  symbol: string;
  name: string;
  /** The token's own decimals — 18 for ETH, 6 for the stablecoins. */
  decimals: number;
  /** Null for ETH. */
  address: `0x${string}` | null;
  balance: bigint;
  coingeckoId: string;
  isNative: boolean;
}

const CHAIN = DEFAULT_CHAIN;

function emptyRows(): BalanceRow[] {
  return [
    {
      symbol: CHAIN.nativeSymbol,
      name: CHAIN.nativeName,
      decimals: 18,
      address: null,
      balance: 0n,
      coingeckoId: CHAIN.nativeCoingeckoId,
      isNative: true,
    },
    ...CHAIN.tokens.map((t: TokenInfo) => ({
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      address: t.address,
      balance: 0n,
      coingeckoId: t.coingeckoId,
      isNative: false,
    })),
  ];
}

async function readBalances(address: `0x${string}`): Promise<BalanceRow[]> {
  const client = publicClientFor(CHAIN.id);
  const rows = emptyRows();

  const [native, tokenResults] = await Promise.all([
    client.getBalance({ address }),
    client.multicall({
      contracts: CHAIN.tokens.map((t) => ({
        address: t.address,
        abi: ERC20_BALANCE_ABI,
        functionName: 'balanceOf' as const,
        args: [address] as const,
      })),
      allowFailure: true,
    }),
  ]);

  rows[0].balance = native;
  tokenResults.forEach((result, i) => {
    if (result.status === 'success') {
      rows[i + 1].balance = result.result as bigint;
    } else {
      logger.debug(`[useBalances] ${CHAIN.tokens[i].symbol} balance failed`, result.error);
    }
  });

  return rows;
}

export function useBalances(address: string | undefined) {
  const queryClient = useQueryClient();
  const owner = address as `0x${string}` | undefined;

  const query = useQuery({
    queryKey: ['balances', CHAIN.id, owner?.toLowerCase()],
    queryFn: () => readBalances(owner as `0x${string}`),
    enabled: Boolean(owner),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
  });

  return {
    rows: query.data ?? emptyRows(),
    isLoading: query.isPending,
    isError: query.isError,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['balances'] }),
  };
}

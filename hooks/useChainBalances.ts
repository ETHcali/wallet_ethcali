/**
 * Balances grouped by chain, for every chain in `chainsFor('send')`.
 *
 * One query per chain, each with that chain's own client from the registry —
 * never the wallet's provider — so a wallet on Optimism still shows its Base
 * USDC. A chain whose RPC fails reports `error` for that group only; the
 * others render.
 */
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { chainsFor, publicClientFor, type ChainInfo, type TokenInfo } from '../config/chains';
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
  /** The token's own decimals — 18 for the native coin, 6 or 18 for ERC-20s. */
  decimals: number;
  /** Null for the chain's native coin. */
  address: `0x${string}` | null;
  balance: bigint;
  coingeckoId: string | null;
  isNative: boolean;
}

export interface ChainBalances {
  chain: ChainInfo;
  rows: BalanceRow[];
  /** True while this chain's first read is in flight. */
  pending: boolean;
  /** True when this chain's read failed; the rows are zeros and must not be trusted. */
  error: boolean;
}

const SEND_CHAINS = chainsFor('send');

function emptyRows(chain: ChainInfo): BalanceRow[] {
  return [
    {
      symbol: chain.nativeSymbol,
      name: chain.nativeName,
      decimals: 18,
      address: null,
      balance: 0n,
      coingeckoId: chain.nativeCoingeckoId,
      isNative: true,
    },
    ...chain.tokens.map((t: TokenInfo) => ({
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

async function readChain(chain: ChainInfo, address: `0x${string}`): Promise<BalanceRow[]> {
  const client = publicClientFor(chain.id);
  const rows = emptyRows(chain);

  const [native, tokenResults] = await Promise.all([
    client.getBalance({ address }),
    chain.tokens.length > 0
      ? client.multicall({
          contracts: chain.tokens.map((t) => ({
            address: t.address,
            abi: ERC20_BALANCE_ABI,
            functionName: 'balanceOf' as const,
            args: [address] as const,
          })),
          allowFailure: true,
        })
      : Promise.resolve([]),
  ]);

  rows[0].balance = native;
  tokenResults.forEach((result, i) => {
    if (result.status === 'success') {
      rows[i + 1].balance = result.result as bigint;
    } else {
      logger.debug(`[useChainBalances] ${chain.name} ${chain.tokens[i].symbol} balance failed`, result.error);
    }
  });

  return rows;
}

export function useChainBalances(address: string | undefined) {
  const queryClient = useQueryClient();
  const owner = address as `0x${string}` | undefined;

  const balances = useQueries({
    queries: SEND_CHAINS.map((chain) => ({
      queryKey: ['chain-balances', chain.id, owner?.toLowerCase()],
      queryFn: () => readChain(chain, owner as `0x${string}`),
      enabled: Boolean(owner),
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
    })),
    combine: (results): ChainBalances[] =>
      results.map((result, i) => ({
        chain: SEND_CHAINS[i],
        rows: result.data ?? emptyRows(SEND_CHAINS[i]),
        pending: result.isPending,
        error: result.isError,
      })),
  });

  return {
    balances,
    isLoading: balances.some((b) => b.pending),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['chain-balances'] }),
  };
}

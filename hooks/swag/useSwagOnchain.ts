/**
 * What the collection says right now, for a set of token ids: what is left
 * for crypto buyers, what USDC the contract will charge, whether a buy of one
 * would go through, and whether the store is paused.
 *
 * One multicall on the collection's chain per refresh, whatever the wallet is
 * connected to.
 */
import { useQuery } from '@tanstack/react-query';
import { swag1155Abi } from '../../frontend/abis/swag';
import { SWAG, swagClient, swagKeys } from './client';

export interface SwagTokenState {
  tokenId: number;
  /** Units still available to buy(); the voucher pool is separate. */
  remaining: bigint;
  /** USDC base units for one unit. 0n means no USDC price is set. */
  price: bigint;
  /** canBuy(tokenId, 1, USDC) — the contract's own answer, with its reason. */
  canBuy: boolean;
  reason: string;
}

export interface SwagOnchainState {
  paused: boolean;
  tokens: Record<number, SwagTokenState>;
}

/**
 * The function names this hook depends on, checked against the typed ABI.
 * `multicall` over a dynamic-length array cannot type each call the way a
 * tuple can, so this `satisfies` is what makes a renamed or removed function
 * fail `npm run typecheck` instead of failing in the browser.
 */
type SwagFunctionName = Extract<(typeof swag1155Abi)[number], { type: 'function' }>['name'];
const FN = {
  paused: 'paused',
  remaining: 'remainingOnchain',
  price: 'getTokenPrice',
  canBuy: 'canBuy',
} as const satisfies Record<string, SwagFunctionName>;

const CALLS_PER_TOKEN = 3;

async function fetchOnchain(tokenIds: readonly number[]): Promise<SwagOnchainState> {
  const target = { address: SWAG.address, abi: swag1155Abi } as const;

  const contracts = [
    { ...target, functionName: FN.paused },
    ...tokenIds.flatMap((id) => {
      const tokenId = BigInt(id);
      return [
        { ...target, functionName: FN.remaining, args: [tokenId] },
        { ...target, functionName: FN.price, args: [tokenId, SWAG.usdc] },
        { ...target, functionName: FN.canBuy, args: [tokenId, 1n, SWAG.usdc] },
      ];
    }),
  ];

  const results = await swagClient.multicall({ contracts, allowFailure: true });

  const pausedResult = results[0];
  const paused = pausedResult.status === 'success' ? Boolean(pausedResult.result) : false;

  const tokens: Record<number, SwagTokenState> = {};
  tokenIds.forEach((id, index) => {
    const offset = 1 + index * CALLS_PER_TOKEN;
    const remaining = results[offset];
    const price = results[offset + 1];
    const canBuy = results[offset + 2];

    const canBuyTuple =
      canBuy.status === 'success' ? (canBuy.result as readonly [boolean, string]) : null;

    tokens[id] = {
      tokenId: id,
      remaining: remaining.status === 'success' ? (remaining.result as bigint) : 0n,
      price: price.status === 'success' ? (price.result as bigint) : 0n,
      canBuy: canBuyTuple ? canBuyTuple[0] : false,
      reason: canBuyTuple ? canBuyTuple[1] : 'unavailable',
    };
  });

  return { paused, tokens };
}

export function useSwagOnchain(tokenIds: readonly number[]) {
  const query = useQuery({
    queryKey: swagKeys.onchain(tokenIds),
    queryFn: () => fetchOnchain(tokenIds),
    enabled: tokenIds.length > 0,
    staleTime: 1000 * 15,
    // Stock moves when someone else buys; a gentle poll keeps "1 left" honest
    // without hammering the RPC from every open tab.
    refetchInterval: 1000 * 30,
    retry: 1,
  });

  return {
    paused: query.data?.paused ?? false,
    tokens: query.data?.tokens ?? {},
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

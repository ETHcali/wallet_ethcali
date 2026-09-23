/**
 * What the active wallet holds from the collection, plus its orders.
 *
 * Balances come from one `balanceOfBatch` over every live token id on the
 * collection — the chain is the receipt. Orders come from the API, which is the fulfilment
 * record (shipping, size, status) and never the proof of purchase.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { swag1155Abi } from '../../frontend/abis/swag';
import type { SwagProduct } from '../../types/swag';
import { useActiveWallet } from '../useActiveWallet';
import { SWAG, swagClient, swagKeys } from './client';
import { useSwagCatalogue } from './useSwagCatalogue';
import { useSwagOrdersQuery } from './useSwagOrders';

export interface OwnedSwag {
  product: SwagProduct;
  tokenId: number;
  balance: number;
}

export function useMySwag() {
  const { address } = useActiveWallet();
  const catalogue = useSwagCatalogue();
  const orders = useSwagOrdersQuery();

  const tokenIds = catalogue.tokenIds;
  const owner = address as `0x${string}` | undefined;

  const balances = useQuery({
    queryKey: [...swagKeys.myBalances(address), tokenIds.join(',')],
    queryFn: async (): Promise<Record<number, number>> => {
      const accounts = tokenIds.map(() => owner as `0x${string}`);
      const ids = tokenIds.map((id) => BigInt(id));

      const result = await swagClient.readContract({
        address: SWAG.address,
        abi: swag1155Abi,
        functionName: 'balanceOfBatch',
        args: [accounts, ids],
      });

      const out: Record<number, number> = {};
      tokenIds.forEach((id, i) => {
        out[id] = Number(result[i] ?? 0n);
      });
      return out;
    },
    enabled: Boolean(owner) && tokenIds.length > 0,
    staleTime: 1000 * 30,
  });

  const owned = useMemo<OwnedSwag[]>(() => {
    const map = balances.data ?? {};
    return tokenIds.flatMap((tokenId) => {
      const balance = map[tokenId] ?? 0;
      const product = catalogue.byTokenId.get(tokenId);
      return balance > 0 && product ? [{ product, tokenId, balance }] : [];
    });
  }, [balances.data, tokenIds, catalogue.byTokenId]);

  return {
    address,
    owned,
    orders: orders.data?.orders ?? [],
    ordersAvailable: orders.data?.available ?? false,
    isLoading: catalogue.isLoading || balances.isLoading || orders.isLoading,
    error:
      catalogue.error ??
      (balances.error instanceof Error ? balances.error.message : null) ??
      (orders.error instanceof Error ? orders.error.message : null),
    refetch: () => {
      balances.refetch();
      orders.refetch();
    },
  };
}

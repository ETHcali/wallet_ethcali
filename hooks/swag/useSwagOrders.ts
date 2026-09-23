/**
 * The caller's orders, and recording a new one after an on-chain buy.
 *
 * `/api/swag/orders` verifies the Privy token server-side and only ever
 * returns that user's rows; the browser never reads swag_orders directly.
 * The route is being built by the backend stream, so a 404 or 501 is treated
 * as "not live yet" rather than an error the user has to see.
 */
import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSwagOrderInput, SwagOrder } from '../../types/swag';
import { useActiveWallet } from '../useActiveWallet';
import { swagKeys } from './client';

const ORDERS_URL = '/api/swag/orders';

export interface SwagOrdersResult {
  orders: SwagOrder[];
  /** False while the orders route does not exist yet. */
  available: boolean;
}

function isNotLiveYet(status: number): boolean {
  return status === 404 || status === 501;
}

export function useSwagOrdersQuery() {
  const { authenticated, getAccessToken } = usePrivy();
  const { address } = useActiveWallet();

  return useQuery({
    queryKey: swagKeys.orders(address),
    queryFn: async (): Promise<SwagOrdersResult> => {
      const token = await getAccessToken();
      if (!token) return { orders: [], available: false };

      const res = await fetch(ORDERS_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (isNotLiveYet(res.status)) return { orders: [], available: false };
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Could not load your orders (${res.status})`);
      }

      const body = (await res.json()) as SwagOrder[] | { orders?: SwagOrder[] };
      const orders = Array.isArray(body) ? body : (body.orders ?? []);
      return { orders, available: true };
    },
    enabled: authenticated,
    staleTime: 1000 * 30,
    retry: 1,
  });
}

export function useCreateSwagOrder() {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const submit = useCallback(
    async (input: CreateSwagOrderInput): Promise<SwagOrder | null> => {
      const token = await getAccessToken();
      if (!token) throw new Error('Sign in again to save your shipping details.');

      const res = await fetch(ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
      });

      if (isNotLiveYet(res.status)) {
        throw new Error(
          'The order desk is not live yet. Your purchase is on chain — keep the transaction link and we will collect shipping details shortly.'
        );
      }

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Could not save the order (${res.status})`);
      return (body.order ?? body ?? null) as SwagOrder | null;
    },
    [getAccessToken]
  );

  return useMutation({
    mutationFn: submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swag-orders'] });
    },
  });
}

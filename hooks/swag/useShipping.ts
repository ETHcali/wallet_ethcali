/**
 * Shipping for USDC orders: the zones on the shop window, a signed quote for
 * an address, and paying that quote.
 *
 * Paying is a plain USDC transfer to the collection's treasury, read from the
 * collection (never written down here), sponsored and pinned to the
 * collection's chain. The button owns two flags like every onchain button in
 * this app: `submitting` (click → hash) and `cooldown` (hash → receipt and the
 * server's confirmation), both cleared in finally{}.
 */
import { useCallback, useState } from 'react';
import { usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData, getAddress, type Hex } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { logger } from '../../utils/logger';
import { useRequireChain } from '../useRequireChain';
import { SWAG, erc20Abi, swagClient, swagKeys } from './client';
import { translateSwagError } from './swagErrors';
import type {
  SwagOrderView,
  SwagShippingQuoteBody,
  SwagShippingQuoteResponse,
  SwagShippingZonesResponse,
} from '../../types/swag-orders';

const RECEIPT_TIMEOUT_MS = 90_000;

/** Active zones and their prices. Public, cached briefly. */
export function useShippingZones() {
  return useQuery({
    queryKey: swagKeys.shippingZones,
    queryFn: async (): Promise<SwagShippingZonesResponse> => {
      const res = await fetch('/api/swag/shipping/zones');
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not load shipping prices');
      return body as SwagShippingZonesResponse;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}

/** A signed quote for one address, bound to the wallet that will pay. */
export function useShippingQuote() {
  const { getAccessToken } = usePrivy();
  return useMutation({
    mutationFn: async (input: SwagShippingQuoteBody): Promise<SwagShippingQuoteResponse> => {
      const token = await getAccessToken();
      if (!token) throw new Error('Sign in again to see the shipping price.');
      const res = await fetch('/api/swag/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Could not quote shipping (${res.status})`);
      return body as SwagShippingQuoteResponse;
    },
  });
}

/** The collection's treasury, from the chain. The shipping transfer goes here. */
export function useSwagTreasury() {
  return useQuery({
    queryKey: swagKeys.treasury,
    queryFn: async () => getAddress(await swagClient.readContract({ address: SWAG.address, abi: swag1155Abi, functionName: 'treasury' })),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export interface PayShippingResult {
  /** Send the transfer for this order, then have the server verify it. */
  pay: (order: { id: number; amountUnits: string }) => Promise<boolean>;
  submitting: boolean;
  cooldown: boolean;
  /** Why pay would refuse right now. */
  blocked: string | null;
  txHash: Hex | null;
  error: string | null;
}

/** One instance per button. */
export function usePayShipping(): PayShippingResult {
  const { getAccessToken } = usePrivy();
  const chain = useRequireChain(SWAG.chainId);
  const { sendTransaction } = useSendTransaction();
  const treasury = useSwagTreasury();
  const queryClient = useQueryClient();

  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocked = !chain.ready
    ? `Switch to ${chain.chainName} first.`
    : !treasury.data
      ? 'Reading the store address…'
      : null;

  const pay = useCallback<PayShippingResult['pay']>(
    async ({ id, amountUnits }) => {
      if (blocked || !treasury.data) {
        setError(blocked);
        return false;
      }
      setSubmitting(true);
      setError(null);
      let hash: Hex | null = txHash;
      try {
        // A retry after the server hiccuped re-sends the hash, not the money.
        if (!hash) {
          const data = encodeFunctionData({ abi: erc20Abi, functionName: 'transfer', args: [treasury.data, BigInt(amountUnits)] });
          const sent = await sendTransaction({ to: SWAG.usdc, data, chainId: SWAG.chainId }, { sponsor: true });
          hash = sent.hash as Hex;
          setTxHash(hash);
        }
        setCooldown(true);
        const receipt = await swagClient.waitForTransactionReceipt({ hash, timeout: RECEIPT_TIMEOUT_MS });
        if (receipt.status !== 'success') {
          setTxHash(null);
          throw new Error('reverted');
        }

        const token = await getAccessToken();
        if (!token) throw new Error('Sign in again to confirm the shipping payment.');
        const res = await fetch('/api/swag/shipping/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId: id, txHash: hash }),
        });
        const body = (await res.json().catch(() => ({}))) as { order?: SwagOrderView; error?: string };
        if (!res.ok) throw new Error(body.error || `Could not confirm the shipping payment (${res.status})`);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['swag-orders'] }),
          queryClient.invalidateQueries({ queryKey: ['swag-usdc-balance'] }),
        ]);
        return true;
      } catch (e) {
        logger.error('[usePayShipping] failed', e);
        setError(e instanceof Error && e.message.startsWith('Could not') ? e.message : translateSwagError(e, 'es'));
        return false;
      } finally {
        setCooldown(false);
        setSubmitting(false);
      }
    },
    [blocked, treasury.data, txHash, sendTransaction, getAccessToken, queryClient]
  );

  return { pay, submitting, cooldown, blocked, txHash, error };
}

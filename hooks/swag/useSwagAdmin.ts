/**
 * Everything /swag/admin needs, in one place.
 *
 * Two kinds of thing live here and they are kept visibly apart:
 *
 *   Reads of the fulfilment record go through /api/swag/admin/* with the
 *   Privy token; the server checks ADMIN_ROLE on the collection before it
 *   answers. Reads of the collection itself (caps, price, paused, roles) come
 *   straight from the chain through the shared client, exactly as the
 *   storefront reads them — an admin sees the same chain a buyer does.
 *
 *   Writes to the collection are transactions from the admin's own wallet,
 *   sponsored and pinned to the collection's chain. useSwagAdminTx is the one
 *   write primitive:
 *   each button calls it separately, so each button owns its own two flags
 *   (`submitting` click → hash, `cooldown` hash → refetch) and a rejected
 *   transaction on one row never locks a button on another.
 */
import { useCallback, useMemo, useState } from 'react';
import { usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAddress, type Address, type Hex } from 'viem';
import { normalize } from 'viem/ens';
import { swag1155Abi } from '../../frontend/abis/swag';
import { CHAIN_IDS, publicClientFor } from '../../config/chains';
import { logger } from '../../utils/logger';
import { useActiveWallet } from '../useActiveWallet';
import { useRequireChain } from '../useRequireChain';
import { SWAG, swagClient, swagKeys } from './client';
import { translateSwagError } from './swagErrors';
import type {
  SwagAdminOrderPatchBody,
  SwagAdminOrderPatchResponse,
  SwagAdminOrdersResponse,
  SwagAdminSummary,
  SwagOrderChannel,
  SwagOrderStatus,
} from '../../types/swag-orders';

// ── Authenticated fetch ─────────────────────────────────────────────────────

function useAdminFetch() {
  const { getAccessToken } = usePrivy();
  return useCallback(
    async <T,>(input: string, init?: RequestInit): Promise<T> => {
      const token = await getAccessToken();
      if (!token) throw new Error('Sign in again to continue.');
      const res = await fetch(input, {
        ...init,
        headers: { ...(init?.headers ?? {}), 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
      return body as T;
    },
    [getAccessToken]
  );
}

// ── Orders (fulfilment record, via the API) ─────────────────────────────────

export interface AdminOrderFilters {
  status: SwagOrderStatus | '';
  channel: SwagOrderChannel | '';
  q: string;
}

export function useSwagAdminOrders(filters: AdminOrderFilters) {
  const { authenticated } = usePrivy();
  const adminFetch = useAdminFetch();

  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.channel) params.set('channel', filters.channel);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  const key = params.toString();

  return useInfiniteQuery({
    queryKey: swagKeys.adminOrders(key),
    queryFn: ({ pageParam }) => {
      const page = new URLSearchParams(params);
      if (pageParam) page.set('cursor', String(pageParam));
      return adminFetch<SwagAdminOrdersResponse>(`/api/swag/admin/orders?${page.toString()}`);
    },
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: authenticated,
    staleTime: 1000 * 20,
    retry: 1,
  });
}

export function usePatchSwagOrder() {
  const adminFetch = useAdminFetch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: SwagAdminOrderPatchBody & { id: number }) =>
      adminFetch<SwagAdminOrderPatchResponse>(`/api/swag/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['swag-admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: swagKeys.adminSummary }),
      ]),
  });
}

export function useSwagAdminSummary() {
  const { authenticated } = usePrivy();
  const adminFetch = useAdminFetch();
  return useQuery({
    queryKey: swagKeys.adminSummary,
    queryFn: () => adminFetch<SwagAdminSummary>('/api/swag/admin/summary'),
    enabled: authenticated,
    staleTime: 1000 * 30,
    retry: 1,
  });
}

// ── Collection reads (straight from the chain) ──────────────────────────────

export interface SwagTokenStock {
  tokenId: number;
  onchainCap: bigint;
  onchainMinted: bigint;
  voucherCap: bigint;
  voucherMinted: bigint;
  active: boolean;
  /** USDC base units; 0n when no USDC price is set. */
  priceUsdc: bigint;
}

type VariantTuple = Omit<SwagTokenStock, 'tokenId' | 'priceUsdc'>;

async function fetchStock(tokenIds: readonly number[]): Promise<Record<number, SwagTokenStock>> {
  const target = { address: SWAG.address, abi: swag1155Abi } as const;
  const results = await swagClient.multicall({
    allowFailure: true,
    contracts: tokenIds.flatMap((id) => [
      { ...target, functionName: 'getVariant', args: [BigInt(id)] },
      { ...target, functionName: 'getTokenPrice', args: [BigInt(id), SWAG.usdc] },
    ]),
  });
  const stock: Record<number, SwagTokenStock> = {};
  tokenIds.forEach((tokenId, i) => {
    const variant = results[i * 2];
    const price = results[i * 2 + 1];
    const v = variant.status === 'success' ? (variant.result as VariantTuple) : null;
    stock[tokenId] = {
      tokenId,
      onchainCap: v?.onchainCap ?? 0n,
      onchainMinted: v?.onchainMinted ?? 0n,
      voucherCap: v?.voucherCap ?? 0n,
      voucherMinted: v?.voucherMinted ?? 0n,
      active: v?.active ?? false,
      priceUsdc: price.status === 'success' ? (price.result as bigint) : 0n,
    };
  });
  return stock;
}

/** getVariant + USDC price for each token, one multicall. */
export function useSwagStock(tokenIds: readonly number[]) {
  const query = useQuery({
    queryKey: swagKeys.adminStock(tokenIds),
    queryFn: () => fetchStock(tokenIds),
    enabled: tokenIds.length > 0,
    staleTime: 1000 * 15,
    retry: 1,
  });
  return {
    stock: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export interface SwagCollectionState {
  paused: boolean;
  treasury: Address | null;
  /** The connected wallet's roles. All false until a wallet is connected. */
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSigner: boolean;
}

async function fetchCollectionState(account: Address | null): Promise<SwagCollectionState> {
  const target = { address: SWAG.address, abi: swag1155Abi } as const;
  const [paused, treasury, signerRole] = await Promise.all([
    swagClient.readContract({ ...target, functionName: 'paused' }),
    swagClient.readContract({ ...target, functionName: 'treasury' }),
    swagClient.readContract({ ...target, functionName: 'SIGNER_ROLE' }),
  ]);
  if (!account) return { paused, treasury, isAdmin: false, isSuperAdmin: false, isSigner: false };

  const [isAdmin, isSuperAdmin, isSigner] = await Promise.all([
    swagClient.readContract({ ...target, functionName: 'isAdmin', args: [account] }),
    swagClient.readContract({ ...target, functionName: 'isSuperAdmin', args: [account] }),
    swagClient.readContract({ ...target, functionName: 'hasRole', args: [signerRole, account] }),
  ]);
  return { paused, treasury, isAdmin, isSuperAdmin, isSigner };
}

/** paused, treasury and the connected wallet's three roles, from the chain. */
export function useSwagCollectionState() {
  const { address } = useActiveWallet();
  const account = address && isAddress(address) ? (address as Address) : null;
  const query = useQuery({
    queryKey: swagKeys.adminRoles(account ?? undefined),
    queryFn: () => fetchCollectionState(account),
    staleTime: 1000 * 30,
    retry: 1,
  });
  return {
    ...(query.data ?? { paused: false, treasury: null, isAdmin: false, isSuperAdmin: false, isSigner: false }),
    account,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

// ── Address input (0x… or name.eth) ─────────────────────────────────────────

/** Looks like something resolveAddressInput can turn into an address. */
export function looksLikeAddressInput(value: string): boolean {
  const v = value.trim();
  return isAddress(v) || /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i.test(v);
}

/** A checksummed address from a pasted address or a mainnet ENS name, or null. */
export async function resolveAddressInput(value: string): Promise<Address | null> {
  const v = value.trim();
  if (isAddress(v)) return v as Address;
  if (!/\.eth$/i.test(v)) return null;
  try {
    return await publicClientFor(CHAIN_IDS.ETHEREUM).getEnsAddress({ name: normalize(v) });
  } catch (e) {
    logger.debug('[useSwagAdmin] ENS lookup failed', e);
    return null;
  }
}

// ── The write primitive ─────────────────────────────────────────────────────

/** How long to wait for a receipt before giving up on the cooldown. */
const RECEIPT_TIMEOUT_MS = 90_000;

export interface SwagAdminTxResult {
  /** Fire one call on the collection. Resolves the hash on success, null otherwise. */
  run: (data: Hex, opts?: { invalidate?: readonly (readonly unknown[])[] }) => Promise<Hex | null>;
  /** True from click until the wallet returns a hash. */
  submitting: boolean;
  /** True from hash until the receipt is in and the reads have refetched. */
  cooldown: boolean;
  /** Why `run` would refuse right now, or null when it would go ahead. */
  blocked: string | null;
  txHash: Hex | null;
  error: string | null;
  reset: () => void;
}

/**
 * One instance per button. Both flags belong on `disabled`; `blocked` is the
 * sentence to show under the button when it is disabled before any click.
 */
export function useSwagAdminTx(): SwagAdminTxResult {
  const { authenticated } = usePrivy();
  const { wallet } = useActiveWallet();
  const chain = useRequireChain(SWAG.chainId);
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocked = !authenticated || !wallet
    ? 'Connect a wallet first.'
    : !chain.ready
      ? `Switch to ${chain.chainName} first.`
      : null;

  const reset = useCallback(() => {
    setError(null);
    setTxHash(null);
  }, []);

  const run = useCallback<SwagAdminTxResult['run']>(
    async (data, opts) => {
      if (blocked) {
        setError(blocked);
        return null;
      }
      setSubmitting(true);
      setError(null);
      setTxHash(null);
      let hash: Hex | null = null;

      try {
        const result = await sendTransaction(
          { to: SWAG.address, data, chainId: SWAG.chainId },
          { sponsor: true }
        );
        hash = result.hash as Hex;
        setTxHash(hash);
        // The hash is back but the state it changes is not readable yet. Hold
        // the button through that window rather than let a second call fire.
        setCooldown(true);

        const receipt = await swagClient.waitForTransactionReceipt({ hash, timeout: RECEIPT_TIMEOUT_MS });
        if (receipt.status !== 'success') {
          setError(translateSwagError(new Error('reverted'), 'en'));
          hash = null;
        }

        await Promise.all(
          [
            swagKeys.adminSummary,
            ['swag-admin-stock'],
            ['swag-admin-roles'],
            ['swag-onchain'],
            ...(opts?.invalidate ?? []),
          ].map((queryKey) => queryClient.invalidateQueries({ queryKey: [...queryKey] }))
        );
        return hash;
      } catch (e) {
        logger.error('[useSwagAdminTx] failed', e);
        setError(translateSwagError(e, 'en'));
        return null;
      } finally {
        // Both cleared here, always. Without this a rejected signature would
        // leave the button dead for the rest of the session.
        setCooldown(false);
        setSubmitting(false);
      }
    },
    [blocked, sendTransaction, queryClient]
  );

  return useMemo(
    () => ({ run, submitting, cooldown, blocked, txHash, error, reset }),
    [run, submitting, cooldown, blocked, txHash, error, reset]
  );
}

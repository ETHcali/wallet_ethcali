/**
 * The access module's hooks: the live role matrix, email → wallet, and the
 * write primitive every grant / revoke / transfer button owns one of.
 *
 * useAccessTx returns the same shape as useSwagAdminTx so the admin
 * primitives (TxButton, AddressForm) render it unchanged: `submitting` from
 * click to hash, `cooldown` from hash to receipt + refetch, both cleared in
 * `finally` so a rejected signature never locks the button.
 */
import { useCallback, useMemo, useState } from 'react';
import { usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Address, Hex } from 'viem';
import { DEFAULT_CHAIN, publicClientFor } from '../../config/chains';
import { logger } from '../../utils/logger';
import { useActiveWallet } from '../useActiveWallet';
import { useRequireChain } from '../useRequireChain';
import type { SwagAdminTxResult } from '../swag';
import type { AccessMatrix, AccessResolveResponse } from '../../types/access';

export const accessKeys = { matrix: ['admin-access'] as const };

const RECEIPT_TIMEOUT_MS = 90_000;

function useAuthedFetch() {
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

/** Every contract's role holders, read on chain by the server. */
export function useAccessMatrix() {
  const { ready, authenticated } = usePrivy();
  const authed = useAuthedFetch();
  return useQuery({
    queryKey: accessKeys.matrix,
    queryFn: () => authed<AccessMatrix>('/api/admin/access'),
    enabled: ready && authenticated,
    staleTime: 30_000,
    retry: false,
  });
}

/** Email → the Privy embedded wallet for it, creating the account if needed. */
export function useResolveAccessEmail() {
  const authed = useAuthedFetch();
  return useMutation({
    mutationFn: (email: string) =>
      authed<AccessResolveResponse>('/api/admin/access/resolve', { method: 'POST', body: JSON.stringify({ email }) }),
  });
}

/**
 * Status first, never a raw selector. Privy's sendTransaction does not know
 * our ABI, so the revert arrives as text carrying the selector or the name;
 * both are matched.
 */
const UNAUTHORIZED = /AccessControlUnauthorizedAccount|OwnableUnauthorizedAccount|0xe2517d3f|0x118cdaa7/i;
const INVALID_OWNER = /OwnableInvalidOwner|0x1e4fbdf7/i;

export function translateAccessError(e: unknown): string {
  const text = e instanceof Error ? `${e.message} ${(e as { details?: string }).details ?? ''}` : String(e);
  if (/reject|denied|cancel/i.test(text)) return 'Signature rejected. Nothing was sent.';
  if (UNAUTHORIZED.test(text)) return 'Refused. The connected wallet cannot grant this role on this contract.';
  if (INVALID_OWNER.test(text)) return 'Refused. That is not a valid new owner.';
  if (/insufficient funds/i.test(text)) return 'Not enough ETH for gas in the connected wallet.';
  return 'Transaction failed. Nothing changed on chain.';
}

/** One write on `to`. One instance per button. */
export function useAccessTx(to: Address | undefined): SwagAdminTxResult {
  const { authenticated } = usePrivy();
  const { wallet } = useActiveWallet();
  const chain = useRequireChain(DEFAULT_CHAIN.id);
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocked = !to
    ? 'This contract is not deployed.'
    : !authenticated || !wallet
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
      if (blocked || !to) {
        setError(blocked);
        return null;
      }
      setSubmitting(true);
      setError(null);
      setTxHash(null);
      let hash: Hex | null = null;
      try {
        const result = await sendTransaction({ to, data, chainId: DEFAULT_CHAIN.id }, { sponsor: true });
        hash = result.hash as Hex;
        setTxHash(hash);
        setCooldown(true);
        const receipt = await publicClientFor(DEFAULT_CHAIN.id).waitForTransactionReceipt({ hash, timeout: RECEIPT_TIMEOUT_MS });
        if (receipt.status !== 'success') {
          setError('Transaction reverted. Nothing changed on chain.');
          hash = null;
        }
        await Promise.all(
          [accessKeys.matrix, ['admin-roles'], ['swag-admin-staff'], ...(opts?.invalidate ?? [])].map((queryKey) =>
            queryClient.invalidateQueries({ queryKey: [...queryKey] })
          )
        );
        return hash;
      } catch (e) {
        logger.error('[useAccessTx] failed', e);
        setError(translateAccessError(e));
        return null;
      } finally {
        setCooldown(false);
        setSubmitting(false);
      }
    },
    [blocked, to, sendTransaction, queryClient]
  );

  return useMemo(
    () => ({ run, submitting, cooldown, blocked, txHash, error, reset }),
    [run, submitting, cooldown, blocked, txHash, error, reset]
  );
}

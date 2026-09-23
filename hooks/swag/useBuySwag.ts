/**
 * Buying one design with USDC on Base.
 *
 * Four states, one primary action at a time:
 *   connect → switch to Base → approve exact price × qty → buy(tokenId, qty, USDC)
 *
 * Approval timing is the subtle part. The wallet returns a hash BEFORE the
 * allowance is readable, so each write is guarded by two flags:
 *   isApproving / isBuying   set on click, cleared in finally{} (click → hash)
 *   approveCooldown / buyCooldown  set on hash, cleared once the receipt is in
 *                                  and the relevant reads have refetched
 * Both go on `disabled`. The finally{} is not optional: without it a rejected
 * transaction locks the button for good.
 *
 * Both writes are sponsored and pinned to Base with { chainId: 8453 }; the
 * hook never reads a global chain selector.
 */
import { useCallback, useMemo, useState } from 'react';
import { usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { CHAIN_IDS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { useActiveWallet } from '../useActiveWallet';
import { useRequireChain } from '../useRequireChain';
import { SWAG, erc20Abi, swagClient, swagKeys } from './client';
import { describeBlockedReason, translateSwagError } from './swagErrors';
import { useSwagOnchain } from './useSwagOnchain';
import { useSwagLocale } from './useSwagLocale';

export type BuyStep = 'connect' | 'switch' | 'approve' | 'buy';

/** How long to wait for a receipt before giving the user the explorer link instead. */
const RECEIPT_TIMEOUT_MS = 90_000;

export interface UseBuySwagResult {
  step: BuyStep;
  /** Signed in, but Privy has not surfaced a wallet yet — show a wait, not a login. */
  walletPending: boolean;
  /** USDC base units for one unit, from the contract. */
  unitPrice: bigint;
  /** price × quantity, what approve() is asked for and what buy() will pull. */
  total: bigint;
  allowance: bigint;
  usdcBalance: bigint;
  insufficientBalance: boolean;
  /** Why the buy button is disabled before any click, or null if it is not. */
  blocked: string | null;
  connect: () => void;
  switchToBase: () => Promise<boolean>;
  approve: () => Promise<void>;
  buy: () => Promise<void>;
  isSwitching: boolean;
  isApproving: boolean;
  approveCooldown: boolean;
  isBuying: boolean;
  buyCooldown: boolean;
  txHash: string | null;
  /** True once the buy receipt is in with status success. */
  confirmed: boolean;
  error: string | null;
  reset: () => void;
}

export function useBuySwag(tokenId: number, quantity = 1): UseBuySwagResult {
  const locale = useSwagLocale();
  const { authenticated, login } = usePrivy();
  const { wallet, address } = useActiveWallet();
  const chain = useRequireChain(CHAIN_IDS.BASE);
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const ids = useMemo(() => [tokenId], [tokenId]);
  const { paused, tokens } = useSwagOnchain(ids);
  const token = tokens[tokenId];
  const unitPrice = token?.price ?? 0n;
  const qty = BigInt(Math.max(1, Math.floor(quantity)));
  const total = unitPrice * qty;

  const owner = address as `0x${string}` | undefined;

  const allowanceQuery = useQuery({
    queryKey: swagKeys.allowance(address),
    queryFn: () =>
      swagClient.readContract({
        address: SWAG.usdc,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner as `0x${string}`, SWAG.address],
      }),
    enabled: Boolean(owner),
    staleTime: 1000 * 10,
  });

  const balanceQuery = useQuery({
    queryKey: swagKeys.usdcBalance(address),
    queryFn: () =>
      swagClient.readContract({
        address: SWAG.usdc,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [owner as `0x${string}`],
      }),
    enabled: Boolean(owner),
    staleTime: 1000 * 15,
  });

  const allowance = allowanceQuery.data ?? 0n;
  const usdcBalance = balanceQuery.data ?? 0n;

  // Deliberately separate flags — never one shared isLoading across two buttons.
  const [isApproving, setIsApproving] = useState(false);
  const [approveCooldown, setApproveCooldown] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [buyCooldown, setBuyCooldown] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsApproval = total > 0n && allowance < total;
  const insufficientBalance = Boolean(owner) && total > 0n && usdcBalance < total;

  const step: BuyStep = !authenticated || !wallet
    ? 'connect'
    : !chain.ready
      ? 'switch'
      : needsApproval
        ? 'approve'
        : 'buy';

  const blocked: string | null = paused
    ? describeBlockedReason('paused', locale)
    : token && !token.canBuy
      ? describeBlockedReason(token.reason, locale)
      : token && unitPrice === 0n
        ? describeBlockedReason('payment token not accepted', locale)
        : insufficientBalance
          ? locale === 'es'
            ? 'No tienes suficiente USDC en Base para este pago.'
            : 'Not enough USDC on Base for this payment.'
          : null;

  const reset = useCallback(() => {
    setError(null);
    setTxHash(null);
    setConfirmed(false);
  }, []);

  const connect = useCallback(() => {
    setError(null);
    login();
  }, [login]);

  const switchToBase = useCallback(async () => {
    setError(null);
    const ok = await chain.switchTo();
    if (!ok && chain.error) setError(chain.error);
    return ok;
  }, [chain]);

  const approve = useCallback(async () => {
    if (!owner || total <= 0n) return;
    setIsApproving(true);
    setError(null);

    try {
      // Exact amount, not unlimited: the store only ever needs this one price.
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [SWAG.address, total],
      });

      const result = await sendTransaction(
        { to: SWAG.usdc, data, chainId: CHAIN_IDS.BASE },
        { sponsor: true }
      );

      // Hash is back but the allowance may not be readable yet. Hold the
      // button through that window rather than letting a second approval fire.
      setApproveCooldown(true);
      try {
        await swagClient.waitForTransactionReceipt({
          hash: result.hash as `0x${string}`,
          timeout: RECEIPT_TIMEOUT_MS,
        });
      } catch (e) {
        logger.debug('[useBuySwag] approve receipt wait ended early', e);
      }
      await queryClient.invalidateQueries({ queryKey: swagKeys.allowance(address) });
      setApproveCooldown(false);
    } catch (e) {
      logger.error('[useBuySwag] approve failed', e);
      setError(translateSwagError(e, locale));
      setApproveCooldown(false);
    } finally {
      // Without this a rejected approval would lock the button forever.
      setIsApproving(false);
    }
  }, [owner, total, sendTransaction, queryClient, address, locale]);

  const buy = useCallback(async () => {
    if (!owner || total <= 0n) return;
    setIsBuying(true);
    setError(null);
    setTxHash(null);
    setConfirmed(false);

    try {
      const data = encodeFunctionData({
        abi: swag1155Abi,
        functionName: 'buy',
        args: [BigInt(tokenId), qty, SWAG.usdc],
      });

      const result = await sendTransaction(
        { to: SWAG.address, data, chainId: CHAIN_IDS.BASE },
        { sponsor: true }
      );
      setTxHash(result.hash);
      setBuyCooldown(true);

      const receipt = await swagClient.waitForTransactionReceipt({
        hash: result.hash as `0x${string}`,
        timeout: RECEIPT_TIMEOUT_MS,
      });

      if (receipt.status !== 'success') {
        setError(translateSwagError(new Error('reverted'), locale));
      } else {
        setConfirmed(true);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['swag-onchain'] }),
        queryClient.invalidateQueries({ queryKey: ['swag-my-balances'] }),
        queryClient.invalidateQueries({ queryKey: swagKeys.allowance(address) }),
        queryClient.invalidateQueries({ queryKey: swagKeys.usdcBalance(address) }),
      ]);
    } catch (e) {
      logger.error('[useBuySwag] buy failed', e);
      setError(translateSwagError(e, locale));
    } finally {
      setBuyCooldown(false);
      setIsBuying(false);
    }
  }, [owner, total, tokenId, qty, sendTransaction, queryClient, address, locale]);

  return {
    step,
    walletPending: authenticated && !wallet,
    unitPrice,
    total,
    allowance,
    usdcBalance,
    insufficientBalance,
    blocked,
    connect,
    switchToBase,
    approve,
    buy,
    isSwitching: chain.switching,
    isApproving,
    approveCooldown,
    isBuying,
    buyCooldown,
    txHash,
    confirmed,
    error,
    reset,
  };
}

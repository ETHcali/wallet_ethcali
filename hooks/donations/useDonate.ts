/**
 * The donate flow: allowance → approve → donate.
 *
 * Approval timing is the subtle part. `isPending` on a wallet call drops to false
 * the moment the wallet returns a tx hash — BEFORE the allowance has actually
 * changed on-chain. Left alone that re-enables the button mid-flight and a donor
 * can double-submit. So approval is guarded by two separate flags:
 *
 *   isApproving  — set on click, cleared in finally{} (covers wallet → hash)
 *   approveCooldown — set after the hash, cleared after a refetch (hash → cache)
 *
 * The `finally` is not optional: without it a rejected approval locks the button
 * permanently.
 */
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import { useSendTransaction } from '@privy-io/react-auth';
import DonationVaultABI from '../../frontend/abis/DonationVault.json';
import { getRpcUrl, type ChainId } from '../../config/constants';
import { useDonationAddresses } from './useDonationAddresses';
import { parseDonationError } from '../../utils/donationErrors';
import type { DonationToken } from '../../types/donations';
import { logger } from '../../utils/logger';

/** How long to keep the approve button locked after confirmation, in ms. */
const APPROVE_COOLDOWN_MS = 4000;

/**
 * Minimal ERC-20 surface. Declared here rather than imported from viem because
 * this project pins viem 1.x, which does not export `erc20Abi`.
 */
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

function client(chainId: number) {
  return createPublicClient({ transport: http(getRpcUrl(chainId as ChainId)) });
}

/** Current ERC-20 allowance from the donor to the vault. Native tokens skip this. */
export function useDonationAllowance(
  token: DonationToken | null,
  owner?: string,
  chainId?: number
) {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: ['donation-allowance', resolvedChainId, vault, token?.address, owner],
    queryFn: async (): Promise<bigint> => {
      if (!vault || !token || token.isNative || !owner) return 0n;

      return (await client(resolvedChainId).readContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, vault as `0x${string}`],
      })) as bigint;
    },
    enabled: Boolean(vault && token && !token.isNative && owner),
    staleTime: 1000 * 10,
  });
}

/** The donor's balance of the selected currency. */
export function useDonorBalance(
  token: DonationToken | null,
  owner?: string,
  chainId?: number
) {
  const { chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: ['donation-balance', resolvedChainId, token?.address, owner],
    queryFn: async (): Promise<bigint> => {
      if (!token || !owner) return 0n;
      const publicClient = client(resolvedChainId);

      if (token.isNative) {
        return publicClient.getBalance({ address: owner as `0x${string}` });
      }

      return (await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [owner as `0x${string}`],
      })) as bigint;
    },
    enabled: Boolean(token && owner),
    staleTime: 1000 * 15,
  });
}

export interface UseDonateResult {
  approve: (token: DonationToken, amount: bigint) => Promise<void>;
  donate: (
    campaignId: number,
    token: DonationToken,
    amount: bigint,
    message: string
  ) => Promise<string | null>;
  isApproving: boolean;
  approveCooldown: boolean;
  isDonating: boolean;
  error: string | null;
  txHash: string | null;
  reset: () => void;
}

export function useDonate(chainId?: number): UseDonateResult {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  // Deliberately separate flags — never one shared isLoading across two buttons.
  const [isApproving, setIsApproving] = useState(false);
  const [approveCooldown, setApproveCooldown] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setTxHash(null);
  }, []);

  const approve = useCallback(
    async (token: DonationToken, amount: bigint) => {
      if (!vault) throw new Error('Donations are not available on this network');

      setIsApproving(true);
      setError(null);

      try {
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [vault as `0x${string}`, amount],
        });

        await sendTransaction(
          { to: token.address as `0x${string}`, data, chainId: resolvedChainId },
          { sponsor: true }
        );

        // The hash is back but the allowance may not be readable yet. Hold the
        // button through that window rather than letting a second approval fire.
        setApproveCooldown(true);
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['donation-allowance'] });
          setApproveCooldown(false);
        }, APPROVE_COOLDOWN_MS);
      } catch (e) {
        logger.error('[useDonate] approve failed', e);
        setError(parseDonationError(e));
        throw e;
      } finally {
        // Without this, a rejected approval would lock the button forever.
        setIsApproving(false);
      }
    },
    [vault, resolvedChainId, sendTransaction, queryClient]
  );

  const donate = useCallback(
    async (
      campaignId: number,
      token: DonationToken,
      amount: bigint,
      message: string
    ): Promise<string | null> => {
      if (!vault) throw new Error('Donations are not available on this network');

      setIsDonating(true);
      setError(null);
      setTxHash(null);

      try {
        const data = encodeFunctionData({
          abi: DonationVaultABI,
          functionName: 'donate',
          args: [BigInt(campaignId), token.address as `0x${string}`, amount, message],
        });

        const result = await sendTransaction(
          {
            to: vault as `0x${string}`,
            data,
            // Native donations must carry the amount as value; the contract
            // rejects a mismatch between msg.value and the amount argument.
            ...(token.isNative ? { value: amount } : {}),
            chainId: resolvedChainId,
          },
          { sponsor: true }
        );

        setTxHash(result.hash);

        queryClient.invalidateQueries({ queryKey: ['donation-campaign-totals'] });
        queryClient.invalidateQueries({ queryKey: ['donation-campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['donation-balance'] });
        queryClient.invalidateQueries({ queryKey: ['donation-allowance'] });
        queryClient.invalidateQueries({ queryKey: ['donation-wall'] });

        return result.hash;
      } catch (e) {
        logger.error('[useDonate] donate failed', e);
        setError(parseDonationError(e));
        return null;
      } finally {
        setIsDonating(false);
      }
    },
    [vault, resolvedChainId, sendTransaction, queryClient]
  );

  return {
    approve,
    donate,
    isApproving,
    approveCooldown,
    isDonating,
    error,
    txHash,
    reset,
  };
}

/**
 * Admin operations for DonationVault and DonationReceipt1155.
 *
 * The on-chain AccessControl roles are the only authority here. `useDonationAdmin`
 * reads them straight from the contract — a Supabase `admins` row grants nothing
 * and is never consulted for permission, only for labels.
 *
 * Role split matters:
 *   ADMIN_ROLE          day-to-day ops — create campaigns, set currencies/tiers, withdraw
 *   DEFAULT_ADMIN_ROLE  custody — change the beneficiary or switch router/holder mode
 */
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPublicClient, http, encodeFunctionData, type Abi } from 'viem';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import DonationVaultABI from '../../frontend/abis/DonationVault.json';
import DonationReceiptABI from '../../frontend/abis/DonationReceipt1155.json';
import { getRpcUrl, type ChainId } from '../../config/constants';
import { useDonationAddresses } from './useDonationAddresses';
import { parseDonationError } from '../../utils/donationErrors';
import type { DonationTier } from '../../types/donations';
import { logger } from '../../utils/logger';

function client(chainId: number) {
  return createPublicClient({ transport: http(getRpcUrl(chainId as ChainId)) });
}

export interface DonationAdminStatus {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isPaused: boolean;
  walletAddress?: string;
}

/** Reads the caller's roles from the vault. */
export function useDonationAdmin(chainId?: number) {
  const { wallets } = useWallets();
  const walletAddress = wallets?.[0]?.address;
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  const query = useQuery({
    queryKey: ['donation-admin-status', resolvedChainId, vault, walletAddress],
    queryFn: async (): Promise<DonationAdminStatus> => {
      if (!vault || !walletAddress) {
        return { isAdmin: false, isSuperAdmin: false, isPaused: false };
      }

      const publicClient = client(resolvedChainId);
      const [isAdmin, isSuperAdmin, isPaused] = await Promise.all([
        publicClient.readContract({
          address: vault as `0x${string}`,
          abi: DonationVaultABI,
          functionName: 'isAdmin',
          args: [walletAddress as `0x${string}`],
        }) as Promise<boolean>,
        publicClient.readContract({
          address: vault as `0x${string}`,
          abi: DonationVaultABI,
          functionName: 'isSuperAdmin',
          args: [walletAddress as `0x${string}`],
        }) as Promise<boolean>,
        publicClient.readContract({
          address: vault as `0x${string}`,
          abi: DonationVaultABI,
          functionName: 'paused',
        }) as Promise<boolean>,
      ]);

      return { isAdmin, isSuperAdmin, isPaused, walletAddress };
    },
    enabled: Boolean(vault && walletAddress),
    staleTime: 1000 * 30,
  });

  return {
    ...(query.data ?? { isAdmin: false, isSuperAdmin: false, isPaused: false }),
    walletAddress,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export interface CreateCampaignInput {
  name: string;
  description: string;
  beneficiary: string;
  receiptCollection: string;
  autoForward: boolean;
}

export interface DonationAdminActions {
  createCampaign: (input: CreateCampaignInput) => Promise<string | null>;
  setAcceptedToken: (campaignId: number, token: string, accepted: boolean) => Promise<string | null>;
  setTiers: (campaignId: number, token: string, tiers: DonationTier[]) => Promise<string | null>;
  updateCampaign: (
    campaignId: number,
    name: string,
    description: string,
    active: boolean
  ) => Promise<string | null>;
  withdrawAll: (campaignId: number, token: string) => Promise<string | null>;
  setPaused: (paused: boolean) => Promise<string | null>;
  setReceiptTier: (
    tokenId: number,
    name: string,
    metadataURI: string,
    active: boolean
  ) => Promise<string | null>;
  addReceiptMinter: (minter: string) => Promise<string | null>;
  isSubmitting: boolean;
  /** Which action is in flight — so each button owns its own pending state. */
  pendingAction: string | null;
  error: string | null;
  clearError: () => void;
}

export function useDonationAdminActions(chainId?: number): DonationAdminActions {
  const { vault, receiptCollection, chainId: resolvedChainId } = useDonationAddresses(chainId);
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /** Shared submit path so every action gets identical error handling. */
  const submit = useCallback(
    async (
      action: string,
      to: string,
      abi: Abi,
      functionName: string,
      args: readonly unknown[]
    ): Promise<string | null> => {
      setPendingAction(action);
      setError(null);

      try {
        const data = encodeFunctionData({ abi, functionName, args });

        const result = await sendTransaction(
          { to: to as `0x${string}`, data, chainId: resolvedChainId },
          { sponsor: true }
        );

        // Refresh everything the admin screen renders.
        queryClient.invalidateQueries({ queryKey: ['donation-campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['donation-campaign'] });
        queryClient.invalidateQueries({ queryKey: ['donation-campaign-totals'] });
        queryClient.invalidateQueries({ queryKey: ['donation-tiers'] });
        queryClient.invalidateQueries({ queryKey: ['donation-admin-status'] });

        return result.hash;
      } catch (e) {
        logger.error(`[useDonationAdminActions] ${action} failed`, e);
        setError(parseDonationError(e));
        return null;
      } finally {
        setPendingAction(null);
      }
    },
    [resolvedChainId, sendTransaction, queryClient]
  );

  const requireVault = () => {
    if (!vault) throw new Error('DonationVault is not deployed on this network');
    return vault;
  };

  return {
    createCampaign: (input) =>
      submit('createCampaign', requireVault(), DonationVaultABI as Abi, 'createCampaign', [
        input.name,
        input.description,
        input.beneficiary,
        input.receiptCollection,
        input.autoForward,
      ]),

    setAcceptedToken: (campaignId, token, accepted) =>
      submit('setAcceptedToken', requireVault(), DonationVaultABI as Abi, 'setAcceptedToken', [
        BigInt(campaignId),
        token,
        accepted,
      ]),

    setTiers: (campaignId, token, tiers) =>
      submit('setTiers', requireVault(), DonationVaultABI as Abi, 'setTiers', [
        BigInt(campaignId),
        token,
        tiers.map((t) => ({
          minAmount: t.minAmount,
          receiptTokenId: BigInt(t.receiptTokenId),
        })),
      ]),

    updateCampaign: (campaignId, name, description, active) =>
      submit('updateCampaign', requireVault(), DonationVaultABI as Abi, 'updateCampaign', [
        BigInt(campaignId),
        name,
        description,
        active,
      ]),

    withdrawAll: (campaignId, token) =>
      submit('withdrawAll', requireVault(), DonationVaultABI as Abi, 'withdrawAll', [
        BigInt(campaignId),
        token,
      ]),

    setPaused: (paused) =>
      submit(
        paused ? 'pause' : 'unpause',
        requireVault(),
        DonationVaultABI as Abi,
        paused ? 'pause' : 'unpause',
        []
      ),

    setReceiptTier: (tokenId, name, metadataURI, active) => {
      if (!receiptCollection) {
        throw new Error('No receipt collection deployed on this network');
      }
      return submit('setReceiptTier', receiptCollection, DonationReceiptABI as Abi, 'setTier', [
        BigInt(tokenId),
        name,
        metadataURI,
        active,
      ]);
    },

    addReceiptMinter: (minter) => {
      if (!receiptCollection) {
        throw new Error('No receipt collection deployed on this network');
      }
      return submit('addReceiptMinter', receiptCollection, DonationReceiptABI as Abi, 'addMinter', [
        minter,
      ]);
    },

    isSubmitting: pendingAction !== null,
    pendingAction,
    error,
    clearError,
  };
}

/**
 * Whether the vault currently holds MINTER_ROLE on the receipt collection.
 *
 * This is the single most common launch mistake: without it, every qualifying
 * donation still settles but silently emits ReceiptFailed and the donor gets no
 * NFT. Surfaced prominently on the admin screen for that reason.
 */
export function useReceiptMinterStatus(chainId?: number) {
  const { vault, receiptCollection, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: ['donation-minter-status', resolvedChainId, vault, receiptCollection],
    queryFn: async (): Promise<boolean> => {
      if (!vault || !receiptCollection) return false;

      const publicClient = client(resolvedChainId);
      const minterRole = (await publicClient.readContract({
        address: receiptCollection as `0x${string}`,
        abi: DonationReceiptABI,
        functionName: 'MINTER_ROLE',
      })) as `0x${string}`;

      return (await publicClient.readContract({
        address: receiptCollection as `0x${string}`,
        abi: DonationReceiptABI,
        functionName: 'hasRole',
        args: [minterRole, vault as `0x${string}`],
      })) as boolean;
    },
    enabled: Boolean(vault && receiptCollection),
    staleTime: 1000 * 60,
  });
}

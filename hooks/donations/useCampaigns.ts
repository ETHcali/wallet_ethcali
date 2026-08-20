/**
 * Read campaigns and their totals directly from DonationVault.
 *
 * The chain is the source of truth. Supabase (when configured) only accelerates
 * the donor wall and carries presentation content — it is never consulted for a
 * balance.
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import DonationVaultABI from '../../frontend/abis/DonationVault.json';
import { getRpcUrl, type ChainId } from '../../config/constants';
import { useDonationAddresses } from './useDonationAddresses';
import type {
  Campaign,
  CampaignTokenTotal,
  DonationTier,
  DonationToken,
} from '../../types/donations';

function client(chainId: number) {
  return createPublicClient({ transport: http(getRpcUrl(chainId as ChainId)) });
}

interface RawCampaign {
  name: string;
  description: string;
  beneficiary: string;
  receiptCollection: string;
  donorCount: bigint;
  donationCount: bigint;
  active: boolean;
  autoForward: boolean;
  createdAt: bigint;
}

function toCampaign(raw: RawCampaign, id: number): Campaign {
  return {
    id,
    name: raw.name,
    description: raw.description,
    beneficiary: raw.beneficiary,
    receiptCollection: raw.receiptCollection,
    donorCount: Number(raw.donorCount),
    donationCount: Number(raw.donationCount),
    active: raw.active,
    autoForward: raw.autoForward,
    createdAt: Number(raw.createdAt),
  };
}

/** Active campaigns on the given chain. Empty when no vault is deployed. */
export function useActiveCampaigns(chainId?: number) {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: ['donation-campaigns', resolvedChainId, vault],
    queryFn: async (): Promise<Campaign[]> => {
      if (!vault) return [];

      const [ids, campaigns] = (await client(resolvedChainId).readContract({
        address: vault as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'getActiveCampaigns',
      })) as [bigint[], RawCampaign[]];

      return campaigns.map((c, i) => toCampaign(c, Number(ids[i])));
    },
    enabled: Boolean(vault),
    staleTime: 1000 * 30,
  });
}

export function useCampaign(campaignId: number | null, chainId?: number) {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: ['donation-campaign', resolvedChainId, vault, campaignId],
    queryFn: async (): Promise<Campaign | null> => {
      if (!vault || campaignId === null) return null;

      const raw = (await client(resolvedChainId).readContract({
        address: vault as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'getCampaign',
        args: [BigInt(campaignId)],
      })) as RawCampaign;

      return toCampaign(raw, campaignId);
    },
    enabled: Boolean(vault && campaignId !== null),
    staleTime: 1000 * 30,
  });
}

/**
 * Per-token totals for a campaign.
 *
 * `raised` is the number to display: it is a permanent record and never
 * decreases. `available` drops to ~0 in router mode, since donations forward to
 * the beneficiary Safe immediately — using it for a progress bar would show a
 * campaign perpetually at zero.
 */
export function useCampaignTotals(campaignId: number | null, chainId?: number) {
  const { vault, chainId: resolvedChainId, tokens } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: ['donation-campaign-totals', resolvedChainId, vault, campaignId],
    queryFn: async (): Promise<CampaignTokenTotal[]> => {
      if (!vault || campaignId === null) return [];

      const [addresses, raised, available] = (await client(resolvedChainId).readContract({
        address: vault as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'getCampaignTotals',
        args: [BigInt(campaignId)],
      })) as [string[], bigint[], bigint[]];

      const byAddress = new Map<string, DonationToken>(
        tokens.map((t) => [t.address.toLowerCase(), t])
      );

      return addresses.map((address, i) => {
        const known = byAddress.get(address.toLowerCase());
        return {
          token:
            known ?? {
              // A currency the admin accepted that the UI does not know about.
              // Show it rather than hide funds, but do not guess its decimals
              // beyond the ERC-20 default.
              address: address.toLowerCase(),
              symbol: 'TOKEN',
              name: 'Unknown token',
              decimals: 18,
              coingeckoId: null,
              isNative: false,
            },
          raised: raised[i],
          available: available[i],
        };
      });
    },
    enabled: Boolean(vault && campaignId !== null),
    staleTime: 1000 * 20,
  });
}

/** Reward tiers for one currency of a campaign. */
export function useCampaignTiers(
  campaignId: number | null,
  tokenAddress: string | null,
  chainId?: number
) {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: ['donation-tiers', resolvedChainId, vault, campaignId, tokenAddress],
    queryFn: async (): Promise<DonationTier[]> => {
      if (!vault || campaignId === null || !tokenAddress) return [];

      const tiers = (await client(resolvedChainId).readContract({
        address: vault as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'getTiers',
        args: [BigInt(campaignId), tokenAddress as `0x${string}`],
      })) as Array<{ minAmount: bigint; receiptTokenId: bigint }>;

      return tiers.map((t) => ({
        minAmount: t.minAmount,
        receiptTokenId: Number(t.receiptTokenId),
      }));
    },
    enabled: Boolean(vault && campaignId !== null && tokenAddress),
    staleTime: 1000 * 60,
  });
}

/**
 * Which reward tier an amount would earn, straight from the contract.
 * Lets the donate form preview the reward as the donor types instead of
 * duplicating threshold logic in the UI.
 */
export function useResolveTier(
  campaignId: number | null,
  tokenAddress: string | null,
  amount: bigint,
  chainId?: number
) {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: [
      'donation-resolve-tier',
      resolvedChainId,
      vault,
      campaignId,
      tokenAddress,
      amount.toString(),
    ],
    queryFn: async (): Promise<number | null> => {
      if (!vault || campaignId === null || !tokenAddress || amount <= 0n) return null;

      const [found, receiptTokenId] = (await client(resolvedChainId).readContract({
        address: vault as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'resolveTier',
        args: [BigInt(campaignId), tokenAddress as `0x${string}`, amount],
      })) as [boolean, bigint];

      return found ? Number(receiptTokenId) : null;
    },
    enabled: Boolean(vault && campaignId !== null && tokenAddress && amount > 0n),
    staleTime: 1000 * 10,
  });
}

/**
 * The contract's own answer to "can this donation go through, and if not why".
 * Mirrors every require in donate(), so the button can be disabled with a reason
 * instead of letting the donor submit a transaction that reverts.
 */
export function useCanDonate(
  campaignId: number | null,
  tokenAddress: string | null,
  amount: bigint,
  chainId?: number
) {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: [
      'donation-can-donate',
      resolvedChainId,
      vault,
      campaignId,
      tokenAddress,
      amount.toString(),
    ],
    queryFn: async (): Promise<{ allowed: boolean; reason: string }> => {
      if (!vault || campaignId === null || !tokenAddress) {
        return { allowed: false, reason: 'Donations are not available yet' };
      }

      const [allowed, reason] = (await client(resolvedChainId).readContract({
        address: vault as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'canDonate',
        args: [BigInt(campaignId), tokenAddress as `0x${string}`, amount],
      })) as [boolean, string];

      return { allowed, reason };
    },
    enabled: Boolean(vault && campaignId !== null && tokenAddress),
    staleTime: 1000 * 10,
  });
}

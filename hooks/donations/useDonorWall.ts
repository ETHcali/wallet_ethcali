/**
 * The public donor wall.
 *
 * Prefers the Supabase index (one query, carries messages and cached ENS names).
 * Falls back to reading the vault directly when Supabase is not configured or
 * has not caught up — the wall should never be empty just because the indexer is
 * behind. The chain always wins on disagreement.
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import DonationVaultABI from '../../frontend/abis/DonationVault.json';
import { getRpcUrl, type ChainId } from '../../config/constants';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useDonationAddresses } from './useDonationAddresses';
import type { DonorEntry, DonationToken } from '../../types/donations';
import { logger } from '../../utils/logger';

const PAGE_SIZE = 50;

/**
 * A row of `public.donation_feed` — the read model that already joins the ENS
 * cache and the token registry, so the wall needs one query rather than three.
 */
interface DonationFeedRow {
  donor_address: string;
  donor_ens: string | null;
  amount: string;
  message: string | null;
  tx_hash: string;
  block_time: string;
}

/**
 * Recent donations for a campaign, newest first.
 * `source` tells the UI whether it is showing indexed or on-chain data.
 */
export function useDonorWall(
  campaignId: number | null,
  token: DonationToken | null,
  chainId?: number
) {
  const { vault, chainId: resolvedChainId } = useDonationAddresses(chainId);

  return useQuery({
    queryKey: [
      'donation-wall',
      resolvedChainId,
      vault,
      campaignId,
      token?.address,
    ],
    queryFn: async (): Promise<{ entries: DonorEntry[]; source: 'index' | 'chain' }> => {
      if (!vault || campaignId === null || !token) {
        return { entries: [], source: 'chain' };
      }

      // ── Preferred: the Supabase index ──────────────────────────────────
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('donation_feed')
            .select('donor_address, donor_ens, amount, message, tx_hash, block_time')
            .eq('chain_id', resolvedChainId)
            .eq('vault_address', vault)
            .eq('onchain_campaign_id', campaignId)
            .eq('token_address', token.address.toLowerCase())
            .order('block_time', { ascending: false })
            .limit(PAGE_SIZE);

          if (!error && data) {
            const rows = data as DonationFeedRow[];
            return {
              entries: rows.map((r) => ({
                donor: r.donor_address,
                // amount stays in base units; the render boundary formats it
                // with the token's own decimals.
                amount: BigInt(r.amount),
                ensName: r.donor_ens,
                message: r.message,
                txHash: r.tx_hash,
                blockTime: r.block_time,
              })),
              source: 'index',
            };
          }

          if (error) logger.debug('[useDonorWall] index query failed', error);
        } catch (e) {
          logger.debug('[useDonorWall] index unavailable, falling back to chain', e);
        }
      }

      // ── Fallback: read the vault directly ──────────────────────────────
      // Returns cumulative totals per donor rather than individual donations,
      // and carries no messages — the index is what makes those available.
      const publicClient = createPublicClient({
        transport: http(getRpcUrl(resolvedChainId as ChainId)),
      });

      const [donors, amounts] = (await publicClient.readContract({
        address: vault as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'getDonorsWithAmounts',
        args: [
          BigInt(campaignId),
          token.address as `0x${string}`,
          0n,
          BigInt(PAGE_SIZE),
        ],
      })) as [string[], bigint[], bigint];

      const entries: DonorEntry[] = donors
        .map((donor, i) => ({ donor, amount: amounts[i] }))
        .filter((e) => e.amount > 0n)
        // The contract returns a page unsorted by design — sorting on-chain
        // would cost more than it is worth. Rank here instead.
        .sort((a, b) => (b.amount > a.amount ? 1 : b.amount < a.amount ? -1 : 0));

      return { entries, source: 'chain' };
    },
    enabled: Boolean(vault && campaignId !== null && token),
    staleTime: 1000 * 20,
  });
}

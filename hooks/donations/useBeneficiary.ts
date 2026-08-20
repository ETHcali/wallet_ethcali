/**
 * Resolve the campaign beneficiary's ENS profile and multisig posture.
 *
 * Two things donors deserve to see before sending money: the human name behind
 * the address, and that it is a multisig rather than one person's wallet.
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { CHAIN_IDS, getRpcUrl, type ChainId } from '../../config/constants';
import type { BeneficiaryProfile } from '../../types/donations';
import { logger } from '../../utils/logger';

/** The ETH Cali treasury. Forward resolution only — see below. */
export const ETHCALI_ENS_NAME = 'ethcali.eth';

const SAFE_ABI = [
  {
    name: 'getThreshold',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getOwners',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
] as const;

/**
 * ENS profile for the beneficiary.
 *
 * IMPORTANT: `ethcali.eth` has **no reverse record set**, so
 * `getEnsName(address)` returns null. Resolution must run FORWARD from the known
 * name to the address, and the name is then verified to match the on-chain
 * beneficiary. Reverse-resolving here would render a blank name.
 *
 * ENS records live on Ethereum mainnet regardless of which chain the donation
 * settles on, so this always reads mainnet.
 */
export function useBeneficiaryProfile(beneficiaryAddress?: string) {
  return useQuery({
    queryKey: ['donation-beneficiary', beneficiaryAddress],
    queryFn: async (): Promise<BeneficiaryProfile | null> => {
      if (!beneficiaryAddress) return null;

      const ensClient = createPublicClient({
        chain: mainnet,
        transport: http(getRpcUrl(CHAIN_IDS.ETHEREUM)),
      });

      const name = normalize(ETHCALI_ENS_NAME);
      let ensName = '';
      let avatar: string | null = null;
      let url: string | null = null;

      try {
        const resolved = await ensClient.getEnsAddress({ name });

        // Only claim the name if it genuinely points at this beneficiary.
        if (resolved && resolved.toLowerCase() === beneficiaryAddress.toLowerCase()) {
          ensName = ETHCALI_ENS_NAME;

          const [avatarRecord, urlRecord] = await Promise.all([
            ensClient.getEnsText({ name, key: 'avatar' }).catch(() => null),
            ensClient.getEnsText({ name, key: 'url' }).catch(() => null),
          ]);
          avatar = avatarRecord ?? null;
          url = urlRecord ?? null;
        }
      } catch (error) {
        // A failed ENS lookup must not hide the beneficiary — fall through and
        // show the raw address.
        logger.debug('[useBeneficiaryProfile] ENS resolution failed', error);
      }

      return {
        address: beneficiaryAddress,
        ensName,
        avatar,
        url,
        threshold: null,
        ownerCount: null,
      };
    },
    enabled: Boolean(beneficiaryAddress),
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Safe threshold/owners for the beneficiary, read on the chain the donation
 * settles on. Returns nulls for a plain EOA, which the UI renders differently.
 */
export function useBeneficiarySafe(beneficiaryAddress?: string, chainId?: number) {
  return useQuery({
    queryKey: ['donation-beneficiary-safe', beneficiaryAddress, chainId],
    queryFn: async (): Promise<{ threshold: number; ownerCount: number } | null> => {
      if (!beneficiaryAddress || !chainId) return null;

      const client = createPublicClient({
        transport: http(getRpcUrl(chainId as ChainId)),
      });

      const code = await client.getBytecode({
        address: beneficiaryAddress as `0x${string}`,
      });
      if (!code || code === '0x') return null; // EOA

      try {
        const [threshold, owners] = await Promise.all([
          client.readContract({
            address: beneficiaryAddress as `0x${string}`,
            abi: SAFE_ABI,
            functionName: 'getThreshold',
          }),
          client.readContract({
            address: beneficiaryAddress as `0x${string}`,
            abi: SAFE_ABI,
            functionName: 'getOwners',
          }),
        ]);

        return { threshold: Number(threshold), ownerCount: owners.length };
      } catch {
        // A contract that is not a Safe.
        return null;
      }
    },
    enabled: Boolean(beneficiaryAddress && chainId),
    staleTime: 1000 * 60 * 30,
  });
}

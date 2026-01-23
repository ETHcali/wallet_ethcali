import { useQuery } from '@tanstack/react-query';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, getAddress, isAddress } from 'viem';
import { getChainRpc } from '../config/networks';
import { logger } from '../utils/logger';
import type { DiscountConfig } from '../types/swag';

// Minimal ABIs for balance checks
const ERC721_BALANCE_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ERC1155_BALANCE_ABI = [
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Hook to check smart contract ownership discount eligibility
 * Checks if user owns tokens from the specified contract or if address has contract code
 */
export function useSmartContractDiscount(
  designAddress: string,
  chainId: number,
  discountConfig?: DiscountConfig,
  userAddress?: string
) {
  const { wallets } = useWallets();
  const currentUserAddress = wallets?.[0]?.address;
  const address = userAddress || currentUserAddress;

  const query = useQuery({
    queryKey: ['smart-contract-discount', designAddress, chainId, address, discountConfig?.smartContractAddress],
    queryFn: async () => {
      if (!address || !discountConfig?.smartContractEnabled || !discountConfig.smartContractAddress) {
        return { isEligible: false, reason: 'Discount not configured' };
      }

      if (!isAddress(discountConfig.smartContractAddress)) {
        return { isEligible: false, reason: 'Invalid contract address' };
      }

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const contractAddress = getAddress(discountConfig.smartContractAddress);
      const userAddr = getAddress(address);

      try {
        // Check 1: Does the user address have contract code? (contract wallet)
        const code = await client.getBytecode({ address: userAddr });
        if (code && code !== '0x') {
          return { isEligible: true, reason: 'User is a contract wallet' };
        }

        // Check 2: Does user own ERC721 tokens from the contract?
        try {
          const balance = await client.readContract({
            address: contractAddress,
            abi: ERC721_BALANCE_ABI,
            functionName: 'balanceOf',
            args: [userAddr],
          }) as bigint;

          if (balance > 0n) {
            return { isEligible: true, reason: 'User owns ERC721 tokens' };
          }
        } catch {
          // Not an ERC721 contract or function doesn't exist, continue
        }

        // Check 3: Does user own ERC1155 tokens from the contract?
        try {
          // Try to get balance for token ID 0 (common for ERC1155)
          const balance = await client.readContract({
            address: contractAddress,
            abi: ERC1155_BALANCE_ABI,
            functionName: 'balanceOf',
            args: [userAddr, 0n],
          }) as bigint;

          if (balance > 0n) {
            return { isEligible: true, reason: 'User owns ERC1155 tokens' };
          }
        } catch {
          // Not an ERC1155 contract or function doesn't exist, continue
        }

        return { isEligible: false, reason: 'User does not own tokens from contract' };
      } catch (error) {
        logger.error('Error checking smart contract discount:', error);
        return { 
          isEligible: false, 
          reason: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    },
    enabled: Boolean(
      address && 
      discountConfig?.smartContractEnabled && 
      discountConfig?.smartContractAddress &&
      designAddress &&
      chainId
    ),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    isEligible: query.data?.isEligible || false,
    reason: query.data?.reason,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

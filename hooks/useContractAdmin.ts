import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { useWallets } from '@privy-io/react-auth';
import Swag1155ABI from '../frontend/abis/Swag1155.json';
import { useSwagAddresses, getChainConfig } from '../utils/network';
import { getChainRpc } from '../config/networks';
import { logger } from '../utils/logger';

/**
 * Check if the connected wallet is an admin of the Swag1155 contract
 * @param overrideChainId - Optional chain ID to override the wallet's detected chain
 */
export function useContractAdmin(overrideChainId?: number) {
  const { wallets } = useWallets();
  const swagAddresses = useSwagAddresses();
  const activeWallet = wallets?.[0];
  const walletAddress = activeWallet?.address;

  // Use override chainId if provided, otherwise use detected chain
  const chainId = overrideChainId || swagAddresses.chainId;

  // Get contract address for the specific chain
  const config = getChainConfig(chainId);
  const swag1155 = config.swag1155;

  const query = useQuery({
    queryKey: ['contract-admin', swag1155, chainId, walletAddress],
    queryFn: async () => {
      if (!swag1155 || !chainId || !walletAddress) {
        logger.debug('[useContractAdmin] Missing data', { swag1155: !!swag1155, chainId, walletAddress: walletAddress?.slice(0, 10) });
        return false;
      }

      logger.debug('[useContractAdmin] Checking admin status', {
        swag1155: swag1155.slice(0, 10),
        chainId,
        walletAddress: walletAddress.slice(0, 10)
      });

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      try {
        const isAdmin = await client.readContract({
          address: swag1155 as `0x${string}`,
          abi: Swag1155ABI as any,
          functionName: 'isAdmin',
          args: [walletAddress as `0x${string}`],
        });

        logger.debug('[useContractAdmin] isAdmin result', { isAdmin: Boolean(isAdmin) });
        return Boolean(isAdmin);
      } catch (error) {
        logger.debug('[useContractAdmin] isAdmin failed, checking owner', { error });
        // Fallback: check if wallet is the owner
        try {
          const owner = await (client.readContract as any)({
            address: swag1155 as `0x${string}`,
            abi: Swag1155ABI as any,
            functionName: 'owner',
          });
          const isOwner = (owner as string).toLowerCase() === walletAddress.toLowerCase();
          logger.debug('[useContractAdmin] owner check', { owner: (owner as string).slice(0, 10), isOwner });
          return isOwner;
        } catch (ownerError) {
          logger.error('[useContractAdmin] owner check failed', ownerError);
          return false;
        }
      }
    },
    enabled: Boolean(swag1155 && chainId && walletAddress),
    staleTime: 1000 * 60,
  });

  return {
    isAdmin: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    walletAddress,
  };
}

import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { useWallets } from '@privy-io/react-auth';
import { swag1155Abi } from '../frontend/abis/swag';
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
          abi: swag1155Abi,
          functionName: 'isAdmin',
          args: [walletAddress as `0x${string}`],
        });

        logger.debug('[useContractAdmin] isAdmin result', { isAdmin });
        return isAdmin;
      } catch (error) {
        logger.error('[useContractAdmin] isAdmin failed', error);
        return false;
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

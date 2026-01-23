/**
 * useFaucetManagerAdmin - Hook to check if the connected wallet is an admin
 */
import { useQuery } from '@tanstack/react-query';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { useSwagAddresses, getChainConfig } from '../../utils/network';
import { getChainRpc } from '../../config/networks';
import { logger } from '../../utils/logger';

/**
 * @param overrideChainId - Optional chain ID to override the wallet's detected chain
 */
export function useFaucetManagerAdmin(overrideChainId?: number) {
  const { wallets } = useWallets();
  const swagAddresses = useSwagAddresses();
  const activeWallet = wallets?.[0];
  const walletAddress = activeWallet?.address;

  // Use override chainId if provided, otherwise use detected chain
  const chainId = overrideChainId || swagAddresses.chainId;

  // Get contract address for the specific chain
  const config = getChainConfig(chainId);
  const faucetManager = config.faucetManager;

  const query = useQuery({
    queryKey: ['faucet-admin', faucetManager, chainId, walletAddress],
    queryFn: async () => {
      if (!faucetManager || !chainId || !walletAddress) {
        logger.debug('[useFaucetManagerAdmin] Missing data', { faucetManager: !!faucetManager, chainId, walletAddress: walletAddress?.slice(0, 10) });
        return { isAdmin: false, isSuperAdmin: false };
      }

      logger.debug('[useFaucetManagerAdmin] Checking admin status', {
        faucetManager: faucetManager.slice(0, 10),
        chainId,
        walletAddress: walletAddress.slice(0, 10)
      });

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      try {
        const [isAdmin, isSuperAdmin] = await Promise.all([
          client.readContract({
            address: faucetManager as `0x${string}`,
            abi: FaucetManagerABI as any,
            functionName: 'isAdmin',
            args: [walletAddress as `0x${string}`],
          }),
          client.readContract({
            address: faucetManager as `0x${string}`,
            abi: FaucetManagerABI as any,
            functionName: 'isSuperAdmin',
            args: [walletAddress as `0x${string}`],
          }),
        ]);

        logger.debug('[useFaucetManagerAdmin] Result', { isAdmin: Boolean(isAdmin), isSuperAdmin: Boolean(isSuperAdmin) });

        return {
          isAdmin: Boolean(isAdmin),
          isSuperAdmin: Boolean(isSuperAdmin),
        };
      } catch (error) {
        logger.error('[useFaucetManagerAdmin] Error checking admin status', error);
        return { isAdmin: false, isSuperAdmin: false };
      }
    },
    enabled: Boolean(faucetManager && chainId && walletAddress),
    staleTime: 1000 * 60,
  });

  return {
    isAdmin: query.data?.isAdmin ?? false,
    isSuperAdmin: query.data?.isSuperAdmin ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    walletAddress,
    refetch: query.refetch,
  };
}

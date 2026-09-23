/**
 * useFaucetManagerAdmin - Whether the active wallet is an admin of the
 * FaucetManager on one explicit chain.
 */
import { useQuery } from '@tanstack/react-query';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { getChain, publicClientFor } from '../../config/chains';
import { logger } from '../../utils/logger';
import { useActiveWallet } from '../useActiveWallet';

export function useFaucetManagerAdmin(chainId: number) {
  const { address: walletAddress } = useActiveWallet();
  const faucetManager = getChain(chainId)?.contracts.FaucetManager;

  const query = useQuery({
    queryKey: ['faucet-admin', chainId, walletAddress?.toLowerCase()],
    queryFn: async () => {
      const client = publicClientFor(chainId);
      if (!faucetManager || !client || !walletAddress) {
        return { isAdmin: false, isSuperAdmin: false };
      }

      try {
        const [isAdmin, isSuperAdmin] = await Promise.all([
          client.readContract({
            address: faucetManager,
            abi: FaucetManagerABI as any,
            functionName: 'isAdmin',
            args: [walletAddress as `0x${string}`],
          }),
          client.readContract({
            address: faucetManager,
            abi: FaucetManagerABI as any,
            functionName: 'isSuperAdmin',
            args: [walletAddress as `0x${string}`],
          }),
        ]);

        return { isAdmin: Boolean(isAdmin), isSuperAdmin: Boolean(isSuperAdmin) };
      } catch (error) {
        logger.error('[useFaucetManagerAdmin] Error checking admin status', error);
        return { isAdmin: false, isSuperAdmin: false };
      }
    },
    enabled: Boolean(faucetManager && walletAddress),
    staleTime: 1000 * 60,
  });

  return {
    isAdmin: query.data?.isAdmin ?? false,
    isSuperAdmin: query.data?.isSuperAdmin ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    walletAddress,
    contractAddress: faucetManager,
    refetch: query.refetch,
  };
}

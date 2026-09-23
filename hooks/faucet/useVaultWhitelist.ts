/**
 * useVaultWhitelist - Whitelist management on the FaucetManager of one explicit chain.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { getChain, publicClientFor } from '../../config/chains';
import { useActiveWallet } from '../useActiveWallet';

export function useVaultWhitelist(chainId: number) {
  const faucetManager = getChain(chainId)?.contracts.FaucetManager;
  const { wallet } = useActiveWallet();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const write = async (functionName: string, args: unknown[]) => {
    if (!faucetManager) throw new Error('Faucet is not deployed on this network');
    if (!wallet) throw new Error('Wallet not connected');

    const data = encodeFunctionData({ abi: FaucetManagerABI as any, functionName, args });
    const result = await sendTransaction({ to: faucetManager, data, chainId }, { sponsor: true });

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });
    queryClient.invalidateQueries({ queryKey: ['faucet-whitelist-check'] });
    return result;
  };

  const asAddresses = (list: string[]) => list.map((addr) => addr as `0x${string}`);

  return {
    addToWhitelist: (vaultId: number, userAddress: string) =>
      write('addToWhitelist', [vaultId, userAddress as `0x${string}`]),
    addBatchToWhitelist: (vaultId: number, userAddresses: string[]) =>
      write('addBatchToWhitelist', [vaultId, asAddresses(userAddresses)]),
    removeFromWhitelist: (vaultId: number, userAddress: string) =>
      write('removeFromWhitelist', [vaultId, userAddress as `0x${string}`]),
    removeBatchFromWhitelist: (vaultId: number, userAddresses: string[]) =>
      write('removeBatchFromWhitelist', [vaultId, asAddresses(userAddresses)]),
    setWhitelistEnabled: (vaultId: number, enabled: boolean) =>
      write('setWhitelistEnabled', [vaultId, enabled]),
    canManage: Boolean(faucetManager && wallet),
  };
}

/** Whether `userAddress` is whitelisted for `vaultId` on `chainId`. */
export function useIsWhitelisted(chainId: number, vaultId: number | null, userAddress: string | null) {
  const faucetManager = getChain(chainId)?.contracts.FaucetManager;

  const query = useQuery({
    queryKey: ['faucet-whitelist-check', chainId, vaultId, userAddress?.toLowerCase()],
    queryFn: async () => {
      const client = publicClientFor(chainId);
      if (!faucetManager || !client || vaultId === null || !userAddress) return false;

      const isWhitelisted = await client.readContract({
        address: faucetManager,
        abi: FaucetManagerABI,
        functionName: 'isWhitelisted',
        args: [vaultId, userAddress as `0x${string}`],
      } as any);

      return Boolean(isWhitelisted);
    },
    enabled: Boolean(faucetManager && vaultId !== null && userAddress),
    staleTime: 1000 * 30,
  });

  return {
    isWhitelisted: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

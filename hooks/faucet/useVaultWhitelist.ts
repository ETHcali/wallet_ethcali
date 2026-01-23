/**
 * useVaultWhitelist - Hooks for whitelist management
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { useSwagAddresses } from '../../utils/network';
import { getChainRpc } from '../../config/networks';

/**
 * Hook to manage whitelist for a vault
 */
export function useVaultWhitelist() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const addToWhitelist = async (vaultId: number, userAddress: string) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'addToWhitelist',
      args: [vaultId, userAddress as `0x${string}`],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });
    return result;
  };

  const addBatchToWhitelist = async (vaultId: number, userAddresses: string[]) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const addresses = userAddresses.map(addr => addr as `0x${string}`);
    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'addBatchToWhitelist',
      args: [vaultId, addresses],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });
    return result;
  };

  const removeFromWhitelist = async (vaultId: number, userAddress: string) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'removeFromWhitelist',
      args: [vaultId, userAddress as `0x${string}`],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });
    return result;
  };

  const removeBatchFromWhitelist = async (vaultId: number, userAddresses: string[]) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const addresses = userAddresses.map(addr => addr as `0x${string}`);
    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'removeBatchFromWhitelist',
      args: [vaultId, addresses],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });
    return result;
  };

  const setWhitelistEnabled = async (vaultId: number, enabled: boolean) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'setWhitelistEnabled',
      args: [vaultId, enabled],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });
    return result;
  };

  return {
    addToWhitelist,
    addBatchToWhitelist,
    removeFromWhitelist,
    removeBatchFromWhitelist,
    setWhitelistEnabled,
    canManage: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to check if a user is whitelisted for a vault
 */
export function useIsWhitelisted(vaultId: number | null, userAddress: string | null) {
  const { faucetManager, chainId } = useSwagAddresses();

  const query = useQuery({
    queryKey: ['faucet-whitelist-check', faucetManager, chainId, vaultId, userAddress],
    queryFn: async () => {
      if (!faucetManager || !chainId || vaultId === null || !userAddress) {
        return false;
      }

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const isWhitelisted = await (client.readContract as any)({
        address: faucetManager as `0x${string}`,
        abi: FaucetManagerABI,
        functionName: 'isWhitelisted',
        args: [vaultId, userAddress as `0x${string}`],
      });

      return Boolean(isWhitelisted);
    },
    enabled: Boolean(faucetManager && chainId && vaultId !== null && userAddress),
    staleTime: 1000 * 30,
  });

  return {
    isWhitelisted: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

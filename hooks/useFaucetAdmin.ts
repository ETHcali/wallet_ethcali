import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData, parseEther, formatEther } from 'viem';
import FaucetManagerABI from '../frontend/abis/FaucetManager.json';
import { useSwagAddresses } from '../utils/network';
import { getChainRpc } from '../config/networks';
import { Vault, VaultType, VaultFormData, VaultUpdateData } from '../types/faucet';

/**
 * Hook to check if the connected wallet is an admin or super admin of FaucetManager
 */
export function useFaucetManagerAdmin() {
  const { wallets } = useWallets();
  const { faucetManager, chainId } = useSwagAddresses();
  const activeWallet = wallets?.[0];
  const walletAddress = activeWallet?.address;

  const query = useQuery({
    queryKey: ['faucet-admin', faucetManager, chainId, walletAddress],
    queryFn: async () => {
      if (!faucetManager || !chainId || !walletAddress) {
        return { isAdmin: false, isSuperAdmin: false };
      }

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

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

      return {
        isAdmin: Boolean(isAdmin),
        isSuperAdmin: Boolean(isSuperAdmin),
      };
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

/**
 * Hook to fetch all vaults from FaucetManager
 */
export function useAllVaults() {
  const { faucetManager, chainId } = useSwagAddresses();

  const query = useQuery({
    queryKey: ['faucet-all-vaults', faucetManager, chainId],
    queryFn: async () => {
      if (!faucetManager || !chainId) throw new Error('Missing contract address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const vaultsData = await (client.readContract as any)({
        address: faucetManager as `0x${string}`,
        abi: FaucetManagerABI,
        functionName: 'getAllVaults',
      }) as any[];

      const vaults: Vault[] = vaultsData.map((vault, index) => ({
        id: index,
        name: vault.name,
        description: vault.description,
        claimAmount: vault.claimAmount,
        balance: vault.balance,
        totalClaimed: vault.totalClaimed,
        totalReturned: vault.totalReturned,
        vaultType: vault.vaultType as VaultType,
        active: vault.active,
        whitelistEnabled: vault.whitelistEnabled,
        createdAt: Number(vault.createdAt),
      }));

      return vaults;
    },
    enabled: Boolean(faucetManager && chainId),
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    vaults: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to check if the faucet is paused
 */
export function useFaucetPaused() {
  const { faucetManager, chainId } = useSwagAddresses();

  const query = useQuery({
    queryKey: ['faucet-paused', faucetManager, chainId],
    queryFn: async () => {
      if (!faucetManager || !chainId) throw new Error('Missing contract address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const paused = await (client.readContract as any)({
        address: faucetManager as `0x${string}`,
        abi: FaucetManagerABI,
        functionName: 'paused',
      });

      return Boolean(paused);
    },
    enabled: Boolean(faucetManager && chainId),
    staleTime: 1000 * 10, // 10 seconds
  });

  return {
    isPaused: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to create a new vault
 */
export function useCreateVault() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const createVault = async (data: VaultFormData) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const claimAmountWei = parseEther(data.claimAmount);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'createVault',
      args: [data.name, data.description, claimAmountWei, data.vaultType],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    createVault,
    canCreate: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to update an existing vault
 */
export function useUpdateVault() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const updateVault = async (data: VaultUpdateData) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const claimAmountWei = parseEther(data.claimAmount);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'updateVault',
      args: [data.vaultId, data.name, data.description, claimAmountWei, data.active],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    updateVault,
    canUpdate: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to deposit ETH into a vault
 */
export function useVaultDeposit() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const deposit = async (vaultId: number, amountEth: string) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const amountWei = parseEther(amountEth);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'deposit',
      args: [vaultId],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      value: amountWei,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: false, // Don't sponsor ETH transfers
    } as any);

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    deposit,
    canDeposit: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to withdraw ETH from a vault
 */
export function useVaultWithdraw() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const withdraw = async (vaultId: number, amountEth: string) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const amountWei = parseEther(amountEth);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'withdraw',
      args: [vaultId, amountWei],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    withdraw,
    canWithdraw: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to pause/unpause the faucet
 */
export function useFaucetPause() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const pause = async () => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'pause',
      args: [],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['faucet-paused'] });

    return result;
  };

  const unpause = async () => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'unpause',
      args: [],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['faucet-paused'] });

    return result;
  };

  return {
    pause,
    unpause,
    canPause: Boolean(faucetManager && activeWallet),
  };
}

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
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    isWhitelisted: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

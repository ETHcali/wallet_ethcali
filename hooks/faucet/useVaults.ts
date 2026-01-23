/**
 * useVaults - Hooks for fetching vault data
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { useSwagAddresses } from '../../utils/network';
import { getChainRpc } from '../../config/networks';
import { Vault, VaultType } from '../../types/faucet';

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
    staleTime: 1000 * 30,
  });

  return {
    vaults: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to get only active vaults
 */
export function useActiveVaults() {
  const { vaults, isLoading, error, refetch } = useAllVaults();

  return {
    vaults: vaults.filter(vault => vault.active),
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get a vault by ID
 */
export function useVaultById(vaultId: number | null) {
  const { vaults, isLoading, error, refetch } = useAllVaults();

  return {
    vault: vaultId !== null ? vaults.find(v => v.id === vaultId) : undefined,
    isLoading,
    error,
    refetch,
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
    staleTime: 1000 * 10,
  });

  return {
    isPaused: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

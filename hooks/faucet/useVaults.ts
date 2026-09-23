/**
 * useVaults - Vault reads from the FaucetManager on one explicit chain.
 */
import { useQuery } from '@tanstack/react-query';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { getChain, publicClientFor } from '../../config/chains';
import { Vault, VaultType } from '../../types/faucet';

/** Every vault on `chainId`. */
export function useAllVaults(chainId: number) {
  const faucetManager = getChain(chainId)?.contracts.FaucetManager;

  const query = useQuery({
    queryKey: ['faucet-all-vaults', chainId],
    queryFn: async () => {
      const client = publicClientFor(chainId);
      if (!faucetManager || !client) throw new Error('Faucet is not deployed on this network');

      const vaultsData = (await client.readContract({
        address: faucetManager,
        abi: FaucetManagerABI,
        functionName: 'getAllVaults',
      } as any)) as any[];

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
        zkPassportRequired: vault.zkPassportRequired,
        allowedToken: vault.allowedToken,
        createdAt: Number(vault.createdAt),
      }));

      return vaults;
    },
    enabled: Boolean(faucetManager),
    staleTime: 1000 * 30,
  });

  return {
    vaults: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/** Only the active vaults on `chainId`. */
export function useActiveVaults(chainId: number) {
  const { vaults, isLoading, error, refetch } = useAllVaults(chainId);

  return {
    vaults: vaults.filter((vault) => vault.active),
    isLoading,
    error,
    refetch,
  };
}

/** One vault by id on `chainId`. */
export function useVaultById(chainId: number, vaultId: number | null) {
  const { vaults, isLoading, error, refetch } = useAllVaults(chainId);

  return {
    vault: vaultId !== null ? vaults.find((v) => v.id === vaultId) : undefined,
    isLoading,
    error,
    refetch,
  };
}

/** Whether the faucet on `chainId` is paused. */
export function useFaucetPaused(chainId: number) {
  const faucetManager = getChain(chainId)?.contracts.FaucetManager;

  const query = useQuery({
    queryKey: ['faucet-paused', chainId],
    queryFn: async () => {
      const client = publicClientFor(chainId);
      if (!faucetManager || !client) throw new Error('Faucet is not deployed on this network');

      const paused = await client.readContract({
        address: faucetManager,
        abi: FaucetManagerABI,
        functionName: 'paused',
      } as any);

      return Boolean(paused);
    },
    enabled: Boolean(faucetManager),
    staleTime: 1000 * 10,
  });

  return {
    isPaused: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

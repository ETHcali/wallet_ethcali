import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import { getChainConfig } from '../../utils/contracts';
import { getContractAddresses } from '../../utils/network';
import SwagFactoryABI from '../../frontend/abis/SwagFactory.json';

// ──────────────────────────────────────────────────────────────
//  Read: getActiveCollections
// ──────────────────────────────────────────────────────────────
export function useActiveCollections(chainId: number) {
  const factoryAddress = chainId ? getContractAddresses(chainId)?.swagFactory : undefined;

  return useQuery({
    queryKey: ['swag-factory-active-collections', chainId, factoryAddress],
    queryFn: async (): Promise<string[]> => {
      if (!factoryAddress || !chainId) return [];
      const chain = getChainConfig(chainId);
      const client = createPublicClient({ chain, transport: http() });
      const result = await client.readContract({
        address: factoryAddress as `0x${string}`,
        abi: SwagFactoryABI,
        functionName: 'getActiveCollections',
        args: [],
      });
      return result as string[];
    },
    enabled: Boolean(factoryAddress && chainId),
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────────────────────────
//  Read: getCollections (all, including inactive)
// ──────────────────────────────────────────────────────────────
export function useAllCollections(chainId: number) {
  const factoryAddress = chainId ? getContractAddresses(chainId)?.swagFactory : undefined;

  return useQuery({
    queryKey: ['swag-factory-all-collections', chainId, factoryAddress],
    queryFn: async (): Promise<string[]> => {
      if (!factoryAddress || !chainId) return [];
      const chain = getChainConfig(chainId);
      const client = createPublicClient({ chain, transport: http() });
      const result = await client.readContract({
        address: factoryAddress as `0x${string}`,
        abi: SwagFactoryABI,
        functionName: 'getCollections',
        args: [],
      });
      return result as string[];
    },
    enabled: Boolean(factoryAddress && chainId),
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────────────────────────
//  Mutation: setCollectionActive
// ──────────────────────────────────────────────────────────────
export function useSetCollectionActive(chainId: number) {
  const factoryAddress = chainId ? getContractAddresses(chainId)?.swagFactory : undefined;
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeWallet = wallets?.[0];

  const setCollectionActive = async (collectionAddress: string, active: boolean) => {
    if (!factoryAddress || !chainId) throw new Error('SwagFactory address not found for this chain');
    if (!activeWallet) throw new Error('Wallet not connected');

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const data = encodeFunctionData({
        abi: SwagFactoryABI as any,
        functionName: 'setCollectionActive',
        args: [collectionAddress as `0x${string}`, active],
      });
      const result = await sendTransaction(
        { to: factoryAddress as `0x${string}`, data, chainId },
        { sponsor: true }
      );
      setTxHash(result.hash);
      queryClient.invalidateQueries({ queryKey: ['swag-factory-active-collections', chainId] });
      queryClient.invalidateQueries({ queryKey: ['swag-factory-all-collections', chainId] });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setCollectionActive,
    isLoading,
    txHash,
    error,
    factoryAddress,
    canSet: Boolean(factoryAddress && activeWallet),
  };
}

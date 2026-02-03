import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { getChainRpc } from '../../config/networks';
import type { RoyaltyInfo } from '../../types/swag';

export function useRoyalties(contractAddress: string, chainId: number, tokenId: number) {
  const query = useQuery({
    queryKey: ['swag-royalties', contractAddress, chainId, tokenId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getRoyalties',
        args: [BigInt(tokenId)],
      });
      const arr = result as any[];
      return arr.map((r: any) => ({
        recipient: Array.isArray(r) ? r[0] as string : r.recipient as string,
        percentage: Array.isArray(r) ? r[1] as bigint : r.percentage as bigint,
      })) as RoyaltyInfo[];
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined),
    staleTime: 1000 * 30,
  });
  return {
    royalties: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useTotalRoyaltyBps(contractAddress: string, chainId: number, tokenId: number) {
  const query = useQuery({
    queryKey: ['swag-total-royalty-bps', contractAddress, chainId, tokenId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'totalRoyaltyBps',
        args: [BigInt(tokenId)],
      });
      return Number(result as unknown as bigint);
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined),
    staleTime: 1000 * 30,
  });
  return {
    totalBps: query.data || 0,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useAddRoyalty(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const addRoyalty = async (tokenId: number, recipient: string, percentage: number) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'addRoyalty',
      args: [BigInt(tokenId), recipient as `0x${string}`, BigInt(percentage)],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-royalties', contractAddress] });
    queryClient.invalidateQueries({ queryKey: ['swag-total-royalty-bps', contractAddress] });
    return result;
  };
  return { addRoyalty, canAdd: Boolean(contractAddress && activeWallet) };
}

export function useClearRoyalties(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const clearRoyalties = async (tokenId: number) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'clearRoyalties',
      args: [BigInt(tokenId)],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-royalties', contractAddress] });
    queryClient.invalidateQueries({ queryKey: ['swag-total-royalty-bps', contractAddress] });
    return result;
  };
  return { clearRoyalties, canClear: Boolean(contractAddress && activeWallet) };
}

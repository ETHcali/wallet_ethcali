import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { getChainRpc } from '../../config/networks';
import type { PoapDiscount, HolderDiscount } from '../../types/swag';

// --- Query hooks ---

export function usePoapDiscounts(contractAddress: string, chainId: number, tokenId: number) {
  const query = useQuery({
    queryKey: ['swag-poap-discounts', contractAddress, chainId, tokenId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getPoapDiscounts',
        args: [BigInt(tokenId)],
      });
      const arr = result as any[];
      return arr.map((r: any) => ({
        eventId: Array.isArray(r) ? r[0] as bigint : r.eventId as bigint,
        discountBps: Array.isArray(r) ? r[1] as bigint : r.discountBps as bigint,
        active: Array.isArray(r) ? r[2] as boolean : r.active as boolean,
      })) as PoapDiscount[];
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined),
    staleTime: 1000 * 30,
  });
  return {
    poapDiscounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useHolderDiscounts(contractAddress: string, chainId: number, tokenId: number) {
  const query = useQuery({
    queryKey: ['swag-holder-discounts', contractAddress, chainId, tokenId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getHolderDiscounts',
        args: [BigInt(tokenId)],
      });
      const arr = result as any[];
      return arr.map((r: any) => ({
        token: Array.isArray(r) ? r[0] as string : r.token as string,
        discountType: Array.isArray(r) ? Number(r[1]) : Number(r.discountType),
        value: Array.isArray(r) ? r[2] as bigint : r.value as bigint,
        active: Array.isArray(r) ? r[3] as boolean : r.active as boolean,
      })) as HolderDiscount[];
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined),
    staleTime: 1000 * 30,
  });
  return {
    holderDiscounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useDiscountedPrice(contractAddress: string, chainId: number, tokenId: number, buyerAddress?: string) {
  const query = useQuery({
    queryKey: ['swag-discounted-price', contractAddress, chainId, tokenId, buyerAddress],
    queryFn: async () => {
      if (!contractAddress || !chainId || !buyerAddress) throw new Error('Missing params');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getDiscountedPrice',
        args: [BigInt(tokenId), buyerAddress as `0x${string}`],
      });
      return result as unknown as bigint;
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined && buyerAddress),
    staleTime: 1000 * 30,
  });
  return {
    discountedPrice: query.data ?? 0n,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

// --- Mutation hooks ---

export function useAddPoapDiscount(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const addPoapDiscount = async (tokenId: number, eventId: bigint, discountBps: bigint) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'addPoapDiscount',
      args: [BigInt(tokenId), eventId, discountBps],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-poap-discounts', contractAddress] });
    return result;
  };
  return { addPoapDiscount, canAdd: Boolean(contractAddress && activeWallet) };
}

export function useRemovePoapDiscount(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const removePoapDiscount = async (tokenId: number, index: number) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'removePoapDiscount',
      args: [BigInt(tokenId), BigInt(index)],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-poap-discounts', contractAddress] });
    return result;
  };
  return { removePoapDiscount, canRemove: Boolean(contractAddress && activeWallet) };
}

export function useAddHolderDiscount(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const addHolderDiscount = async (tokenId: number, token: string, discountType: number, value: bigint) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'addHolderDiscount',
      args: [BigInt(tokenId), token as `0x${string}`, discountType, value],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-holder-discounts', contractAddress] });
    return result;
  };
  return { addHolderDiscount, canAdd: Boolean(contractAddress && activeWallet) };
}

export function useRemoveHolderDiscount(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const removeHolderDiscount = async (tokenId: number, index: number) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'removeHolderDiscount',
      args: [BigInt(tokenId), BigInt(index)],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-holder-discounts', contractAddress] });
    return result;
  };
  return { removeHolderDiscount, canRemove: Boolean(contractAddress && activeWallet) };
}

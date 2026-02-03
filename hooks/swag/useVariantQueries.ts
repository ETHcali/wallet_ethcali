import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { getChainRpc } from '../../config/networks';
import type { Variant } from '../../types/swag';

export function useTokenIds(contractAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['swag-token-ids', contractAddress, chainId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'listTokenIds',
        args: [],
      });
      return (result as bigint[]).map(id => Number(id));
    },
    enabled: Boolean(contractAddress && chainId),
    staleTime: 1000 * 30,
  });
  return {
    tokenIds: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useVariant(contractAddress: string, chainId: number, tokenId: number) {
  const query = useQuery({
    queryKey: ['swag-variant', contractAddress, chainId, tokenId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getVariant',
        args: [BigInt(tokenId)],
      });
      const v = result as any;
      if (Array.isArray(v)) {
        return { price: v[0] as bigint, maxSupply: v[1] as bigint, minted: v[2] as bigint, active: v[3] as boolean } as Variant;
      }
      return v as Variant;
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined),
    staleTime: 1000 * 30,
  });
  return {
    variant: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useVariantUri(contractAddress: string, chainId: number, tokenId: number) {
  const query = useQuery({
    queryKey: ['swag-variant-uri', contractAddress, chainId, tokenId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'uri',
        args: [BigInt(tokenId)],
      });
      return String(result);
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined),
    staleTime: 1000 * 60 * 5,
  });
  return {
    uri: query.data || '',
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useVariantRemaining(contractAddress: string, chainId: number, tokenId: number) {
  const query = useQuery({
    queryKey: ['swag-variant-remaining', contractAddress, chainId, tokenId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'remaining',
        args: [BigInt(tokenId)],
      });
      return Number(result as unknown as bigint);
    },
    enabled: Boolean(contractAddress && chainId && tokenId !== undefined),
    staleTime: 0,
  });
  return {
    remaining: query.data || 0,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useContractSettings(contractAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['contract-settings', contractAddress, chainId],
    queryFn: async () => {
      if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });
      const [treasuryResult, usdcResult] = await Promise.all([
        client.readContract({
          address: contractAddress as `0x${string}`,
          abi: Swag1155ABI as any,
          functionName: 'treasury',
          args: [],
        }),
        client.readContract({
          address: contractAddress as `0x${string}`,
          abi: Swag1155ABI as any,
          functionName: 'usdc',
          args: [],
        }),
      ]);
      return { treasury: String(treasuryResult), paymentToken: String(usdcResult) };
    },
    enabled: Boolean(contractAddress && chainId),
    staleTime: 1000 * 60 * 5,
  });
  return {
    paymentToken: query.data?.paymentToken,
    treasury: query.data?.treasury,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

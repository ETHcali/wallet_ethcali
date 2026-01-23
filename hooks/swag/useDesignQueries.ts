/**
 * useDesignQueries - Query hooks for design info and contract settings
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { getChainRpc } from '../../config/networks';
import type { DesignInfo } from '../../types/swag';

/**
 * Hook to get current contract settings (Treasury address, payment token from Design)
 */
export function useContractSettings(designAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['contract-settings', designAddress, chainId],
    queryFn: async () => {
      if (!designAddress || !chainId) throw new Error('Missing design address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const [designInfoResult, treasuryResult] = await Promise.all([
        client.readContract({
          address: designAddress as `0x${string}`,
          abi: Swag1155ABI as any,
          functionName: 'getDesignInfo',
          args: [],
        }),
        client.readContract({
          address: designAddress as `0x${string}`,
          abi: Swag1155ABI as any,
          functionName: 'treasury',
          args: [],
        }),
      ]);

      const designInfo = designInfoResult as DesignInfo | any[];
      const treasury = String(treasuryResult);

      // Extract payment token from design info
      let paymentToken: string;
      if (Array.isArray(designInfo)) {
        paymentToken = designInfo[4] as string; // paymentToken is 5th element
      } else {
        paymentToken = (designInfo as DesignInfo).paymentToken;
      }

      return { paymentToken, treasury };
    },
    enabled: Boolean(designAddress && chainId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    paymentToken: query.data?.paymentToken,
    treasury: query.data?.treasury,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

import { useQuery } from '@tanstack/react-query';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import { getChainRpc } from '../config/networks';
import { logger } from '../utils/logger';
import { getContractAddresses } from '../utils/network';
import type { NFTData, TokenData } from '../types/zkpassport';

/**
 * Hook to fetch ZKPassport NFT data using unified getNFTDataByOwner() function
 */
export function useZKPassportNFT(chainId: number) {
  const { wallets } = useWallets();
  const userWallet = wallets?.[0];
  const addresses = getContractAddresses(chainId);

  const query = useQuery({
    queryKey: ['zkpassport-nft', chainId, userWallet?.address],
    queryFn: async () => {
      if (!userWallet?.address || !addresses.zkpassport) {
        return null;
      }

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      try {
        // First check if user has NFT
        const raw = await client.readContract({
          address: addresses.zkpassport as `0x${string}`,
          abi: ZKPassportNFTABI as any,
          functionName: 'hasNFTByAddress',
          args: [userWallet.address as `0x${string}`],
        });
        const hasNFT = Array.isArray(raw) ? Boolean(raw[0]) : Boolean(raw);

        if (!hasNFT) {
          return null;
        }

        // Get all NFT data in one call
        const nftData = await client.readContract({
          address: addresses.zkpassport as `0x${string}`,
          abi: ZKPassportNFTABI as any,
          functionName: 'getNFTDataByOwner',
          args: [userWallet.address as `0x${string}`],
        });

        // Handle both array and object return formats
        let tokenId: bigint;
        let tokenData: TokenData;
        let tokenURI: string;

        if (Array.isArray(nftData)) {
          [tokenId, tokenData, tokenURI] = nftData as [bigint, TokenData, string];
        } else {
          const data = nftData as { tokenId: bigint; tokenDataResult: TokenData; tokenURIResult: string };
          tokenId = data.tokenId;
          tokenData = data.tokenDataResult;
          tokenURI = data.tokenURIResult;
        }

        // Parse token URI to get metadata
        let nftMetadata: any = null;
        if (tokenURI) {
          try {
            if (tokenURI.startsWith('data:application/json;base64,')) {
              const base64Data = tokenURI.split(',')[1];
              nftMetadata = JSON.parse(atob(base64Data));
            } else if (tokenURI.startsWith('http')) {
              const response = await fetch(tokenURI);
              nftMetadata = await response.json();
            }
          } catch (err) {
            // Silent fail - metadata not critical
            logger.warn('Failed to parse token URI:', err);
          }
        }

        return {
          tokenId,
          tokenData,
          tokenURI,
          nftMetadata,
        } as NFTData & { nftMetadata: any };
      } catch (error: any) {
        // If RPC is rate limited or down, don't crash
        logger.error('Error fetching ZKPassport NFT (RPC may be rate limited):', error?.message || error);
        return null;
      }
    },
    enabled: Boolean(userWallet?.address && addresses.zkpassport),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const hasNFT = query.data !== null;

  return {
    alreadyHasNFT: hasNFT,
    isLoading: query.isLoading,
    tokenId: query.data?.tokenId || null,
    tokenData: query.data?.tokenData || null,
    nftMetadata: query.data?.nftMetadata || null,
    tokenURI: query.data?.tokenURI || null,
    refreshNFTData: query.refetch,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

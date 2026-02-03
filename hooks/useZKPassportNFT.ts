import { useQuery } from '@tanstack/react-query';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, parseAbiItem } from 'viem';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import { getChainRpc } from '../config/networks';
import { logger } from '../utils/logger';
import { getContractAddresses } from '../utils/network';
import type { TokenData } from '../types/zkpassport';

/**
 * Hook to fetch ZKPassport NFT data
 * - Checks if user has NFT via hasNFTByAddress()
 * - Reads global metadata via nftImageURI(), nftDescription(), nftExternalURL()
 * - Queries NFTMinted event to get tokenId and verification data
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

      const contractAddress = addresses.zkpassport as `0x${string}`;

      try {
        // 1. Check if user has NFT
        const raw = await client.readContract({
          address: contractAddress,
          abi: ZKPassportNFTABI,
          functionName: 'hasNFTByAddress',
          args: [userWallet.address as `0x${string}`],
        });
        const hasNFT = Array.isArray(raw) ? Boolean(raw[0]) : Boolean(raw);

        if (!hasNFT) {
          return null;
        }

        // 2. Read global metadata from contract
        const [imageURI, description, externalURL] = await Promise.all([
          client.readContract({
            address: contractAddress,
            abi: ZKPassportNFTABI,
            functionName: 'nftImageURI',
            args: [],
          }),
          client.readContract({
            address: contractAddress,
            abi: ZKPassportNFTABI,
            functionName: 'nftDescription',
            args: [],
          }),
          client.readContract({
            address: contractAddress,
            abi: ZKPassportNFTABI,
            functionName: 'nftExternalURL',
            args: [],
          }),
        ]);

        // 3. Try to get tokenId and verification data from NFTMinted event
        let tokenId: bigint | null = null;
        let tokenData: TokenData | null = null;

        try {
          const logs = await client.getLogs({
            address: contractAddress,
            event: parseAbiItem('event NFTMinted(address indexed to, uint256 indexed tokenId, string uniqueIdentifier, bool faceMatchPassed, bool personhoodVerified)'),
            args: {
              to: userWallet.address as `0x${string}`,
            },
            fromBlock: 'earliest',
            toBlock: 'latest',
          });

          if (logs.length > 0) {
            const latestLog = logs[logs.length - 1];
            tokenId = latestLog.args.tokenId ?? null;
            tokenData = {
              uniqueIdentifier: latestLog.args.uniqueIdentifier ?? '',
              faceMatchPassed: latestLog.args.faceMatchPassed ?? false,
              personhoodVerified: latestLog.args.personhoodVerified ?? false,
            };
          }
        } catch (eventErr) {
          // Events might fail on some RPCs, continue without tokenId/tokenData
          logger.warn('Could not fetch NFTMinted event:', eventErr);
        }

        // Build metadata object
        const nftMetadata = {
          name: 'ZKPassport NFT',
          description: String(description || ''),
          image: String(imageURI || ''),
          external_url: String(externalURL || ''),
        };

        return {
          tokenId,
          tokenData,
          tokenURI: null,
          nftMetadata,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error fetching ZKPassport NFT:', errorMessage);
        return null;
      }
    },
    enabled: Boolean(userWallet?.address && addresses.zkpassport),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const hasNFT = Boolean(query.data);

  return {
    alreadyHasNFT: hasNFT,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    tokenId: query.data?.tokenId ?? null,
    tokenData: query.data?.tokenData ?? null,
    nftMetadata: query.data?.nftMetadata ?? null,
    tokenURI: query.data?.tokenURI ?? null,
    refreshNFTData: query.refetch,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

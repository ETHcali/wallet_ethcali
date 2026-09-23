import { useQuery } from '@tanstack/react-query';
import { parseAbiItem } from 'viem';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import { getChain, publicClientFor } from '../config/chains';
import { logger } from '../utils/logger';
import type { TokenData } from '../types/zkpassport';
import { useActiveWallet } from './useActiveWallet';

/**
 * The active wallet's ZKPassport NFT on one explicit chain.
 * - Checks ownership via hasNFTByAddress()
 * - Reads global metadata via nftImageURI(), nftDescription(), nftExternalURL()
 * - Queries the NFTMinted event for tokenId and verification data
 */
export function useZKPassportNFT(chainId: number) {
  const { address } = useActiveWallet();
  const contractAddress = getChain(chainId)?.contracts.ZKPassportNFT;

  const query = useQuery({
    queryKey: ['zkpassport-nft', chainId, address?.toLowerCase()],
    queryFn: async () => {
      const client = publicClientFor(chainId);
      if (!address || !contractAddress || !client) return null;
      const owner = address as `0x${string}`;

      try {
        const raw = await client.readContract({
          address: contractAddress,
          abi: ZKPassportNFTABI,
          functionName: 'hasNFTByAddress',
          args: [owner],
        });
        const hasNFT = Array.isArray(raw) ? Boolean(raw[0]) : Boolean(raw);
        if (!hasNFT) return null;

        const [imageURI, description, externalURL] = await Promise.all([
          client.readContract({ address: contractAddress, abi: ZKPassportNFTABI, functionName: 'nftImageURI', args: [] }),
          client.readContract({ address: contractAddress, abi: ZKPassportNFTABI, functionName: 'nftDescription', args: [] }),
          client.readContract({ address: contractAddress, abi: ZKPassportNFTABI, functionName: 'nftExternalURL', args: [] }),
        ]);

        let tokenId: bigint | null = null;
        let tokenData: TokenData | null = null;

        try {
          const logs = await client.getLogs({
            address: contractAddress,
            event: parseAbiItem(
              'event NFTMinted(address indexed to, uint256 indexed tokenId, bytes32 uniqueIdentifier, bool isOver18, string nationality)'
            ),
            args: { to: owner },
            fromBlock: 'earliest',
            toBlock: 'latest',
          });

          if (logs.length > 0) {
            const latestLog = logs[logs.length - 1];
            tokenId = latestLog.args.tokenId ?? null;
            tokenData = {
              uniqueIdentifier: (latestLog.args.uniqueIdentifier ?? '0x') as `0x${string}`,
              personhoodVerified: true, // the contract only mints with a valid ZK proof
              isOver18: latestLog.args.isOver18 ?? false,
              nationality: latestLog.args.nationality ?? '',
            };
          }
        } catch (eventErr) {
          // Some RPCs reject wide log ranges; the card still renders without the event data.
          logger.warn('Could not fetch NFTMinted event:', eventErr);
        }

        return {
          tokenId,
          tokenData,
          tokenURI: null,
          nftMetadata: {
            name: 'ZKPassport NFT',
            description: String(description || ''),
            image: String(imageURI || ''),
            external_url: String(externalURL || ''),
          },
        };
      } catch (error: unknown) {
        logger.error('Error fetching ZKPassport NFT:', error instanceof Error ? error.message : String(error));
        return null;
      }
    },
    enabled: Boolean(address && contractAddress),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });

  return {
    alreadyHasNFT: Boolean(query.data),
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

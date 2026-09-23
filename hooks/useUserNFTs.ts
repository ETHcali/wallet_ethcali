/**
 * The swag NFTs a wallet holds, for the wallet page's collectibles tab.
 *
 * The collection is Base-only, so any other chain resolves to no contract and
 * an empty list. Reads go through the typed ABI: a function the contract no
 * longer has (redemption status, for one) fails typecheck rather than the tab.
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { useWallets } from '@privy-io/react-auth';
import { useSwagAddresses, getChainConfig } from '../utils/network';
import { getChainRpc } from '../config/networks';
import { getIPFSGatewayUrl } from '../lib/pinata';
import { swag1155Abi } from '../frontend/abis/swag';
import { logger } from '../utils/logger';

export interface UserNFT {
  tokenId: bigint;
  balance: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
  /** The collection this token lives in. */
  designAddress: string;
  chainId: number;
}

interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

async function fetchTokenMetadata(uri: string, tokenId: bigint): Promise<TokenMetadata | null> {
  const gatewayUrl = getIPFSGatewayUrl(uri);
  if (!gatewayUrl) return null;

  try {
    const response = await fetch(gatewayUrl);
    if (!response.ok) return null;
    const metadata = await response.json();
    return {
      name: metadata.name || `Token #${tokenId}`,
      description: metadata.description || '',
      image: metadata.image || '',
      attributes: Array.isArray(metadata.attributes) ? metadata.attributes : [],
    };
  } catch (error) {
    logger.error(`Error fetching metadata for token ${tokenId}`, error);
    return null;
  }
}

export function useUserNFTs(overrideChainId?: number) {
  const { wallets } = useWallets();
  const userAddress = wallets?.[0]?.address;
  const swagAddresses = useSwagAddresses();

  const chainId = overrideChainId || swagAddresses.chainId;
  const swag1155 = getChainConfig(chainId).swag1155;

  const query = useQuery({
    queryKey: ['user-nfts', userAddress, chainId, swag1155],
    queryFn: async (): Promise<UserNFT[]> => {
      if (!userAddress || !swag1155) return [];

      const client = createPublicClient({ transport: http(getChainRpc(chainId)) });
      const collection = swag1155 as `0x${string}`;
      const owner = userAddress as `0x${string}`;

      const tokenIds = await client.readContract({
        address: collection,
        abi: swag1155Abi,
        functionName: 'listTokenIds',
      });
      if (tokenIds.length === 0) return [];

      const balances = await client.readContract({
        address: collection,
        abi: swag1155Abi,
        functionName: 'balanceOfBatch',
        args: [tokenIds.map(() => owner), tokenIds],
      });

      const owned = tokenIds.filter((_, i) => (balances[i] ?? 0n) > 0n);
      if (owned.length === 0) return [];

      const nfts = await Promise.all(
        owned.map(async (tokenId): Promise<UserNFT> => {
          const balance = Number(balances[tokenIds.indexOf(tokenId)] ?? 0n);
          let metadata: TokenMetadata | null = null;
          try {
            const uri = await client.readContract({
              address: collection,
              abi: swag1155Abi,
              functionName: 'uri',
              args: [tokenId],
            });
            metadata = await fetchTokenMetadata(uri, tokenId);
          } catch (error) {
            logger.error(`Error reading uri for token ${tokenId}`, error);
          }

          return {
            tokenId,
            balance,
            name: metadata?.name || `Token #${tokenId}`,
            description: metadata?.description || '',
            image: metadata?.image || '',
            attributes: metadata?.attributes || [],
            designAddress: swag1155,
            chainId,
          };
        })
      );

      logger.debug('Swag NFTs loaded', { count: nfts.length });
      return nfts;
    },
    enabled: Boolean(userAddress && swag1155),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    ...query,
    refetch: query.refetch,
  };
}

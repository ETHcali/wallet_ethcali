/**
 * The swag NFTs a wallet holds, for the wallet page's collectibles tab.
 *
 * Read from the live collection on its chain (`SWAG_COLLECTION`) with the
 * registry's client. Reads go through the typed ABI: a function the contract
 * no longer has (redemption status, for one) fails typecheck rather than the
 * tab.
 */
import { useQuery } from '@tanstack/react-query';
import { publicClientFor } from '../config/chains';
import { SWAG_COLLECTION } from '../config/constants';
import { getIPFSGatewayUrl } from '../lib/pinata';
import { swag1155Abi } from '../frontend/abis/swag';
import { logger } from '../utils/logger';
import { useActiveWallet } from './useActiveWallet';

export interface UserNFT {
  tokenId: bigint;
  balance: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
  /** The collection this token lives in. */
  designAddress: string;
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

async function readCollection(owner: `0x${string}`): Promise<UserNFT[]> {
  const collection = SWAG_COLLECTION.address;
  const client = publicClientFor(SWAG_COLLECTION.chainId);

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

  return Promise.all(
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
        designAddress: collection,
      };
    })
  );
}

export function useUserNFTs() {
  const { address } = useActiveWallet();

  const query = useQuery({
    queryKey: ['user-nfts', address?.toLowerCase()],
    queryFn: async (): Promise<UserNFT[]> => {
      if (!address) return [];
      const nfts = await readCollection(address as `0x${string}`);
      logger.debug('Swag NFTs loaded', { count: nfts.length });
      return nfts;
    },
    enabled: Boolean(address),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  return query;
}

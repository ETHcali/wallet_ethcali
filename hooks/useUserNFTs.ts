/**
 * The swag NFTs a wallet holds, for the wallet page's collectibles tab.
 *
 * Fetched across every chain in `chainsFor('swag')` (Base only today), each
 * with that chain's own client. Reads go through the typed ABI: a function the
 * contract no longer has (redemption status, for one) fails typecheck rather
 * than the tab.
 */
import { useQuery } from '@tanstack/react-query';
import { chainsFor, publicClientFor, type ChainInfo } from '../config/chains';
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
  chainId: number;
}

interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

const SWAG_CHAINS = chainsFor('swag');

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

async function readCollection(chain: ChainInfo, owner: `0x${string}`): Promise<UserNFT[]> {
  const collection = chain.contracts.Swag1155;
  if (!collection) return [];
  const client = publicClientFor(chain.id);

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
        chainId: chain.id,
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
      const owner = address as `0x${string}`;
      const perChain = await Promise.all(SWAG_CHAINS.map((chain) => readCollection(chain, owner)));
      const nfts = perChain.flat();
      logger.debug('Swag NFTs loaded', { count: nfts.length });
      return nfts;
    },
    enabled: Boolean(address) && SWAG_CHAINS.length > 0,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  return query;
}

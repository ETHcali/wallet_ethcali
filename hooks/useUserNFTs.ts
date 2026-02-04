import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { useWallets } from '@privy-io/react-auth';
import { useSwagAddresses, getChainConfig } from '../utils/network';
import { getChainRpc } from '../config/networks';
import { getIPFSGatewayUrl } from '../lib/pinata';
import Swag1155ABI from '../frontend/abis/Swag1155.json';
import { RedemptionStatus } from './swag';
import { logger } from '../utils/logger';

export interface UserNFT {
  tokenId: bigint;
  balance: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
  redemptionStatus: RedemptionStatus;
  designAddress?: string; // Design contract address (required for new Design-based system)
  chainId?: number; // Chain ID where the NFT exists
}

// Fetch all token IDs using listTokenIds() contract function
async function fetchTokenIds(swag1155: string, chainId: number): Promise<bigint[]> {
  const rpcUrl = getChainRpc(chainId);
  const client = createPublicClient({ transport: http(rpcUrl) });

  try {
    const result = await client.readContract({
      address: swag1155 as `0x${string}`,
      abi: Swag1155ABI as any,
      functionName: 'listTokenIds',
      args: [],
    });
    return result as bigint[];
  } catch (error) {
    logger.error('Error fetching token IDs from contract', error);
    return [];
  }
}

// Fetch user balances for all token IDs
async function fetchUserBalances(
  swag1155: string,
  chainId: number,
  userAddress: string,
  tokenIds: bigint[]
): Promise<Map<string, number>> {
  if (tokenIds.length === 0) return new Map();

  const rpcUrl = getChainRpc(chainId);
  const client = createPublicClient({ transport: http(rpcUrl) });

  try {
    // Create arrays for balanceOfBatch call
    const accounts = tokenIds.map(() => userAddress);
    const ids = tokenIds;

    const balances = await (client.readContract as any)({
      address: swag1155 as `0x${string}`,
      abi: Swag1155ABI,
      functionName: 'balanceOfBatch',
      args: [accounts, ids],
    }) as bigint[];

    const balanceMap = new Map<string, number>();
    tokenIds.forEach((tokenId, index) => {
      const balance = Number(balances[index]);
      if (balance > 0) {
        balanceMap.set(tokenId.toString(), balance);
      }
    });

    return balanceMap;
  } catch (error) {
    logger.error('Error fetching user balances', error);
    return new Map();
  }
}

// Fetch metadata for a token
async function fetchTokenMetadata(
  swag1155: string,
  chainId: number,
  tokenId: bigint
): Promise<{ name: string; description: string; image: string; attributes: any[] } | null> {
  const rpcUrl = getChainRpc(chainId);
  const client = createPublicClient({ transport: http(rpcUrl) });

  try {
    const uri = await (client.readContract as any)({
      address: swag1155 as `0x${string}`,
      abi: Swag1155ABI,
      functionName: 'uri',
      args: [tokenId],
    }) as string;

    const gatewayUrl = getIPFSGatewayUrl(uri);
    if (!gatewayUrl) return null;

    const response = await fetch(gatewayUrl);
    if (!response.ok) return null;

    const metadata = await response.json();
    return {
      name: metadata.name || `Token #${tokenId}`,
      description: metadata.description || '',
      image: metadata.image || '', // Store raw image URL, process in component like ProductCard
      attributes: metadata.attributes || [],
    };
  } catch (error) {
    logger.error('Error fetching token metadata', error);
    return null;
  }
}

// Main hook to fetch user's NFTs
export function useUserNFTs(overrideChainId?: number) {
  const { wallets } = useWallets();
  const userAddress = wallets?.[0]?.address;
  const swagAddresses = useSwagAddresses();
  
  // Use override chainId if provided, otherwise fall back to useSwagAddresses
  const chainId = overrideChainId || swagAddresses.chainId;
  const chainConfig = getChainConfig(chainId);
  const swag1155 = chainConfig.swag1155;

  const query = useQuery({
    queryKey: ['user-nfts', userAddress, chainId, swag1155],
    queryFn: async (): Promise<UserNFT[]> => {
      if (!userAddress || !swag1155 || !chainId) {
        logger.debug('Missing required data for NFT fetch', { hasAddress: !!userAddress, hasContract: !!swag1155, chainId });
        return [];
      }

      logger.debug('Fetching NFTs', { userAddress: userAddress.substring(0, 10), chainId });

      // Step 1: Get all token IDs from the contract
      const tokenIds = await fetchTokenIds(swag1155, chainId);
      logger.debug('Token IDs found', { count: tokenIds.length });
      if (tokenIds.length === 0) return [];

      // Step 2: Get user's balances for all tokens
      const balanceMap = await fetchUserBalances(swag1155, chainId, userAddress, tokenIds);
      logger.debug('User owns tokens', { count: balanceMap.size });
      if (balanceMap.size === 0) return [];

      // Step 3: Fetch metadata and redemption status for tokens the user owns
      const ownedTokenIds = Array.from(balanceMap.keys());
      const nfts: UserNFT[] = [];
      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });

      for (const tokenIdStr of ownedTokenIds) {
        const tokenId = BigInt(tokenIdStr);
        const balance = balanceMap.get(tokenIdStr) || 0;
        
        // Fetch metadata and redemption status in parallel
        // Both should be resilient to failures - we still show NFT even if metadata fails
        const [metadata, redemptionStatus] = await Promise.all([
          fetchTokenMetadata(swag1155, chainId, tokenId).catch((error) => {
            logger.error(`Error fetching metadata for token ${tokenId}`, error);
            return null;
          }),
          (async () => {
            try {
              const status = await (client.readContract as any)({
                address: swag1155 as `0x${string}`,
                abi: Swag1155ABI,
                functionName: 'getRedemptionStatus',
                args: [tokenId, userAddress as `0x${string}`],
              });
              return Number(status) as RedemptionStatus;
            } catch (error) {
              logger.error(`Error fetching redemption status for token ${tokenId}`, error);
              return RedemptionStatus.NotRedeemed;
            }
          })(),
        ]);

        // Always add NFT if user owns it (has balance > 0), even if metadata fetch failed
        // Use fallback values for missing metadata
        nfts.push({
          tokenId,
          balance,
          name: metadata?.name || `Token #${tokenId}`,
          description: metadata?.description || '',
          image: metadata?.image || '',
          attributes: metadata?.attributes || [],
          redemptionStatus,
          designAddress: swag1155, // Include Design address for new system
          chainId, // Include chain ID
        });
      }

      logger.debug('Final NFTs loaded', { count: nfts.length });
      return nfts;
    },
    enabled: Boolean(userAddress && swag1155 && chainId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts (e.g., after login)
    retry: 2, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
  });

  return {
    ...query,
    // Add refetch function for manual refresh
    refetch: query.refetch,
  };
}

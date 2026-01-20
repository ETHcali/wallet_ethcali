import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { useWallets } from '@privy-io/react-auth';
import { useSwagAddresses } from '../utils/network';
import { getChainRpc } from '../config/networks';
import { getIPFSGatewayUrl } from '../lib/pinata';
import Swag1155ABI from '../frontend/abis/Swag1155.json';

export interface UserNFT {
  tokenId: bigint;
  balance: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

// Fetch all token IDs from the contract
async function fetchTokenIds(swag1155: string, chainId: number): Promise<bigint[]> {
  const rpcUrl = getChainRpc(chainId);
  const client = createPublicClient({ transport: http(rpcUrl) });

  try {
    const result = await (client.readContract as any)({
      address: swag1155 as `0x${string}`,
      abi: Swag1155ABI,
      functionName: 'listTokenIds',
    });
    return result as bigint[];
  } catch (error) {
    console.error('Error fetching token IDs:', error);
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
    console.error('Error fetching user balances:', error);
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
      image: getIPFSGatewayUrl(metadata.image || '') || '/logo_eth_cali.png',
      attributes: metadata.attributes || [],
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

// Main hook to fetch user's NFTs
export function useUserNFTs() {
  const { wallets } = useWallets();
  const userAddress = wallets?.[0]?.address;
  const { chainId, swag1155 } = useSwagAddresses();

  const query = useQuery({
    queryKey: ['user-nfts', userAddress, chainId, swag1155],
    queryFn: async (): Promise<UserNFT[]> => {
      if (!userAddress || !swag1155 || !chainId) {
        console.log('[useUserNFTs] Missing required data:', { userAddress, swag1155, chainId });
        return [];
      }

      console.log('[useUserNFTs] Fetching NFTs for:', { userAddress, swag1155, chainId });

      // Step 1: Get all token IDs from the contract
      const tokenIds = await fetchTokenIds(swag1155, chainId);
      console.log('[useUserNFTs] Token IDs found:', tokenIds.length);
      if (tokenIds.length === 0) return [];

      // Step 2: Get user's balances for all tokens
      const balanceMap = await fetchUserBalances(swag1155, chainId, userAddress, tokenIds);
      console.log('[useUserNFTs] User owns tokens:', balanceMap.size);
      if (balanceMap.size === 0) return [];

      // Step 3: Fetch metadata only for tokens the user owns
      const ownedTokenIds = Array.from(balanceMap.keys());
      const nfts: UserNFT[] = [];

      for (const tokenIdStr of ownedTokenIds) {
        const tokenId = BigInt(tokenIdStr);
        const balance = balanceMap.get(tokenIdStr) || 0;
        const metadata = await fetchTokenMetadata(swag1155, chainId, tokenId);

        if (metadata) {
          nfts.push({
            tokenId,
            balance,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            attributes: metadata.attributes,
          });
        }
      }

      console.log('[useUserNFTs] Final NFTs:', nfts.length);
      return nfts;
    },
    enabled: Boolean(userAddress && swag1155 && chainId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    // Add refetch function for manual refresh
    refetch: query.refetch,
  };
}

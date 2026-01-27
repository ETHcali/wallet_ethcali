/**
 * useMintedNFTs - Hook for fetching all minted NFTs for a Design
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, parseAbiItem } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { getChainRpc } from '../../config/networks';
import { RedemptionStatus } from '../../types/swag';
import type { Swag1155Metadata } from '../../types/swag';

export interface MintedNFT {
  tokenId: bigint;
  owner: string;
  balance: number;
  redemptionStatus: RedemptionStatus;
  metadata: Swag1155Metadata | null;
  size?: string;
}

/**
 * Hook to fetch all minted NFTs for a Design
 */
export function useAllMintedNFTs(designAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['admin-minted-nfts', designAddress, chainId],
    queryFn: async () => {
      if (!designAddress || !chainId) throw new Error('Missing design address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      // Query DesignMinted events to find all mints
      const designMintedEvent = parseAbiItem(
        'event DesignMinted(address indexed buyer, uint256 indexed tokenId, string size, uint256 price, bool hadDiscount)'
      );

      // Use a recent block range to avoid RPC limits (most RPCs limit to ~50k blocks)
      const currentBlock = await client.getBlockNumber();
      const fromBlock = currentBlock > 45000n ? currentBlock - 45000n : 0n;

      const logs = await (client.getLogs as any)({
        address: designAddress as `0x${string}`,
        event: designMintedEvent,
        fromBlock,
        toBlock: 'latest',
      });

      // Query TransferSingle events to track current ownership
      const transferSingleEvent = parseAbiItem(
        'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)'
      );

      const transferLogs = await (client.getLogs as any)({
        address: designAddress as `0x${string}`,
        event: transferSingleEvent,
        fromBlock,
        toBlock: 'latest',
      });

      // Build a map of owners per tokenId
      const ownershipMap = new Map<string, Map<string, bigint>>();

      for (const log of transferLogs) {
        const { from, to, id, value } = log.args as {
          from: string;
          to: string;
          id: bigint;
          value: bigint;
        };

        const tokenKey = id.toString();

        if (!ownershipMap.has(tokenKey)) {
          ownershipMap.set(tokenKey, new Map());
        }

        const tokenOwners = ownershipMap.get(tokenKey)!;

        // Subtract from sender (unless mint)
        if (from !== '0x0000000000000000000000000000000000000000') {
          const currentFrom = tokenOwners.get(from.toLowerCase()) || 0n;
          tokenOwners.set(from.toLowerCase(), currentFrom - value);
        }

        // Add to receiver (unless burn)
        if (to !== '0x0000000000000000000000000000000000000000') {
          const currentTo = tokenOwners.get(to.toLowerCase()) || 0n;
          tokenOwners.set(to.toLowerCase(), currentTo + value);
        }
      }

      // Build map of token sizes from DesignMinted events
      const tokenSizes = new Map<string, string>();
      for (const log of logs) {
        const { tokenId, size } = log.args as {
          tokenId: bigint;
          size: string;
        };
        tokenSizes.set(tokenId.toString(), size);
      }

      // Fetch redemption status for each owner/token combination
      const mintedNFTs: MintedNFT[] = [];

      for (const [tokenIdStr, owners] of ownershipMap) {
        const tokenId = BigInt(tokenIdStr);
        const size = tokenSizes.get(tokenIdStr);

        for (const [owner, balance] of owners) {
          if (balance <= 0n) continue;

          let redemptionStatus = RedemptionStatus.NotRedeemed;
          try {
            const status = await (client.readContract as any)({
              address: designAddress as `0x${string}`,
              abi: Swag1155ABI,
              functionName: 'getDesignTokenRedemptionStatus',
              args: [tokenId, owner as `0x${string}`],
            });
            redemptionStatus = Number(status) as RedemptionStatus;
          } catch {
            // Default to NotRedeemed if query fails
          }

          mintedNFTs.push({
            tokenId,
            owner,
            balance: Number(balance),
            redemptionStatus,
            metadata: null,
            size,
          });
        }
      }

      return mintedNFTs;
    },
    enabled: Boolean(designAddress && chainId),
    staleTime: 1000 * 60 * 2,
  });

  return {
    mintedNFTs: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

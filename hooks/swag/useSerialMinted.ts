import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { getChainConfig } from '../../utils/contracts';

export interface SerialMintedEvent {
  buyer: string;
  tokenId: bigint;
  serial: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

// ──────────────────────────────────────────────────────────────
//  Read all SerialMinted events for a given tokenId (or all)
// ──────────────────────────────────────────────────────────────
export function useSerialMinted(
  contractAddress: string,
  chainId: number,
  tokenId?: number
) {
  return useQuery({
    queryKey: ['swag-serial-minted', contractAddress, chainId, tokenId],
    queryFn: async (): Promise<SerialMintedEvent[]> => {
      if (!contractAddress || !chainId) return [];
      const chain = getChainConfig(chainId);
      const client = createPublicClient({ chain, transport: http() });

      const eventAbi = parseAbiItem(
        'event SerialMinted(address indexed buyer, uint256 indexed tokenId, uint256 indexed serial)'
      );

      const logs = await client.getLogs({
        address: contractAddress as `0x${string}`,
        event: eventAbi,
        args: tokenId != null ? { tokenId: BigInt(tokenId) } : undefined,
        fromBlock: 0n,
        toBlock: 'latest',
      });

      return logs.map((log) => ({
        buyer: log.args.buyer as string,
        tokenId: log.args.tokenId as bigint,
        serial: log.args.serial as bigint,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      }));
    },
    enabled: Boolean(contractAddress && chainId),
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────────────────────────
//  Read: nextSerial for a tokenId (= total minted count)
// ──────────────────────────────────────────────────────────────
export function useNextSerial(
  contractAddress: string,
  chainId: number,
  tokenId: number
) {
  return useQuery({
    queryKey: ['swag-next-serial', contractAddress, chainId, tokenId],
    queryFn: async (): Promise<bigint> => {
      if (!contractAddress || !chainId) return 0n;
      const chain = getChainConfig(chainId);
      const client = createPublicClient({ chain, transport: http() });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            name: 'nextSerial',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'nextSerial',
        args: [BigInt(tokenId)],
      });
      return result as bigint;
    },
    enabled: Boolean(contractAddress && chainId && tokenId >= 0),
    staleTime: 15_000,
  });
}

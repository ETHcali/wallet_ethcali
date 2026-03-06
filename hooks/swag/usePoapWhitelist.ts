import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { getChainConfig } from '../../utils/contracts';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';

// ──────────────────────────────────────────────────────────────
//  Read: isPoapWhitelisted
// ──────────────────────────────────────────────────────────────
export function useIsPoapWhitelisted(
  contractAddress: string,
  chainId: number,
  tokenId: number | null,
  eventId: number | null,
  buyerAddress: string | null
) {
  return useQuery({
    queryKey: ['swag-poap-whitelisted', contractAddress, chainId, tokenId, eventId, buyerAddress],
    queryFn: async () => {
      if (!contractAddress || !tokenId || !eventId || !buyerAddress) return false;
      const chain = getChainConfig(chainId);
      const client = createPublicClient({ chain, transport: http() });
      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI,
        functionName: 'isPoapWhitelisted',
        args: [BigInt(tokenId), BigInt(eventId), buyerAddress as `0x${string}`],
      });
      return result as boolean;
    },
    enabled: Boolean(contractAddress && tokenId && eventId && buyerAddress),
  });
}

// ──────────────────────────────────────────────────────────────
//  Helper: fetch POAP holders via server-side API route
// ──────────────────────────────────────────────────────────────
export async function fetchPoapHolders(eventId: number): Promise<string[]> {
  const res = await fetch(`/api/poap/holders?eventId=${eventId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Failed to fetch POAP holders');
  }
  const data = await res.json();
  return data.addresses as string[];
}

// ──────────────────────────────────────────────────────────────
//  Mutation: addPoapWhitelist
// ──────────────────────────────────────────────────────────────
export function useAddPoapWhitelist(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeWallet = wallets?.[0];

  const addPoapWhitelist = async (
    tokenId: number,
    eventId: number,
    addresses: string[]
  ) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    if (addresses.length === 0) throw new Error('No addresses provided');

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const data = encodeFunctionData({
        abi: Swag1155ABI as any,
        functionName: 'addPoapWhitelist',
        args: [BigInt(tokenId), BigInt(eventId), addresses as `0x${string}`[]],
      });
      const result = await sendTransaction(
        { to: contractAddress as `0x${string}`, data, chainId },
        { sponsor: true }
      );
      setTxHash(result.hash);
      queryClient.invalidateQueries({ queryKey: ['swag-poap-whitelisted', contractAddress] });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { addPoapWhitelist, isLoading, txHash, error, canAdd: Boolean(contractAddress && activeWallet) };
}

// ──────────────────────────────────────────────────────────────
//  Mutation: removePoapWhitelist
// ──────────────────────────────────────────────────────────────
export function useRemovePoapWhitelist(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeWallet = wallets?.[0];

  const removePoapWhitelist = async (
    tokenId: number,
    eventId: number,
    addresses: string[]
  ) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    if (addresses.length === 0) throw new Error('No addresses provided');

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const data = encodeFunctionData({
        abi: Swag1155ABI as any,
        functionName: 'removePoapWhitelist',
        args: [BigInt(tokenId), BigInt(eventId), addresses as `0x${string}`[]],
      });
      const result = await sendTransaction(
        { to: contractAddress as `0x${string}`, data, chainId },
        { sponsor: true }
      );
      setTxHash(result.hash);
      queryClient.invalidateQueries({ queryKey: ['swag-poap-whitelisted', contractAddress] });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { removePoapWhitelist, isLoading, txHash, error, canRemove: Boolean(contractAddress && activeWallet) };
}

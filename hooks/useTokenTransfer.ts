/**
 * useTokenTransfer - Hook for handling ETH and ERC20 token transfers
 */
import { useState, useCallback } from 'react';
import { useSendTransaction } from '@privy-io/react-auth';
import { parseUnits, encodeFunctionData } from 'viem';
import { getTokenAddresses } from '../utils/network';
import { useActiveWallet } from './useActiveWallet';

const ERC20_TRANSFER_ABI = [{
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  name: 'transfer',
  outputs: [{ name: '', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function'
}] as const;

interface UseTokenTransferResult {
  sendToken: (recipient: string, amount: string, tokenType: string) => Promise<string>;
  isSending: boolean;
  txHash: string | null;
  error: Error | null;
  clearTxHash: () => void;
}

export function useTokenTransfer(chainId?: number): UseTokenTransferResult {
  const { sendTransaction } = useSendTransaction();
  const { wallet } = useActiveWallet();

  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const getTokenAddress = useCallback((tokenSymbol: string): string | null => {
    if (tokenSymbol === 'ETH') return null;
    if (!chainId) return null;

    const tokenAddresses = getTokenAddresses(chainId);
    const address = tokenAddresses[tokenSymbol as keyof typeof tokenAddresses];

    return address && address.trim() !== '' ? address : null;
  }, [chainId]);

  const getDecimals = (tokenType: string): number => {
    return ['USDT', 'USDC', 'EURC'].includes(tokenType) ? 6 : 18;
  };

  const sendToken = useCallback(async (
    recipient: string,
    amount: string,
    tokenType: string
  ): Promise<string> => {
    if (!wallet) {
      throw new Error('No wallet found');
    }

    // Get chainId from wallet or use provided chainId
    let txChainId = chainId;
    if (!txChainId && wallet.chainId) {
      // Handle both string format (eip155:8453) and number format
      if (typeof wallet.chainId === 'string') {
        const parts = wallet.chainId.split(':');
        txChainId = parseInt(parts[parts.length - 1], 10);
      } else {
        txChainId = wallet.chainId;
      }
    }

    if (!txChainId) {
      throw new Error('Chain ID is required for transaction');
    }

    setIsSending(true);
    setTxHash(null);
    setError(null);

    try {
      let hash: string;

      if (tokenType === 'ETH') {
        const value = parseUnits(amount, 18);
        const result = await sendTransaction({
          to: recipient as `0x${string}`,
          value,
          chainId: txChainId,
        });
        hash = result.hash;
      } else {
        // ERC20 token transfer
        const tokenAddress = getTokenAddress(tokenType);
        if (!tokenAddress) {
          throw new Error(`Token ${tokenType} not supported on this network`);
        }

        const decimals = getDecimals(tokenType);
        const tokenAmount = parseUnits(amount, decimals);
        const data = encodeFunctionData({
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, tokenAmount]
        });

        const result = await sendTransaction({
          to: tokenAddress as `0x${string}`,
          data,
          chainId: txChainId,
        });
        hash = result.hash;
      }

      setTxHash(hash);
      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Transaction failed');
      setError(error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [wallet, sendTransaction, getTokenAddress, chainId]);

  const clearTxHash = useCallback(() => {
    setTxHash(null);
  }, []);

  return {
    sendToken,
    isSending,
    txHash,
    error,
    clearTxHash,
  };
}

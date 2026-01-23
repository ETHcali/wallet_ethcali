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
  const { wallet, isEmbeddedWallet } = useActiveWallet();

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

    setIsSending(true);
    setTxHash(null);
    setError(null);

    try {
      let hash: string;

      if (isEmbeddedWallet) {
        // Embedded wallet - use Privy's sendTransaction with gas sponsorship
        if (tokenType === 'ETH') {
          const value = parseUnits(amount, 18);
          const result = await sendTransaction(
            {
              to: recipient as `0x${string}`,
              value,
            },
            {
              sponsor: true,
            } as any
          );
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

          const result = await sendTransaction(
            {
              to: tokenAddress as `0x${string}`,
              data,
            },
            {
              sponsor: true,
            } as any
          );
          hash = result.hash;
        }
      } else {
        // External wallet - use provider directly
        const provider = await wallet.getEthereumProvider();

        if (tokenType === 'ETH') {
          const value = parseUnits(amount, 18);
          hash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: wallet.address,
              to: recipient,
              value: `0x${value.toString(16)}`,
            }],
          }) as string;
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

          hash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: wallet.address,
              to: tokenAddress,
              data,
            }],
          }) as string;
        }
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
  }, [wallet, isEmbeddedWallet, sendTransaction, getTokenAddress]);

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

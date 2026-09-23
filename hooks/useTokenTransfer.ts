/**
 * Send ETH or a registry ERC-20 on Ethereum.
 *
 * `useRequireChain(DEFAULT_CHAIN.id)` has moved the wallet before this is
 * called. The transaction still pins the chain id so a wallet that drifted
 * cannot sign on the wrong network.
 */
import { useState, useCallback } from 'react';
import { useSendTransaction } from '@privy-io/react-auth';
import { parseUnits, encodeFunctionData } from 'viem';
import { DEFAULT_CHAIN, findToken } from '../config/chains';
import { useActiveWallet } from './useActiveWallet';

const ERC20_TRANSFER_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export interface TransferRequest {
  recipient: string;
  /** Human amount, e.g. "0.25" — parsed with the token's own decimals here. */
  amount: string;
  symbol: string;
}

interface UseTokenTransferResult {
  sendToken: (request: TransferRequest) => Promise<string>;
  isSending: boolean;
  txHash: string | null;
  error: Error | null;
  clearTxHash: () => void;
}

export function useTokenTransfer(): UseTokenTransferResult {
  const { sendTransaction } = useSendTransaction();
  const { wallet } = useActiveWallet();

  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sendToken = useCallback(
    async ({ recipient, amount, symbol }: TransferRequest): Promise<string> => {
      if (!wallet) throw new Error('No wallet connected');
      const chain = DEFAULT_CHAIN;

      setIsSending(true);
      setTxHash(null);
      setError(null);

      try {
        let hash: string;

        if (symbol === chain.nativeSymbol) {
          const result = await sendTransaction(
            { to: recipient as `0x${string}`, value: parseUnits(amount, 18), chainId: chain.id },
            { sponsor: true }
          );
          hash = result.hash;
        } else {
          const token = findToken(chain.id, symbol);
          if (!token) throw new Error(`${symbol} is not a token this wallet knows.`);

          const data = encodeFunctionData({
            abi: ERC20_TRANSFER_ABI,
            functionName: 'transfer',
            args: [recipient as `0x${string}`, parseUnits(amount, token.decimals)],
          });

          const result = await sendTransaction(
            { to: token.address, data, chainId: chain.id },
            { sponsor: true }
          );
          hash = result.hash;
        }

        setTxHash(hash);
        return hash;
      } catch (err) {
        const failure = err instanceof Error ? err : new Error('Transfer failed. Nothing left your wallet.');
        setError(failure);
        throw failure;
      } finally {
        // Always released, or a rejected transfer locks the button for good.
        setIsSending(false);
      }
    },
    [wallet, sendTransaction]
  );

  const clearTxHash = useCallback(() => setTxHash(null), []);

  return { sendToken, isSending, txHash, error, clearTxHash };
}

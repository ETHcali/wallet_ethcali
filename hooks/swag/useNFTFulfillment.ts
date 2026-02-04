/**
 * useNFTFulfillment - Hook for marking redemptions as fulfilled
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { logger } from '../../utils/logger';
import { getChainRpc } from '../../config/networks';
import { RedemptionStatus } from '../../types/swag';

/**
 * Hook to mark a redemption as fulfilled
 */
export function useMarkRedemptionFulfilled(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];

  const markRedemptionFulfilled = async (tokenId: bigint, owner: string) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    // Check on-chain redemption status before attempting to fulfill
    const rpcUrl = getChainRpc(chainId);
    const client = createPublicClient({
      transport: http(rpcUrl),
    });

    try {
      const currentStatus = await (client.readContract as any)({
        address: designAddress as `0x${string}`,
        abi: Swag1155ABI,
        functionName: 'getRedemptionStatus',
        args: [tokenId, owner as `0x${string}`],
      });

      const status = Number(currentStatus) as RedemptionStatus;

      if (status !== RedemptionStatus.PendingFulfillment) {
        const statusText = status === RedemptionStatus.Fulfilled
          ? 'already fulfilled'
          : status === RedemptionStatus.NotRedeemed
            ? 'not yet redeemed'
            : 'in an invalid state';
        throw new Error(`This redemption is ${statusText}. Current status: ${RedemptionStatus[status]}`);
      }
    } catch (error) {
      // If the error is already our custom error, rethrow it
      if (error instanceof Error && (
          error.message.includes('already fulfilled') ||
          error.message.includes('not yet redeemed') ||
          error.message.includes('invalid state')
      )) {
        throw error;
      }
      // Otherwise, log and continue - the contract will check anyway
      logger.warn('Could not check redemption status before fulfillment:', error);
    }

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'markFulfilled',
      args: [tokenId, owner as `0x${string}`],
    });

    const result = await sendTransaction(
      {
        to: designAddress as `0x${string}`,
        data,
        chainId,
      },
      { sponsor: true }
    );

    queryClient.invalidateQueries({ queryKey: ['admin-minted-nfts', designAddress] });

    return result;
  };

  return {
    markRedemptionFulfilled,
    canMarkFulfilled: Boolean(designAddress && activeWallet),
  };
}

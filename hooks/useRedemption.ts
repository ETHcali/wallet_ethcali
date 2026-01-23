import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import Swag1155ABI from '../frontend/abis/Swag1155.json';

/**
 * Hook to redeem an NFT (request physical item fulfillment)
 * Updated to use requestPhysicalRedemption() function
 */
export function useRedeem(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const redeem = async (tokenId: bigint) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'requestPhysicalRedemption',
      args: [tokenId],
    });

    const result = await sendTransaction({
      to: designAddress as `0x${string}`,
      data,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    // Invalidate and refetch queries to refresh data immediately
    await queryClient.invalidateQueries({ queryKey: ['user-nfts'] });
    await queryClient.refetchQueries({ queryKey: ['user-nfts'] });

    return result;
  };

  return {
    redeem,
    canRedeem: Boolean(designAddress && activeWallet),
  };
}

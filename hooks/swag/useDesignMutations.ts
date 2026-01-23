/**
 * useDesignMutations - Mutation hooks for updating design properties
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { priceToBaseUnits } from '../../utils/tokenGeneration';
import type { DesignInfo, DiscountConfig } from '../../types/swag';

/**
 * Hook to update Design information
 */
export function useUpdateDesignInfo(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const updateDesignInfo = async (designInfo: DesignInfo) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setDesignInfo',
      args: [designInfo],
    });

    const result = await sendTransaction({
      to: designAddress as `0x${string}`,
      data,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['design-info', designAddress] });

    return result;
  };

  return {
    updateDesignInfo,
    canUpdate: Boolean(designAddress && activeWallet),
  };
}

/**
 * Hook to update Design discount configuration
 */
export function useUpdateDesignDiscountConfig(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const updateDiscountConfig = async (discountConfig: DiscountConfig) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setDesignDiscountConfig',
      args: [discountConfig],
    });

    const result = await sendTransaction({
      to: designAddress as `0x${string}`,
      data,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['design-discount-config', designAddress] });

    return result;
  };

  return {
    updateDiscountConfig,
    canUpdate: Boolean(designAddress && activeWallet),
  };
}

/**
 * Hook to set Design active status
 */
export function useSetDesignActive(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const setDesignActive = async (active: boolean) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setDesignActive',
      args: [active],
    });

    const result = await sendTransaction({
      to: designAddress as `0x${string}`,
      data,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['design-info', designAddress] });

    return result;
  };

  return {
    setDesignActive,
    canSet: Boolean(designAddress && activeWallet),
  };
}

/**
 * Hook to set Design payment token
 */
export function useSetDesignPaymentToken(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const setPaymentToken = async (paymentTokenAddress: string) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setDesignPaymentToken',
      args: [paymentTokenAddress as `0x${string}`],
    });

    const result = await sendTransaction({
      to: designAddress as `0x${string}`,
      data,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['design-info', designAddress] });

    return result;
  };

  return {
    setPaymentToken,
    canSet: Boolean(designAddress && activeWallet),
  };
}

/**
 * Hook to set Design price
 */
export function useSetDesignPrice(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const setPrice = async (price: number) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const priceInUnits = priceToBaseUnits(price);

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setDesignPrice',
      args: [priceInUnits],
    });

    const result = await sendTransaction({
      to: designAddress as `0x${string}`,
      data,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['design-info', designAddress] });

    return result;
  };

  return {
    setPrice,
    canSet: Boolean(designAddress && activeWallet),
  };
}

/**
 * Hook to set Design total supply
 */
export function useSetDesignTotalSupply(designAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const setTotalSupply = async (totalSupply: number) => {
    if (!designAddress || !chainId) {
      throw new Error('Missing design address or chain ID');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setDesignTotalSupply',
      args: [BigInt(totalSupply)],
    });

    const result = await sendTransaction({
      to: designAddress as `0x${string}`,
      data,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['design-info', designAddress] });

    return result;
  };

  return {
    setTotalSupply,
    canSet: Boolean(designAddress && activeWallet),
  };
}

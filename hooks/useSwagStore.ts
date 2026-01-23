import { useQuery } from '@tanstack/react-query';
import { useSendTransaction, usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData, getAddress, isAddress } from 'viem';
import ERC20ABI from '../frontend/abis/ERC20.json';
import Swag1155ABI from '../frontend/abis/Swag1155.json';
import type { DesignInfo, DiscountConfig, SizeOption } from '../types/swag';
import { baseUnitsToPrice } from '../utils/tokenGeneration';
import { getChainRpc } from '../config/networks';
import { getChainConfig } from '../utils/network';
import { logger } from '../utils/logger';

/**
 * Hook to fetch Design information
 */
export function useDesignInfo(designAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['design-info', designAddress, chainId],
    queryFn: async () => {
      if (!designAddress || !chainId) throw new Error('Missing design address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const designInfo = await client.readContract({
        address: designAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getDesignInfo',
        args: [],
      });

      // Handle both array and object return formats
      if (Array.isArray(designInfo)) {
        const [
          name,
          description,
          imageUrl,
          website,
          paymentToken,
          pricePerUnit,
          totalSupply,
          minted,
          active,
          gender,
          color,
          style,
        ] = designInfo as [string, string, string, string, string, bigint, bigint, bigint, boolean, string, string, string];

        return {
          name,
          description,
          imageUrl,
          website,
          paymentToken,
          pricePerUnit,
          totalSupply,
          minted,
          active,
          gender,
          color,
          style,
        } as DesignInfo;
      }

      return designInfo as DesignInfo;
    },
    enabled: Boolean(designAddress && chainId),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    designInfo: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch Design discount configuration
 */
export function useDesignDiscountConfig(designAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['design-discount-config', designAddress, chainId],
    queryFn: async () => {
      if (!designAddress || !chainId) throw new Error('Missing design address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const discountConfig = await client.readContract({
        address: designAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getDesignDiscountConfig',
        args: [],
      });

      // Handle both array and object return formats
      if (Array.isArray(discountConfig)) {
        const [
          smartContractEnabled,
          smartContractAddress,
          smartContractDiscount,
          poapEnabled,
          poapEventId,
          poapDiscount,
          discountType,
        ] = discountConfig as [boolean, string, bigint, boolean, bigint, bigint, number];

        return {
          smartContractEnabled,
          smartContractAddress,
          smartContractDiscount,
          poapEnabled,
          poapEventId,
          poapDiscount,
          discountType: discountType as 0 | 1,
        } as DiscountConfig;
      }

      return discountConfig as DiscountConfig;
    },
    enabled: Boolean(designAddress && chainId),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    discountConfig: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch remaining supply for a Design
 */
export function useDesignRemainingSupply(designAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['design-remaining-supply', designAddress, chainId],
    queryFn: async () => {
      if (!designAddress || !chainId) throw new Error('Missing design address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const remaining = await client.readContract({
        address: designAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getDesignRemainingSupply',
        args: [],
      });

      return Number(remaining as unknown as bigint);
    },
    enabled: Boolean(designAddress && chainId),
    staleTime: 0, // Always refetch
    gcTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    remaining: query.data || 0,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to calculate price with discounts applied
 */
export function useDesignPriceWithDiscounts(
  designAddress: string,
  chainId: number,
  userAddress?: string,
  hasPoap?: boolean
) {
  const query = useQuery({
    queryKey: ['design-price-with-discounts', designAddress, chainId, userAddress, hasPoap],
    queryFn: async () => {
      if (!designAddress || !chainId || !userAddress) throw new Error('Missing design address, chain ID, or user address');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const price = await client.readContract({
        address: designAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getDesignPriceWithDiscounts',
        args: [userAddress as `0x${string}`, hasPoap || false],
      });

      return price as unknown as bigint;
    },
    enabled: Boolean(designAddress && chainId && userAddress),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    price: query.data || 0n,
    priceDisplay: query.data ? baseUnitsToPrice(query.data) : 0,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to get size trait for a specific token
 */
export function useDesignTokenSize(tokenId: bigint, designAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['design-token-size', designAddress, chainId, tokenId.toString()],
    queryFn: async () => {
      if (!designAddress || !chainId || !tokenId) throw new Error('Missing design address, chain ID, or token ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const size = await client.readContract({
        address: designAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getDesignTokenSize',
        args: [tokenId],
      });

      return size as unknown as string;
    },
    enabled: Boolean(designAddress && chainId && tokenId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    size: query.data as SizeOption | undefined,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to get all traits for a specific token
 */
export function useDesignTokenTraits(tokenId: bigint, designAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['design-token-traits', designAddress, chainId, tokenId.toString()],
    queryFn: async () => {
      if (!designAddress || !chainId || !tokenId) throw new Error('Missing design address, chain ID, or token ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const traits = await client.readContract({
        address: designAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'getDesignTokenTraits',
        args: [tokenId],
      });

      // Handle both array and object return formats
      if (Array.isArray(traits)) {
        const [size, gender, color, style] = traits as [string, string, string, string];
        return { size, gender, color, style };
      }

      return traits as { size: string; gender: string; color: string; style: string };
    },
    enabled: Boolean(designAddress && chainId && tokenId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    traits: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to mint a Design NFT
 */
export function useMintDesign() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  // Helper to get chainId from wallet
  const getWalletChainId = (): number => {
    if (!activeWallet?.chainId) return 8453; // fallback to Base
    if (typeof activeWallet.chainId === 'string') {
      const parts = activeWallet.chainId.split(':');
      return parseInt(parts[parts.length - 1], 10);
    }
    return activeWallet.chainId;
  };

  const mint = async (
    designAddress: string,
    size: SizeOption,
    hasPoapDiscount: boolean,
    price: bigint
  ) => {
    if (!user || !activeWallet) {
      throw new Error('Connect your wallet to continue');
    }

    // Get fresh chainId from wallet at transaction time
    const walletChainId = getWalletChainId();
    const config = getChainConfig(walletChainId);
    const chainId = config.id;

    // Validate design address
    if (!isAddress(designAddress)) {
      throw new Error(`Invalid design address: ${designAddress}`);
    }

    const designAddressChecksummed = getAddress(designAddress);

    // Get payment token from design info
    const rpcUrl = getChainRpc(chainId);
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });

    // Fetch design info to get payment token
    const designInfo = await publicClient.readContract({
      address: designAddressChecksummed,
      abi: Swag1155ABI as any,
      functionName: 'getDesignInfo',
      args: [],
    });

    // Extract payment token from design info
    let paymentTokenAddress: string;
    if (Array.isArray(designInfo)) {
      paymentTokenAddress = designInfo[4] as string; // paymentToken is 5th element
    } else {
      paymentTokenAddress = (designInfo as DesignInfo).paymentToken;
    }

    if (!isAddress(paymentTokenAddress)) {
      throw new Error(`Invalid payment token address: ${paymentTokenAddress}`);
    }

    const paymentTokenChecksummed = getAddress(paymentTokenAddress);

    // Step 1: Check and approve payment token
    const walletAddress = getAddress(activeWallet.address);
    let currentAllowance = 0n;
    try {
      const allowanceResult = await publicClient.readContract({
        address: paymentTokenChecksummed,
        abi: ERC20ABI as any,
        functionName: 'allowance',
        args: [walletAddress, designAddressChecksummed],
      });
      if (allowanceResult !== undefined && allowanceResult !== null) {
        currentAllowance = BigInt(allowanceResult.toString());
      }
    } catch (error: any) {
      logger.warn('Failed to check allowance, assuming 0:', error?.message || error);
      currentAllowance = 0n;
    }

    // Only approve if current allowance is less than needed
    if (currentAllowance < price) {
      const approveData = encodeFunctionData({
        abi: ERC20ABI as any,
        functionName: 'approve',
        args: [designAddressChecksummed, price],
      });

      const approveResult = await sendTransaction({
        to: paymentTokenChecksummed,
        data: approveData,
        chainId,
      }, {
        address: activeWallet.address,
        sponsor: isEmbedded,
      } as any);

      // Wait for approval transaction to be confirmed
      if (approveResult?.hash) {
        await publicClient.waitForTransactionReceipt({
          hash: approveResult.hash as `0x${string}`,
          confirmations: 1,
        });
      } else {
        // If no hash returned, wait a bit
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Step 2: Mint Design NFT
    const mintData = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'mintDesign',
      args: [size, hasPoapDiscount],
    });

    return sendTransaction({
      to: designAddressChecksummed,
      data: mintData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);
  };

  return {
    mint,
    canMint: Boolean(user && activeWallet),
  };
}

/**
 * Hook to mint multiple Design NFTs in a batch
 */
export function useMintDesignBatch() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  // Helper to get chainId from wallet
  const getWalletChainId = (): number => {
    if (!activeWallet?.chainId) return 8453; // fallback to Base
    if (typeof activeWallet.chainId === 'string') {
      const parts = activeWallet.chainId.split(':');
      return parseInt(parts[parts.length - 1], 10);
    }
    return activeWallet.chainId;
  };

  const mintBatch = async (
    designAddress: string,
    sizes: SizeOption[],
    hasPoapDiscount: boolean,
    totalPrice: bigint
  ) => {
    if (!user || !activeWallet) {
      throw new Error('Connect your wallet to continue');
    }

    if (sizes.length === 0) {
      throw new Error('Select at least one size');
    }

    // Get fresh chainId from wallet at transaction time
    const walletChainId = getWalletChainId();
    const config = getChainConfig(walletChainId);
    const chainId = config.id;

    // Validate design address
    if (!isAddress(designAddress)) {
      throw new Error(`Invalid design address: ${designAddress}`);
    }

    const designAddressChecksummed = getAddress(designAddress);

    // Get payment token from design info
    const rpcUrl = getChainRpc(chainId);
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });

    // Fetch design info to get payment token
    const designInfo = await publicClient.readContract({
      address: designAddressChecksummed,
      abi: Swag1155ABI as any,
      functionName: 'getDesignInfo',
      args: [],
    });

    // Extract payment token from design info
    let paymentTokenAddress: string;
    if (Array.isArray(designInfo)) {
      paymentTokenAddress = designInfo[4] as string; // paymentToken is 5th element
    } else {
      paymentTokenAddress = (designInfo as DesignInfo).paymentToken;
    }

    if (!isAddress(paymentTokenAddress)) {
      throw new Error(`Invalid payment token address: ${paymentTokenAddress}`);
    }

    const paymentTokenChecksummed = getAddress(paymentTokenAddress);

    // Step 1: Check and approve payment token
    const walletAddress = getAddress(activeWallet.address);
    let currentAllowance = 0n;
    try {
      const allowanceResult = await publicClient.readContract({
        address: paymentTokenChecksummed,
        abi: ERC20ABI as any,
        functionName: 'allowance',
        args: [walletAddress, designAddressChecksummed],
      });
      if (allowanceResult !== undefined && allowanceResult !== null) {
        currentAllowance = BigInt(allowanceResult.toString());
      }
    } catch (error: any) {
      logger.warn('Failed to check allowance, assuming 0:', error?.message || error);
      currentAllowance = 0n;
    }

    // Only approve if current allowance is less than needed
    if (currentAllowance < totalPrice) {
      const approveData = encodeFunctionData({
        abi: ERC20ABI as any,
        functionName: 'approve',
        args: [designAddressChecksummed, totalPrice],
      });

      const approveResult = await sendTransaction({
        to: paymentTokenChecksummed,
        data: approveData,
        chainId,
      }, {
        address: activeWallet.address,
        sponsor: isEmbedded,
      } as any);

      // Wait for approval transaction to be confirmed
      if (approveResult?.hash) {
        await publicClient.waitForTransactionReceipt({
          hash: approveResult.hash as `0x${string}`,
          confirmations: 1,
        });
      } else {
        // If no hash returned, wait a bit
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Step 2: Mint Design NFTs in batch
    const mintBatchData = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'mintDesignBatch',
      args: [sizes, hasPoapDiscount],
    });

    return sendTransaction({
      to: designAddressChecksummed,
      data: mintBatchData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);
  };

  return {
    mintBatch,
    canMint: Boolean(user && activeWallet),
  };
}

/**
 * Stub hooks for ProductGroup (variant-based UI).
 * ProductGroup is not currently used; the app uses ProductCard + design-based hooks.
 * These return safe defaults so ProductGroup compiles. Replace with real impl when needed.
 */
export function useVariantState(_tokenId: bigint) {
  return { price: 0, available: 0, active: false, isLoading: false };
}

export function useVariantMetadata(_tokenId: bigint) {
  const metadata: import('../types/swag').Swag1155Metadata = {
    name: 'Unknown',
    description: '',
    image: '/logo_eth_cali.png',
    attributes: [],
  };
  return { metadata, isLoading: false };
}

export function useBuyVariant() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];
  const canBuy = Boolean(user && activeWallet);
  const buy = async (_tokenId: bigint, _quantity: number, _price: number) => {
    if (!canBuy) throw new Error('Connect your wallet to continue');
    // No-op stub; ProductGroup not used with real variant flow yet.
  };
  return { buy, canBuy };
}

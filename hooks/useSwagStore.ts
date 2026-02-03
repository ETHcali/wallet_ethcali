import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData, getAddress, isAddress } from 'viem';
import ERC20ABI from '../frontend/abis/ERC20.json';
import Swag1155ABI from '../frontend/abis/Swag1155.json';
import { getChainRpc } from '../config/networks';
import { getChainConfig } from '../utils/network';
import { logger } from '../utils/logger';

/**
 * Hook to buy a single variant (replaces useMintDesign).
 * Calls buy(tokenId, quantity) on the Swag1155 contract.
 * Uses getDiscountedPrice(tokenId, buyer) for USDC approval amount.
 * Gets USDC address from contract's usdc() function.
 */
export function useBuy() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const getWalletChainId = (): number => {
    if (!activeWallet?.chainId) return 8453;
    if (typeof activeWallet.chainId === 'string') {
      const parts = activeWallet.chainId.split(':');
      return parseInt(parts[parts.length - 1], 10);
    }
    return activeWallet.chainId;
  };

  const buy = async (
    contractAddress: string,
    tokenId: number,
    quantity: number
  ) => {
    if (!user || !activeWallet) throw new Error('Connect your wallet to continue');
    if (!isAddress(contractAddress)) throw new Error(`Invalid contract address: ${contractAddress}`);

    const walletChainId = getWalletChainId();
    const config = getChainConfig(walletChainId);
    const chainId = config.id;
    const contractAddr = getAddress(contractAddress);
    const walletAddress = getAddress(activeWallet.address);

    const rpcUrl = getChainRpc(chainId);
    const publicClient = createPublicClient({ transport: http(rpcUrl) });

    // Get USDC address from contract
    const usdcAddress = getAddress(
      await publicClient.readContract({
        address: contractAddr,
        abi: Swag1155ABI as any,
        functionName: 'usdc',
        args: [],
      }) as unknown as string
    );

    // Get discounted price per unit
    const discountedPrice = await publicClient.readContract({
      address: contractAddr,
      abi: Swag1155ABI as any,
      functionName: 'getDiscountedPrice',
      args: [BigInt(tokenId), walletAddress],
    }) as unknown as bigint;

    const totalPrice = discountedPrice * BigInt(quantity);

    // Approve USDC if needed (skip if free)
    if (totalPrice > 0n) {
      let currentAllowance = 0n;
      try {
        const allowanceResult = await publicClient.readContract({
          address: usdcAddress,
          abi: ERC20ABI as any,
          functionName: 'allowance',
          args: [walletAddress, contractAddr],
        });
        if (allowanceResult !== undefined && allowanceResult !== null) {
          currentAllowance = BigInt(allowanceResult.toString());
        }
      } catch (error: any) {
        logger.warn('Failed to check allowance, assuming 0:', error?.message || error);
      }

      if (currentAllowance < totalPrice) {
        const approveData = encodeFunctionData({
          abi: ERC20ABI as any,
          functionName: 'approve',
          args: [contractAddr, totalPrice],
        });
        const approveResult = await sendTransaction(
          { to: usdcAddress, data: approveData, chainId },
          { sponsor: true }
        );
        if (approveResult?.hash) {
          await publicClient.waitForTransactionReceipt({
            hash: approveResult.hash as `0x${string}`,
            confirmations: 1,
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    // Buy
    const buyData = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'buy',
      args: [BigInt(tokenId), BigInt(quantity)],
    });

    const result = await sendTransaction(
      { to: contractAddr, data: buyData, chainId },
      { sponsor: true }
    );

    // Invalidate variant queries
    queryClient.invalidateQueries({ queryKey: ['swag-variant', contractAddress] });
    queryClient.invalidateQueries({ queryKey: ['swag-variant-remaining', contractAddress] });

    return result;
  };

  return { buy, canBuy: Boolean(user && activeWallet) };
}

/**
 * Hook to buy multiple variants in a batch (replaces useMintDesignBatch).
 * Calls buyBatch(tokenIds, quantities) on the Swag1155 contract.
 */
export function useBuyBatch() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const getWalletChainId = (): number => {
    if (!activeWallet?.chainId) return 8453;
    if (typeof activeWallet.chainId === 'string') {
      const parts = activeWallet.chainId.split(':');
      return parseInt(parts[parts.length - 1], 10);
    }
    return activeWallet.chainId;
  };

  const buyBatch = async (
    contractAddress: string,
    tokenIds: number[],
    quantities: number[]
  ) => {
    if (!user || !activeWallet) throw new Error('Connect your wallet to continue');
    if (tokenIds.length === 0) throw new Error('Select at least one item');
    if (tokenIds.length !== quantities.length) throw new Error('tokenIds and quantities must match');
    if (!isAddress(contractAddress)) throw new Error(`Invalid contract address: ${contractAddress}`);

    const walletChainId = getWalletChainId();
    const config = getChainConfig(walletChainId);
    const chainId = config.id;
    const contractAddr = getAddress(contractAddress);
    const walletAddress = getAddress(activeWallet.address);

    const rpcUrl = getChainRpc(chainId);
    const publicClient = createPublicClient({ transport: http(rpcUrl) });

    // Get USDC address from contract
    const usdcAddress = getAddress(
      await publicClient.readContract({
        address: contractAddr,
        abi: Swag1155ABI as any,
        functionName: 'usdc',
        args: [],
      }) as unknown as string
    );

    // Sum discounted prices for all items
    let totalPrice = 0n;
    for (let i = 0; i < tokenIds.length; i++) {
      const discountedPrice = await publicClient.readContract({
        address: contractAddr,
        abi: Swag1155ABI as any,
        functionName: 'getDiscountedPrice',
        args: [BigInt(tokenIds[i]), walletAddress],
      }) as unknown as bigint;
      totalPrice += discountedPrice * BigInt(quantities[i]);
    }

    // Approve USDC if needed (skip if free)
    if (totalPrice > 0n) {
      let currentAllowance = 0n;
      try {
        const allowanceResult = await publicClient.readContract({
          address: usdcAddress,
          abi: ERC20ABI as any,
          functionName: 'allowance',
          args: [walletAddress, contractAddr],
        });
        if (allowanceResult !== undefined && allowanceResult !== null) {
          currentAllowance = BigInt(allowanceResult.toString());
        }
      } catch (error: any) {
        logger.warn('Failed to check allowance, assuming 0:', error?.message || error);
      }

      if (currentAllowance < totalPrice) {
        const approveData = encodeFunctionData({
          abi: ERC20ABI as any,
          functionName: 'approve',
          args: [contractAddr, totalPrice],
        });
        const approveResult = await sendTransaction(
          { to: usdcAddress, data: approveData, chainId },
          { sponsor: true }
        );
        if (approveResult?.hash) {
          await publicClient.waitForTransactionReceipt({
            hash: approveResult.hash as `0x${string}`,
            confirmations: 1,
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    // Buy batch
    const buyBatchData = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'buyBatch',
      args: [tokenIds.map(id => BigInt(id)), quantities.map(q => BigInt(q))],
    });

    const result = await sendTransaction(
      { to: contractAddr, data: buyBatchData, chainId },
      { sponsor: true }
    );

    queryClient.invalidateQueries({ queryKey: ['swag-variant', contractAddress] });
    queryClient.invalidateQueries({ queryKey: ['swag-variant-remaining', contractAddress] });

    return result;
  };

  return { buyBatch, canBuy: Boolean(user && activeWallet) };
}

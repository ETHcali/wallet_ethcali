/**
 * useVaultMutations - Hooks for vault CRUD operations
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData, parseEther } from 'viem';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { useSwagAddresses } from '../../utils/network';
import { VaultFormData, VaultUpdateData } from '../../types/faucet';

/**
 * Hook to create a new vault
 */
export function useCreateVault() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const createVault = async (data: VaultFormData) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const claimAmountWei = parseEther(data.claimAmount);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'createVault',
      args: [data.name, data.description, claimAmountWei, data.vaultType],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    createVault,
    canCreate: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to update an existing vault
 */
export function useUpdateVault() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const updateVault = async (data: VaultUpdateData) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const claimAmountWei = parseEther(data.claimAmount);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'updateVault',
      args: [data.vaultId, data.name, data.description, claimAmountWei, data.active],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    updateVault,
    canUpdate: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to deposit ETH into a vault
 */
export function useVaultDeposit() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];

  const deposit = async (vaultId: number, amountEth: string) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const amountWei = parseEther(amountEth);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'deposit',
      args: [vaultId],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      value: amountWei,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: false,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    deposit,
    canDeposit: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to withdraw ETH from a vault
 */
export function useVaultWithdraw() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const withdraw = async (vaultId: number, amountEth: string) => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const amountWei = parseEther(amountEth);

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'withdraw',
      args: [vaultId, amountWei],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-all-vaults'] });

    return result;
  };

  return {
    withdraw,
    canWithdraw: Boolean(faucetManager && activeWallet),
  };
}

/**
 * Hook to pause/unpause the faucet
 */
export function useFaucetPause() {
  const { faucetManager, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const pause = async () => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'pause',
      args: [],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-paused'] });

    return result;
  };

  const unpause = async () => {
    if (!faucetManager || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: FaucetManagerABI as any,
      functionName: 'unpause',
      args: [],
    });

    const result = await sendTransaction({
      to: faucetManager as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['faucet-paused'] });

    return result;
  };

  return {
    pause,
    unpause,
    canPause: Boolean(faucetManager && activeWallet),
  };
}

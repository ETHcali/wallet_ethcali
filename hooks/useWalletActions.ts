/**
 * useWalletActions - Hook for wallet actions like fund and export
 */
import { useState, useCallback } from 'react';
import { usePrivy, useFundWallet } from '@privy-io/react-auth';
import { base, mainnet, optimism } from 'viem/chains';
import { useActiveWallet } from './useActiveWallet';
import { logger } from '../utils/logger';

interface UseWalletActionsResult {
  fundWallet: () => Promise<void>;
  exportWallet: () => Promise<void>;
  isFunding: boolean;
  canFund: boolean;
  canExport: boolean;
}

export function useWalletActions(chainId?: number): UseWalletActionsResult {
  const { exportWallet: privyExportWallet } = usePrivy();
  const { fundWallet: privyFundWallet } = useFundWallet();
  const { wallet, isEmbeddedWallet } = useActiveWallet();

  const [isFunding, setIsFunding] = useState(false);

  const getViemChain = useCallback(() => {
    switch (chainId) {
      case 1: return mainnet;
      case 10: return optimism;
      default: return base;
    }
  }, [chainId]);

  const fundWallet = useCallback(async () => {
    if (!wallet?.address || !isEmbeddedWallet) return;

    setIsFunding(true);
    try {
      const viemChain = getViemChain();
      await privyFundWallet(wallet.address, {
        chain: viemChain,
      });
    } catch (error) {
      logger.error('Error funding wallet:', error);
    } finally {
      setIsFunding(false);
    }
  }, [wallet?.address, isEmbeddedWallet, getViemChain, privyFundWallet]);

  const exportWallet = useCallback(async () => {
    if (!wallet?.address) return;
    try {
      await privyExportWallet({ address: wallet.address });
    } catch (error) {
      logger.error('Error exporting wallet:', error);
    }
  }, [wallet?.address, privyExportWallet]);

  return {
    fundWallet,
    exportWallet,
    isFunding,
    canFund: isEmbeddedWallet && !!wallet?.address,
    canExport: isEmbeddedWallet && !!wallet?.address,
  };
}

import { useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';

/**
 * Hook to get the active embedded wallet
 * This app only supports embedded wallets (email + passkey auth)
 */
export function useActiveWallet() {
  const { wallets, ready } = useWallets();

  const wallet = useMemo(() => {
    if (!wallets || wallets.length === 0) return null;
    return wallets[0];
  }, [wallets]);

  return {
    wallet,
    wallets,
    ready,
    address: wallet?.address,
    walletClientType: wallet?.walletClientType,
  };
}


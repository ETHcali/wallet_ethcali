import { useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';

/**
 * Hook to get the active wallet based on how the user logged in
 * 
 * - If user logged in with email/passkey → they have an embedded wallet
 * - If user logged in with external wallet (MetaMask, etc.) → they use that wallet
 * 
 * Gas sponsorship is ONLY available for embedded wallets (via Privy's sendTransaction).
 * External wallets must pay their own gas.
 */
export function useActiveWallet() {
  const { wallets, ready } = useWallets();

  // Get the first wallet - this is the wallet the user is using
  // Privy's useWallets returns wallets in order of connection
  const activeWallet = useMemo(() => {
    if (!wallets || wallets.length === 0) return null;
    return wallets[0];
  }, [wallets]);

  const isEmbeddedWallet = useMemo(() => {
    return activeWallet?.walletClientType === 'privy';
  }, [activeWallet]);

  const isExternalWallet = useMemo(() => {
    return activeWallet && activeWallet.walletClientType !== 'privy';
  }, [activeWallet]);

  // Gas sponsorship is ONLY available for embedded wallets
  // Always enable it when possible (Privy handles if it's not available)
  const canUseSponsoredGas = isEmbeddedWallet;

  return {
    wallet: activeWallet,
    wallets,
    ready,
    isEmbeddedWallet,
    isExternalWallet,
    canUseSponsoredGas,
    address: activeWallet?.address,
    walletClientType: activeWallet?.walletClientType,
  };
}

/**
 * Helper to check if an address matches any connected wallet
 */
export function useIsConnectedAddress(targetAddress: string | undefined) {
  const { wallets, ready } = useWallets();

  const isConnected = useMemo(() => {
    if (!targetAddress || !wallets || wallets.length === 0) return false;
    return wallets.some(
      w => w.address?.toLowerCase() === targetAddress.toLowerCase()
    );
  }, [wallets, targetAddress]);

  return { isConnected, ready };
}

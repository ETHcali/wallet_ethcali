import { useWallets } from '@privy-io/react-auth';
import { usePrivy } from '@privy-io/react-auth';
import { useMemo } from 'react';

/**
 * Hook to get the active wallet.
 *
 * Priority:
 *  1. The external wallet the user explicitly authenticated with
 *     (matched by address in user.linkedAccounts)
 *  2. The embedded (privy) wallet
 *
 * Deliberately skips any injected/browser extension wallet that happens
 * to be open but was NOT used to sign in — this prevents MetaMask (or any
 * other auto-connecting extension) from hijacking the session wallet.
 */
export function useActiveWallet() {
  const { wallets, ready } = useWallets();
  const { user } = usePrivy();

  const wallet = useMemo(() => {
    if (!wallets || wallets.length === 0) return null;

    // Step 1 – find the exact external wallet the user authenticated with
    if (user?.linkedAccounts) {
      const authedWalletAccount = user.linkedAccounts.find(
        (account) =>
          account.type === 'wallet' &&
          (account as { walletClientType?: string }).walletClientType !== 'privy'
      );

      if (authedWalletAccount && 'address' in authedWalletAccount) {
        const authedAddress = (authedWalletAccount as { address: string }).address.toLowerCase();
        const matched = wallets.find(
          (w) => w.address.toLowerCase() === authedAddress
        );
        if (matched) return matched;
      }
    }

    // Step 2 – fall back to the embedded (privy) wallet
    // Ignore any injected external wallet that the user did NOT authenticate with.
    const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
    return embeddedWallet ?? wallets[0];
  }, [wallets, user]);

  return {
    wallet,
    wallets,
    ready,
    address: wallet?.address,
    walletClientType: wallet?.walletClientType,
    /** True when the active wallet is an external wallet (not privy embedded). */
    isExternalWallet: wallet ? wallet.walletClientType !== 'privy' : false,
  };
}


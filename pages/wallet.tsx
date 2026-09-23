import { useState, useEffect } from 'react';
import { usePrivy, useWallets, useConnectWallet } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import WalletInfo from '../components/wallet/WalletInfo';
import Navigation from '../components/Navigation';
import { useChainBalances } from '../hooks/useChainBalances';
import { useActiveWallet } from '../hooks/useActiveWallet';

export default function WalletPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const { wallet: activeWallet } = useActiveWallet();
  const { wallets } = useWallets();
  const { connectWallet } = useConnectWallet();
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      // With the destination attached. Bouncing to a bare '/' threw away where
      // the visitor was going, so a link to this page from ethcali.org signed
      // them in and landed them on the wallet instead.
      //
      // `replace`, not `push`: this route will bounce again the moment Back
      // returns to it, which traps the Back button.
      router.replace(`/?next=${encodeURIComponent(router.pathname)}`);
    }
  }, [ready, authenticated, router]);

  // Detect whether the authenticated user linked an external wallet but it
  // has not yet reconnected in this browser session.
  const linkedExternalWallet = user?.linkedAccounts?.find(
    (a) =>
      a.type === 'wallet' &&
      (a as { walletClientType?: string }).walletClientType !== 'privy'
  );
  const externalWalletAddress =
    linkedExternalWallet && 'address' in linkedExternalWallet
      ? (linkedExternalWallet as { address: string }).address
      : null;
  const externalWalletConnected = wallets.some(
    (w) => w.walletClientType !== 'privy'
  );
  const needsWalletReconnect =
    authenticated && !!externalWalletAddress && !externalWalletConnected;

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await connectWallet();
    } finally {
      setIsReconnecting(false);
    }
  };

  // Every chain in `chainsFor('send')`, each read with its own client. The
  // wallet's current network plays no part in what is shown.
  const { balances, isLoading: isBalanceLoading, refetch: refreshBalances } = useChainBalances(
    activeWallet?.address
  );

  // Show loading state while Privy initializes
  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  // Don't render if not authenticated (will redirect)
  if (!authenticated) {
    return <Loading fullScreen={true} text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen bg-surface-void">
      <Navigation />
      <Layout>
        <div className="space-y-6">
          {activeWallet ? (
            <WalletInfo
              address={activeWallet.address}
              balances={balances}
              isLoading={isBalanceLoading}
              onRefresh={refreshBalances}
            />
          ) : (
            <div className="rounded-control border border-eth-blue/30 bg-surface-slab p-5 text-center  sm:p-8">
              {needsWalletReconnect ? (
                // External wallet was used to log in but is not connected in this session
                <>
                  <p className="mb-2 text-eth-blue-text font-mono text-sm">Wallet not connected</p>
                  <p className="text-content-faint text-xs font-mono mb-1">
                    {externalWalletAddress?.slice(0, 6)}…{externalWalletAddress?.slice(-4)}
                  </p>
                  <p className="text-content-faint text-xs mb-6">
                    Your external wallet is not connected in this session.
                  </p>
                  <button
                    onClick={handleReconnect}
                    disabled={isReconnecting}
                    className="mx-auto flex min-h-tap w-full max-w-xs items-center justify-center gap-2 rounded-control bg-eth-blue px-6 font-mono text-sm text-content-primary transition-all hover:bg-eth-blue-lift disabled:opacity-50 sm:w-auto"
                  >
                    {isReconnecting && (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {isReconnecting ? 'Connecting…' : 'Reconnect wallet'}
                  </button>
                </>
              ) : (
                // Embedded wallet is being created
                <>
                  <p className="mb-4 text-eth-blue-text font-mono">Setting up your wallet…</p>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 border-2 border-eth-blue border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

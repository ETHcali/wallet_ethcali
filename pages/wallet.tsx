import { useState, useEffect } from 'react';
import { usePrivy, useWallets, useConnectWallet } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import WalletInfo from '../components/wallet/WalletInfo';
import Navigation from '../components/Navigation';
import { useBalances } from '../hooks/useBalances';
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

  // Read with the registry's own client; the wallet's current network plays
  // no part in what is shown.
  const { rows, isLoading: isBalanceLoading, isError: isBalanceError, refetch: refreshBalances } = useBalances(
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
        {activeWallet ? (
          <WalletInfo
            address={activeWallet.address}
            rows={rows}
            isLoading={isBalanceLoading}
            isError={isBalanceError}
            onRefresh={refreshBalances}
          />
        ) : (
          <div className="mx-auto max-w-xl rounded-card border border-line-hairline bg-surface-slab px-5 py-8 text-center">
            {needsWalletReconnect ? (
              // External wallet was used to log in but is not connected in this session
              <>
                <p className="mb-0 text-[15px] font-medium text-content-primary">Wallet not connected</p>
                <p className="mb-0 mt-1 font-mono text-xs text-content-faint">
                  {externalWalletAddress?.slice(0, 6)}…{externalWalletAddress?.slice(-4)}
                </p>
                <p className="mb-0 mt-2 text-sm text-content-muted">Your external wallet is not connected in this session.</p>
                <button
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="mt-5 flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-6 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:opacity-50"
                >
                  {isReconnecting && (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {isReconnecting ? 'Connecting…' : 'Reconnect wallet'}
                </button>
              </>
            ) : (
              // Embedded wallet is being created
              <>
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-eth-blue border-t-transparent" />
                <p className="mb-0 mt-4 text-sm text-content-muted">Setting up your wallet…</p>
              </>
            )}
          </div>
        )}
      </Layout>
    </div>
  );
}

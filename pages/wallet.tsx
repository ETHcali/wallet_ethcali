import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePrivy, useWallets, useConnectWallet } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import WalletInfo from '../components/wallet/WalletInfo';
import Navigation from '../components/Navigation';
import { Wallet } from '../types/index';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { useActiveWallet } from '../hooks/useActiveWallet';

export default function WalletPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const { wallet: activeWallet } = useActiveWallet();
  const { wallets } = useWallets();
  const { connectWallet } = useConnectWallet();
  const [currentChainId, setCurrentChainId] = useState(8453); // Default to Base
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
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

  // Use the active wallet (prioritizes external over embedded)
  const userWallet = activeWallet;
  
  // Use our custom hook to fetch real balances from selected network
  const { 
    balances, 
    isLoading: isBalanceLoading, 
    refetch: refreshBalances 
  } = useTokenBalances(userWallet?.address, currentChainId);

  // Show loading state while Privy initializes
  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  // Don't render if not authenticated (will redirect)
  if (!authenticated) {
    return <Loading fullScreen={true} text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation 
        currentChainId={currentChainId}
        onChainChange={(newChainId) => {
          setCurrentChainId(newChainId);
          setTimeout(() => refreshBalances(), 100);
        }}
      />
      <Layout>
        <div className="space-y-6">
          {userWallet ? (
            <div className="space-y-6" key={currentChainId}>
              <WalletInfo
                wallet={userWallet as unknown as Wallet}
                balances={balances}
                isLoading={isBalanceLoading}
                onRefresh={refreshBalances}
                chainId={currentChainId}
              />

              {/* Quick Access to Other Services */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">ETH CALI Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/faucet" className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all group">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 bg-green-400 rounded"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-400 group-hover:text-green-300">ETH Faucet</h4>
                      <p className="text-gray-500 text-xs">Get sponsored ETH for verified users</p>
                    </div>
                  </Link>
                  
                  <Link href="/sybil" className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all group">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xs">ID</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-400 group-hover:text-purple-300">Sybil Proof</h4>
                      <p className="text-gray-500 text-xs">Prove your personhood with ZKPassport</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 p-8 rounded-lg text-center shadow border border-cyan-500/30">
              {needsWalletReconnect ? (
                // External wallet was used to log in but is not connected in this session
                <>
                  <p className="mb-2 text-cyan-400 font-mono text-sm">WALLET_NOT_CONNECTED</p>
                  <p className="text-gray-500 text-xs font-mono mb-1">
                    {externalWalletAddress?.slice(0, 6)}…{externalWalletAddress?.slice(-4)}
                  </p>
                  <p className="text-gray-600 text-xs mb-6">
                    Your external wallet is not connected in this session.
                  </p>
                  <button
                    onClick={handleReconnect}
                    disabled={isReconnecting}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg font-mono text-sm transition-all flex items-center gap-2 mx-auto"
                  >
                    {isReconnecting && (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isReconnecting ? 'Connecting…' : '🔗 Reconnect Wallet'}
                  </button>
                </>
              ) : (
                // Embedded wallet is being created
                <>
                  <p className="mb-4 text-cyan-400 font-mono">INITIALIZING_WALLET...</p>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
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

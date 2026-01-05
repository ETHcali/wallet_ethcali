import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import WalletInfoCyber from '../components/wallet/WalletInfoCyber';
import Navigation from '../components/Navigation';
import { Wallet } from '../types/index';
import { useTokenBalances } from '../hooks/useTokenBalances';

export default function WalletPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [currentChainId, setCurrentChainId] = useState(8453); // Default to Base

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // Get embedded wallet from Privy
  const userWallet = wallets?.[0];
  
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
              <WalletInfoCyber 
                wallet={userWallet as unknown as Wallet} 
                balances={balances}
                isLoading={isBalanceLoading}
                onRefresh={refreshBalances}
                chainId={currentChainId}
              />
            </div>
          ) : (
            <div className="bg-gray-900 p-8 rounded-lg text-center shadow border border-cyan-500/30">
              <p className="mb-4 text-cyan-400 font-mono">CREATING_WALLET...</p>
              <div className="flex justify-center">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

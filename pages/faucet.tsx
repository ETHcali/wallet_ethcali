import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import FaucetClaim from '../components/faucet/FaucetClaim';
import FaucetAdmin from '../components/faucet/FaucetAdmin';
import { isAdmin, getNetworkName } from '../utils/contracts';

export default function FaucetPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [currentChainId, setCurrentChainId] = useState(8453); // Default to Base

  const userWallet = wallets?.[0];
  const userIsAdmin = isAdmin(userWallet?.address);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

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
        onChainChange={setCurrentChainId}
      />
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
              FAUCET
            </h1>
            <p className="text-gray-500 font-mono text-xs mt-1">
              Claim ETH on {getNetworkName(currentChainId).toUpperCase()}
            </p>
          </div>

          {/* User Claim Section - key forces re-render on chain change */}
          <FaucetClaim 
            key={`claim-${currentChainId}`}
            chainId={currentChainId}
            onClaimSuccess={() => {
              console.log('Claim successful!');
            }}
          />

          {/* Admin Section */}
          {userIsAdmin && (
            <div className="space-y-4">
              <div className="border-t border-orange-500/30 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-orange-400">⚡</span>
                  <p className="text-orange-400 font-mono text-sm font-bold">ADMIN_ACCESS</p>
                </div>
              </div>
              <FaucetAdmin key={`admin-${currentChainId}`} chainId={currentChainId} />
            </div>
          )}

          {/* Info Section */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 font-mono">HOW_IT_WORKS</h3>
            <div className="space-y-2 text-xs text-gray-500 font-mono">
              <p>1. Complete Sybil verification to get your ZKPassport NFT</p>
              <p>2. Return here to claim your ETH</p>
              <p>3. Each verified human can claim once per network</p>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}

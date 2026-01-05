import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Link from 'next/link';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';

export default function Home() {
  const { login, ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [currentChainId, setCurrentChainId] = useState(8453);

  const userWallet = wallets?.[0];

  // Loading timeout state
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) {
        setLoadingTimeout(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!ready) {
    if (loadingTimeout) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Initialization Error</h2>
            <p className="text-gray-400 mb-4">Taking too long to initialize.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return <Loading fullScreen={true} text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {authenticated && (
        <Navigation 
          currentChainId={currentChainId}
          onChainChange={setCurrentChainId}
        />
      )}
      
      {!authenticated ? (
        // Login View
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm w-full">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/Logo ETHCALI Fondo Negro.png" 
                alt="ETH CALI" 
                className="h-20 mx-auto"
              />
            </div>

            {/* Tagline */}
            <p className="text-gray-500 font-mono text-xs mb-8">
              Sybil-resistant wallet & faucet
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-3">
                <span className="text-xl">💳</span>
                <p className="text-[10px] text-gray-600 font-mono mt-1">WALLET</p>
              </div>
              <div className="bg-gray-900/50 border border-purple-500/20 rounded-lg p-3">
                <span className="text-xl">🚰</span>
                <p className="text-[10px] text-gray-600 font-mono mt-1">FAUCET</p>
              </div>
              <div className="bg-gray-900/50 border border-pink-500/20 rounded-lg p-3">
                <span className="text-xl">🛡️</span>
                <p className="text-[10px] text-gray-600 font-mono mt-1">SYBIL</p>
              </div>
            </div>

            {/* Login Button */}
            <button 
              onClick={login}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl text-white font-mono font-bold transition-all"
            >
              CONNECT
            </button>
            <p className="text-[10px] text-gray-600 font-mono mt-3">
              Email, passkey, or wallet
            </p>
          </div>
        </div>
      ) : (
        // Dashboard
        <Layout>
          <div className="space-y-6">
            {/* Welcome */}
            <div className="text-center py-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
                DASHBOARD
              </h1>
              <p className="text-gray-600 font-mono text-xs mt-1">
                {user?.email?.address || userWallet?.address?.slice(0, 10) + '...'}
              </p>
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/wallet" className="group">
                <div className="bg-gray-900 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl p-5 transition-all h-full">
                  <div className="text-3xl mb-3">💳</div>
                  <h2 className="text-lg font-bold text-cyan-400 font-mono mb-1">WALLET</h2>
                  <p className="text-gray-600 text-xs font-mono mb-3">
                    View balances, send tokens
                  </p>
                  <div className="text-cyan-400 font-mono text-xs group-hover:translate-x-1 transition-transform">
                    OPEN →
                  </div>
                </div>
              </Link>

              <Link href="/faucet" className="group">
                <div className="bg-gray-900 border border-purple-500/30 hover:border-purple-500/60 rounded-xl p-5 transition-all h-full">
                  <div className="text-3xl mb-3">🚰</div>
                  <h2 className="text-lg font-bold text-purple-400 font-mono mb-1">FAUCET</h2>
                  <p className="text-gray-600 text-xs font-mono mb-3">
                    Claim ETH for verified humans
                  </p>
                  <div className="text-purple-400 font-mono text-xs group-hover:translate-x-1 transition-transform">
                    CLAIM →
                  </div>
                </div>
              </Link>

              <Link href="/sybil" className="group">
                <div className="bg-gray-900 border border-pink-500/30 hover:border-pink-500/60 rounded-xl p-5 transition-all h-full">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h2 className="text-lg font-bold text-pink-400 font-mono mb-1">SYBIL</h2>
                  <p className="text-gray-600 text-xs font-mono mb-3">
                    Get your ZKPassport NFT
                  </p>
                  <div className="text-pink-400 font-mono text-xs group-hover:translate-x-1 transition-transform">
                    VERIFY →
                  </div>
                </div>
              </Link>
            </div>

            {/* Quick Start */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-500 font-mono mb-3">QUICK_START</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">1.</span>
                  <span className="text-gray-400">Verify with ZKPassport</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">2.</span>
                  <span className="text-gray-400">Mint soulbound NFT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-400">3.</span>
                  <span className="text-gray-400">Claim faucet ETH</span>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </div>
  );
}

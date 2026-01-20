import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../../components/shared/Layout';
import Loading from '../../components/shared/Loading';
import Navigation from '../../components/Navigation';
import SybilVerification from '../../components/sybil/SybilVerification';
import { getNetworkName, getAddressExplorerUrl, getContractAddresses } from '../../utils/contracts';

export default function SybilPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [currentChainId, setCurrentChainId] = useState(8453); // Default to Base

  const userWallet = wallets?.[0];
  const addresses = getContractAddresses(currentChainId);

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
        <div className="space-y-4">
          {/* Minimal Cypherpunk Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <h1 className="text-lg font-bold text-cyan-400 font-mono tracking-wider">
                PRIVATE_ID
              </h1>
            </div>
            <p className="text-gray-600 font-mono text-[10px] tracking-widest uppercase">
              ZK • {getNetworkName(currentChainId)} • SOULBOUND
            </p>
          </div>

          {/* Sybil Verification Component */}
          <SybilVerification
            key={currentChainId}
            chainId={currentChainId}
            onMintSuccess={() => {
              console.log('NFT minted successfully!');
            }}
          />

          {/* Compact Info Row */}
          <div className="flex gap-2 text-[10px] font-mono text-gray-600 pt-2">
            <span className="flex items-center gap-1">
              <span className="text-cyan-500">▪</span> NO_KYC
            </span>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1">
              <span className="text-purple-500">▪</span> PRIVACY_FIRST
            </span>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">▪</span> SPONSORED_GAS
            </span>
          </div>

          {/* Contract Link - Minimal */}
          <div className="text-[10px] font-mono text-gray-700 pt-1 border-t border-gray-800">
            <a
              href={getAddressExplorerUrl(currentChainId, addresses.ZKPassportNFT)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-cyan-500 transition-colors"
            >
              contract: {addresses.ZKPassportNFT.slice(0, 8)}...{addresses.ZKPassportNFT.slice(-6)}
            </a>
          </div>
        </div>
      </Layout>
    </div>
  );
}

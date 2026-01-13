import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import SybilVerification from '../components/sybil/SybilVerification';
import { getNetworkName, getAddressExplorerUrl, getContractAddresses } from '../utils/contracts';

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
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
              DIGITAL PRIVATE ID
            </h1>
            <p className="text-gray-500 font-mono text-xs mt-1">
              Zero-knowledge identity verification on {getNetworkName(currentChainId).toUpperCase()}
            </p>
          </div>

          {/* Sybil Verification Component - key forces re-render on chain change */}
          <SybilVerification 
            key={currentChainId}
            chainId={currentChainId}
            onMintSuccess={() => {
              console.log('NFT minted successfully!');
            }}
          />

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What is Sybil Resistance */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-cyan-400 font-mono mb-3">WHAT_IS_SYBIL_RESISTANCE?</h3>
              <p className="text-xs text-gray-500 font-mono leading-relaxed">
                Sybil resistance prevents one person from creating multiple accounts. 
                By verifying your identity with ZKPassport, you prove you&apos;re a unique human 
                without revealing any personal information.
              </p>
            </div>

            {/* About ZKPassport */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-purple-400 font-mono mb-3">ABOUT_ZKPASSPORT</h3>
              <p className="text-xs text-gray-500 font-mono leading-relaxed">
                ZKPassport uses zero-knowledge proofs to verify your passport&apos;s NFC chip 
                and match your face locally on your device. No data leaves your phone - 
                only cryptographic proof is shared.
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 font-mono">CONTRACTS</h3>
            <div className="grid grid-cols-1 gap-3 text-xs font-mono">
              <div>
                <span className="text-gray-600">ZKPassport NFT:</span>
                <a 
                  href={getAddressExplorerUrl(currentChainId, addresses.ZKPassportNFT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline ml-2 break-all"
                >
                  {addresses.ZKPassportNFT.slice(0, 10)}...{addresses.ZKPassportNFT.slice(-6)}
                </a>
              </div>
              <div className="text-xs text-gray-600 font-mono mt-2">
                💰 Gas fees sponsored by Privy • 🔒 Direct minting enabled
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}

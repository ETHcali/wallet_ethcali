import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../../components/shared/Layout';
import Loading from '../../components/shared/Loading';
import Navigation from '../../components/Navigation';
import SybilVerification from '../../components/sybil/SybilVerification';
import NFTCard from '../../components/sybil/NFTCard';
import { getNetworkName, getAddressExplorerUrl, getContractAddresses } from '../../utils/contracts';
import { useZKPassportNFT } from '../../hooks/useZKPassportNFT';

export default function SybilPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets: _wallets } = useWallets();
  const [currentChainId, setCurrentChainId] = useState(8453);
  const [_verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'minting' | 'minted' | 'failed' | 'rejected' | 'duplicate'>('idle');
  const [_uniqueIdentifier, setUniqueIdentifier] = useState<string | null>(null);
  const [_isOver18, setIsOver18] = useState(false);
  const [_nationality, setNationality] = useState<string | null>(null);

    const addresses = getContractAddresses(currentChainId);
  
  // Get NFT data - simple hook like swag page
  const {
    alreadyHasNFT,
    isLoading: isNFTLoading,
    tokenId,
    tokenData,
    nftMetadata,
    refreshNFTData,
  } = useZKPassportNFT(currentChainId);

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return <Loading fullScreen={true} text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen bg-surface-void">
      <Navigation 
        currentChainId={currentChainId}
        onChainChange={setCurrentChainId}
      />
      <Layout>
        <div className="space-y-4">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-eth-blue rounded-full animate-pulse"></div>
              <h1 className="text-lg font-bold text-eth-blue-text font-mono tracking-wider">
                PRIVATE_ID
              </h1>
            </div>
            <p className="text-content-faint font-mono text-[10px] tracking-widest uppercase">
              ZK • {getNetworkName(currentChainId)} • SOULBOUND
            </p>
          </div>

          {/* NFT Card Section */}
          <section className="mb-6">
            <NFTCard
              chainId={currentChainId}
              alreadyHasNFT={alreadyHasNFT}
              isLoading={isNFTLoading}
              tokenId={tokenId}
              tokenData={tokenData}
              nftMetadata={nftMetadata}
              onRefresh={refreshNFTData}
            />
          </section>

          {/* Verification Component */}
          <SybilVerification
            key={currentChainId}
            chainId={currentChainId}
            onVerificationStatusChange={(status, data) => {
              setVerificationStatus(status);
              if (data) {
                setUniqueIdentifier(data.uniqueIdentifier || null);
                setIsOver18(data.isOver18 || false);
                setNationality(data.nationality || null);
              }
            }}
            onMintSuccess={() => {
              setTimeout(() => refreshNFTData(), 2000);
            }}
          />

          {/* Info Row */}
          <div className="flex gap-2 text-[10px] font-mono text-content-faint pt-2">
            <span className="flex items-center gap-1">
              No KYC
            </span>
            <span className="text-content-faint">·</span>
            <span className="flex items-center gap-1">
              Privacy first
            </span>
            <span className="text-content-faint">·</span>
            <span className="flex items-center gap-1">
              Gas sponsored
            </span>
          </div>

          {/* Contract Link */}
          <div className="text-[10px] font-mono text-content-faint pt-1 border-t border-line-hairline">
            <a
              href={getAddressExplorerUrl(currentChainId, addresses.ZKPassportNFT)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-faint hover:text-eth-blue-text transition-colors"
            >
              contract: {addresses.ZKPassportNFT.slice(0, 8)}...{addresses.ZKPassportNFT.slice(-6)}
            </a>
          </div>
        </div>
      </Layout>
    </div>
  );
}

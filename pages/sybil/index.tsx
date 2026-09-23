import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../../components/shared/Layout';
import Loading from '../../components/shared/Loading';
import Navigation from '../../components/Navigation';
import ChainPicker from '../../components/shared/ChainPicker';
import SybilVerification from '../../components/sybil/SybilVerification';
import NFTCard from '../../components/sybil/NFTCard';
import { explorerAddress } from '../../config/chains';
import { useChainQuery } from '../../hooks/useChainQuery';
import { useZKPassportNFT } from '../../hooks/useZKPassportNFT';

export default function SybilPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  // Identity owns its chain: picked from the chains ZKPassportNFT is deployed
  // on, remembered in `?chain=`; the wallet moves only when the mint is signed.
  const { chainId, chain, chains, setChainId } = useChainQuery('identity');
  const zkpassport = chain.contracts.ZKPassportNFT;

  // Get NFT data - simple hook like swag page
  const {
    alreadyHasNFT,
    isLoading: isNFTLoading,
    tokenId,
    tokenData,
    nftMetadata,
    refreshNFTData,
  } = useZKPassportNFT(chainId);

  // Redirect if not authenticated
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

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return <Loading fullScreen={true} text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen bg-surface-void">
      <Navigation />
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
              ZK • {chain.name} • SOULBOUND
            </p>
          </div>

          <ChainPicker chains={chains} value={chainId} onChange={setChainId} />

          {/* NFT Card Section */}
          <section className="mb-6">
            <NFTCard
              chainId={chainId}
              alreadyHasNFT={alreadyHasNFT}
              isLoading={isNFTLoading}
              tokenId={tokenId}
              tokenData={tokenData}
              nftMetadata={nftMetadata}
              onRefresh={refreshNFTData}
            />
          </section>

          {/* Verification Component — remounts per chain so a proof never crosses chains */}
          <SybilVerification
            key={chainId}
            chainId={chainId}
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
          {zkpassport && (
            <div className="text-[10px] font-mono text-content-faint pt-1 border-t border-line-hairline">
              <a
                href={explorerAddress(chainId, zkpassport)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-content-faint hover:text-eth-blue-text transition-colors"
              >
                contract: {zkpassport.slice(0, 8)}…{zkpassport.slice(-6)}
              </a>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../../components/shared/Layout';
import Loading from '../../components/shared/Loading';
import Navigation from '../../components/Navigation';
import SybilVerification from '../../components/sybil/SybilVerification';
import VerifiedState from '../../components/sybil/VerifiedState';
import ENSSection from '../../components/ens/ENSSection';
import { DEFAULT_CHAIN } from '../../config/chains';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useZKPassportNFT } from '../../hooks/useZKPassportNFT';

/** Identity lives on Ethereum; the wallet moves only when the mint is signed. */
const chainId = DEFAULT_CHAIN.id;

/**
 * Stands in for the verification flow until the NFT check has answered.
 * Static blocks, no shimmer. The start flow must never flash first: a verified
 * wallet that saw "START →" for a second would reasonably tap it and be met
 * with a duplicate revert.
 */
function FlowSkeleton() {
  return (
    <div className="space-y-3 rounded-card border border-line-hairline bg-surface-slab p-5" aria-busy="true">
      <div className="h-3 w-28 rounded-chip bg-surface-inset" />
      <div className="h-16 rounded-chip bg-surface-inset" />
      <div className="h-12 rounded-chip bg-surface-inset" />
    </div>
  );
}

export default function SybilPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { address } = useActiveWallet();

  const {
    alreadyHasNFT,
    isFetched,
    isFetching,
    tokenId,
    tokenData,
    mintedAt,
    nftMetadata,
    refreshNFTData,
  } = useZKPassportNFT(chainId);

  // Until the wallet exists and its first read has answered, we do not know
  // which of the two pages to show — so neither is shown.
  const checking = !address || (!isFetched && !alreadyHasNFT);

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
        <div className="mx-auto max-w-xl space-y-5 md:space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-content-primary">Identity</h1>
            <p className="mb-0 mt-1 text-sm text-content-muted">
              A private proof that you are one person, and a name people can send to.
            </p>
          </header>

          {/* Three states, one at a time: still checking, already verified, or
              not yet. The start flow only mounts for a wallet with no NFT here. */}
          {checking ? (
            <FlowSkeleton />
          ) : alreadyHasNFT ? (
            <VerifiedState
              mintedAt={mintedAt}
              tokenId={tokenId}
              tokenData={tokenData}
              nftMetadata={nftMetadata}
              refreshing={isFetching}
              onRefresh={() => void refreshNFTData()}
            />
          ) : (
            <SybilVerification
              chainId={chainId}
              onMintSuccess={() => {
                setTimeout(() => refreshNFTData(), 2000);
              }}
            />
          )}

          {/* The ethcali.eth name — the other half of identity. The registrar is
              on Base, the one exception to Ethereum-only; ENSSection switches
              the wallet there right before signing. */}
          {address && <ENSSection userAddress={address} />}
        </div>
      </Layout>
    </div>
  );
}

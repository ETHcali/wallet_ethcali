import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import FaucetClaim from '../components/faucet/FaucetClaim';
import { DEFAULT_CHAIN, explorerAddress } from '../config/chains';
import { logger } from '../utils/logger';

/** The faucet reads from Ethereum; the wallet is only moved when a claim is signed. */
const chainId = DEFAULT_CHAIN.id;

export default function FaucetPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const faucetManager = DEFAULT_CHAIN.contracts.FaucetManager;

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
          {/* Minimal Cypherpunk Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-content-primary">Faucet</h1>
            </div>
            <p className="text-content-faint font-mono text-[10px] tracking-widest uppercase">
              ETH • Sybil gated
            </p>
          </div>

          <FaucetClaim
            chainId={chainId}
            onClaimSuccess={() => {
              logger.info('Faucet claim successful');
            }}
          />

          {/* Compact Info Row */}
          <div className="flex gap-2 text-[10px] font-mono text-content-faint pt-2">
            <span className="flex items-center gap-1">
              Verified only
            </span>
            <span className="text-content-faint">·</span>
            <span className="flex items-center gap-1">
              One claim
            </span>
            <span className="text-content-faint">·</span>
            <span className="flex items-center gap-1">
              Gas sponsored
            </span>
          </div>

          {/* Contract Link - Minimal */}
          {faucetManager && (
            <div className="text-[10px] font-mono text-content-faint pt-1 border-t border-line-hairline">
              <a
                href={explorerAddress(chainId, faucetManager)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-content-faint hover:text-eth-blue-text transition-colors"
              >
                contract: {faucetManager.slice(0, 8)}…{faucetManager.slice(-6)}
              </a>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

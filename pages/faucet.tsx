import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import FaucetClaim from '../components/faucet/FaucetClaim';
import { DEFAULT_CHAIN } from '../config/chains';
import { logger } from '../utils/logger';

/** The faucet reads from Ethereum; the wallet is only moved when a claim is signed. */
const chainId = DEFAULT_CHAIN.id;

export default function FaucetPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

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
            <h1 className="text-2xl font-bold text-content-primary">Faucet</h1>
            <p className="mb-0 mt-1 text-sm text-content-muted">
              A little ETH for gas, for verified people. One claim per vault; the transaction is sponsored.
            </p>
          </header>

          <FaucetClaim
            chainId={chainId}
            onClaimSuccess={() => {
              logger.info('Faucet claim successful');
            }}
          />
        </div>
      </Layout>
    </div>
  );
}

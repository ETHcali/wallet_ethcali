import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import FaucetClaim from '../components/faucet/FaucetClaim';
import { getNetworkName, getContractAddresses, getAddressExplorerUrl } from '../utils/contracts';
import { logger } from '../utils/logger';

export default function FaucetPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets: _wallets } = useWallets();
  const [currentChainId, setCurrentChainId] = useState(8453);

  const addresses = getContractAddresses(currentChainId);

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
          {/* Minimal Cypherpunk Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-content-primary">Faucet</h1>
            </div>
            <p className="text-content-faint font-mono text-[10px] tracking-widest uppercase">
              ETH • {getNetworkName(currentChainId)} • Sybil gated
            </p>
          </div>

          {/* Faucet Claim Component */}
          <FaucetClaim
            key={`claim-${currentChainId}`}
            chainId={currentChainId}
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
          <div className="text-[10px] font-mono text-content-faint pt-1 border-t border-line-hairline">
            <a
              href={getAddressExplorerUrl(currentChainId, addresses.FaucetManager)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-faint hover:text-eth-blue-text transition-colors"
            >
              contract: {addresses.FaucetManager.slice(0, 8)}...{addresses.FaucetManager.slice(-6)}
            </a>
          </div>
        </div>
      </Layout>
    </div>
  );
}

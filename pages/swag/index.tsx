import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import { ProductCard } from '../../components/swag/ProductCard';
import { useActiveTokenIds } from '../../hooks/useSwagStore';
import { useSwagAddresses } from '../../utils/network';

export default function SwagStorePage() {
  const queryClient = useQueryClient();
  const { tokenIds, isLoading, error, refetch } = useActiveTokenIds();
  const { chainId, swag1155 } = useSwagAddresses();
  const prevChainId = useRef(chainId);

  // Invalidate all swag queries when chain changes
  useEffect(() => {
    if (prevChainId.current !== chainId) {
      // Clear all swag-related queries from cache
      queryClient.removeQueries({ queryKey: ['swag-token-ids'] });
      queryClient.removeQueries({ queryKey: ['swag-variant-state'] });
      queryClient.removeQueries({ queryKey: ['swag-variant-uri'] });
      queryClient.removeQueries({ queryKey: ['swag-metadata'] });
      prevChainId.current = chainId;
    }
  }, [chainId, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-black">
      <Navigation currentChainId={chainId} />
      <Layout>

        {isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center text-slate-400">
            Syncing on-chain catalog...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center">
            <p className="text-red-300 mb-2">Error loading products: {error}</p>
            <button 
              onClick={() => refetch()}
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && tokenIds.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
            No active variants found. Ask the merch team to publish a drop.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tokenIds.map((tokenId) => (
            <ProductCard key={tokenId.toString()} tokenId={tokenId} />
          ))}
        </div>
      </Layout>
    </div>
  );
}

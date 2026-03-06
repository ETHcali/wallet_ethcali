import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import { ProductCard } from '../../components/swag/ProductCard';
import { useSwagAddresses } from '../../utils/network';

export default function SwagStorePage() {
  const queryClient = useQueryClient();
  const { chainId, swag1155 } = useSwagAddresses();

  const designAddresses = swag1155 ? [swag1155] : [];

  // Flush per-token caches whenever the user switches chains
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ['swag-grouped-products'] });
    queryClient.removeQueries({ queryKey: ['swag-token-ids'] });
    queryClient.removeQueries({ queryKey: ['swag-variant'] });
    queryClient.removeQueries({ queryKey: ['swag-variant-remaining'] });
    queryClient.removeQueries({ queryKey: ['swag-discounted-price'] });
  }, [chainId, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <Navigation currentChainId={chainId} />
      <Layout>
        {/* ── Page header ── */}
        <div className="mb-10">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-500">
            Official Merchandise
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            ETH CALI Swag Store
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Pay with USDC · Connect your wallet to see personalised pricing
          </p>
        </div>

        {/* ── Empty state – no contract on this chain ── */}
        {designAddresses.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
              <svg
                className="h-10 w-10 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="mb-2 text-lg font-medium text-slate-300">
              No Swag Contract Deployed
            </p>
            <p className="text-sm text-slate-500">
              No Swag1155 contract is configured for the selected network (Chain
              ID: {chainId}).
            </p>
          </div>
        )}

        {/* ── Product grid ── */}
        {designAddresses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {designAddresses.map(designAddress => (
              <ProductCard
                key={designAddress}
                designAddress={designAddress}
                chainId={chainId}
              />
            ))}
          </div>
        )}
      </Layout>
    </div>
  );
}

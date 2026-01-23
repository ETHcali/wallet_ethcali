import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import { ProductCard } from '../../components/swag/ProductCard';
import { useSwagAddresses } from '../../utils/network';

export default function SwagStorePage() {
  const queryClient = useQueryClient();
  const { chainId, swag1155 } = useSwagAddresses();

  // Direct: Use the swag1155 address from the selected chain
  // Show whatever is deployed in that contract, no filtering
  const designAddresses = swag1155 ? [swag1155] : [];

  // Invalidate queries when chain changes to refresh data
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ['design-info'] });
    queryClient.removeQueries({ queryKey: ['design-discount-config'] });
    queryClient.removeQueries({ queryKey: ['design-remaining-supply'] });
    queryClient.removeQueries({ queryKey: ['design-price-with-discounts'] });
  }, [chainId, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <Navigation currentChainId={chainId} />
      <Layout>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">ETH CALI Swag Store</h1>
          <p className="text-slate-400 text-sm">Official merchandise - Pay with USDC</p>
        </div>

        {/* Empty State - No Contract Deployed */}
        {designAddresses.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="font-medium text-slate-300 mb-2 text-lg">No Swag Contract Deployed</p>
            <p className="text-sm text-slate-500">No Swag1155 contract is configured for the selected network (Chain ID: {chainId}).</p>
          </div>
        )}

        {/* Designs Grid - Show ALL designs from contract, no filtering */}
        {designAddresses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {designAddresses.map((designAddress) => (
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

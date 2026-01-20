import { useEffect, useRef, useMemo } from 'react';
import { useQueryClient, useQueries } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import { ProductGroup } from '../../components/swag/ProductGroup';
import { useActiveTokenIds } from '../../hooks/useSwagStore';
import { useSwagAddresses } from '../../utils/network';
import { getChainRpc } from '../../config/networks';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';

// Fetch metadata for a token
async function fetchTokenMetadata(swag1155: string, chainId: number, tokenId: bigint) {
  const rpcUrl = getChainRpc(chainId);
  const client = createPublicClient({ transport: http(rpcUrl) });

  const uri = await (client.readContract as any)({
    address: swag1155 as `0x${string}`,
    abi: Swag1155ABI as any,
    functionName: 'uri',
    args: [tokenId],
  }) as string;

  const gatewayUrl = getIPFSGatewayUrl(uri);
  if (!gatewayUrl) return null;

  const response = await fetch(gatewayUrl);
  if (!response.ok) return null;

  const metadata = await response.json();
  return { tokenId, metadata };
}

// Group tokens by product name (removing size suffix)
function groupTokensByProduct(
  tokenIds: bigint[],
  metadataMap: Map<string, { name: string; baseName: string }>
): Map<string, bigint[]> {
  const groups = new Map<string, bigint[]>();

  for (const tokenId of tokenIds) {
    const data = metadataMap.get(tokenId.toString());
    if (!data) continue;

    const baseName = data.baseName;
    const existing = groups.get(baseName) || [];
    existing.push(tokenId);
    groups.set(baseName, existing);
  }

  return groups;
}

// Extract base product name (remove size indicators like "- S", "- M", "- L", etc.)
function getBaseProductName(name: string): string {
  // Remove common size suffixes
  return name
    .replace(/\s*[-–]\s*(XS|S|M|L|XL|XXL|XXXL|One Size|NA)\s*$/i, '')
    .replace(/\s*\((XS|S|M|L|XL|XXL|XXXL|One Size|NA)\)\s*$/i, '')
    .replace(/\s+(XS|S|M|L|XL|XXL|XXXL)$/i, '')
    .trim();
}

export default function SwagStorePage() {
  const queryClient = useQueryClient();
  const { tokenIds, isLoading, error, refetch } = useActiveTokenIds();
  const { chainId, swag1155 } = useSwagAddresses();
  const prevChainId = useRef(chainId);

  // Invalidate all swag queries when chain changes
  useEffect(() => {
    if (prevChainId.current !== chainId) {
      queryClient.removeQueries({ queryKey: ['swag-token-ids'] });
      queryClient.removeQueries({ queryKey: ['swag-variant-state'] });
      queryClient.removeQueries({ queryKey: ['swag-variant-uri'] });
      queryClient.removeQueries({ queryKey: ['swag-metadata'] });
      queryClient.removeQueries({ queryKey: ['swag-group-metadata'] });
      prevChainId.current = chainId;
    }
  }, [chainId, queryClient]);

  // Fetch metadata for all tokens to group them
  const metadataQueries = useQueries({
    queries: tokenIds.map((tokenId) => ({
      queryKey: ['swag-group-metadata', swag1155, chainId, tokenId.toString()],
      queryFn: () => fetchTokenMetadata(swag1155!, chainId!, tokenId),
      enabled: Boolean(swag1155 && chainId),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const isMetadataLoading = metadataQueries.some((q) => q.isLoading);

  // Build metadata map and groups
  const { metadataMap, productGroups } = useMemo(() => {
    const map = new Map<string, { name: string; baseName: string }>();

    for (const query of metadataQueries) {
      if (query.data?.metadata?.name) {
        const name = query.data.metadata.name;
        const baseName = getBaseProductName(name);
        map.set(query.data.tokenId.toString(), { name, baseName });
      }
    }

    const groups = groupTokensByProduct(tokenIds, map);
    return { metadataMap: map, productGroups: groups };
  }, [metadataQueries, tokenIds]);

  const groupEntries = Array.from(productGroups.entries());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-black">
      <Navigation currentChainId={chainId} />
      <Layout>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">ETH CALI Swag</h1>
          <p className="text-slate-400 text-sm mt-1">Official merch - pay with USDC</p>
        </div>

        {/* Loading State */}
        {(isLoading || isMetadataLoading) && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 animate-pulse">
                <div className="aspect-square w-full bg-slate-800 rounded-xl mb-4" />
                <div className="h-6 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
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

        {/* Empty State */}
        {!isLoading && !isMetadataLoading && tokenIds.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="font-medium text-slate-300 mb-1">No products available</p>
            <p className="text-sm">Ask the merch team to publish a drop.</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isMetadataLoading && tokenIds.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupEntries.map(([productName, groupTokenIds]) => (
              <ProductGroup
                key={productName}
                tokenIds={groupTokenIds}
                productName={productName}
              />
            ))}
          </div>
        )}

        {/* Product Count */}
        {!isLoading && !isMetadataLoading && tokenIds.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-500">
            {groupEntries.length} products • {tokenIds.length} total variants
          </div>
        )}
      </Layout>
    </div>
  );
}

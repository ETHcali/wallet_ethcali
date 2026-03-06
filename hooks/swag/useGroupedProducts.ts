/**
 * useGroupedProducts
 *
 * Fetches all token IDs from a Swag1155 contract, resolves their on-chain
 * URIs, downloads the IPFS metadata for each token, and then groups the
 * results by the "Product" metadata attribute (falling back to a cleaned-up
 * version of the token name).
 *
 * Sizes within each group are sorted in standard apparel order:
 * XS → S → M → L → XL → XXL → 2XL → XXXL → One Size → NA
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { getChainRpc } from '../../config/networks';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import type { Swag1155Metadata } from '../../types/swag';

// ─── Public types ────────────────────────────────────────────────────────────

export interface VariantSize {
  /** The ERC-1155 token ID for this size variant. */
  tokenId: number;
  /** Human-readable size label (e.g. "S", "M", "XL", "One Size"). */
  size: string;
}

export interface ProductGroup {
  /** Stable React key – equals the "Product" attribute value or base name. */
  groupKey: string;
  /** Display name shown on the card. */
  productName: string;
  description: string;
  /** Raw IPFS URI (ipfs://…). Resolve with getIPFSGatewayUrl before use. */
  imageUri: string;
  /** All metadata attributes EXCEPT the "Size" trait. */
  baseAttributes: Array<{ trait_type: string; value: string }>;
  /** Sorted size variants for this product. */
  sizes: VariantSize[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SIZE_ORDER = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', 'ONE SIZE', 'NA',
];

// Regex to strip trailing size labels from token names (e.g. "T-Shirt - M" → "T-Shirt")
const TRAILING_SIZE_RE =
  /\s*[-–]\s*(?:XS|S|M|L|XL|XXL|2XL|One\s?Size|NA)\s*$/i;

function sortSizes(sizes: VariantSize[]): VariantSize[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.size.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.size.toUpperCase());
    if (ai === -1 && bi === -1) return a.size.localeCompare(b.size);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

async function fetchMetadata(uri: string): Promise<Swag1155Metadata | null> {
  try {
    const url = getIPFSGatewayUrl(uri) || uri;
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as Swag1155Metadata;
  } catch {
    return null;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGroupedProducts(contractAddress: string, chainId: number) {
  const query = useQuery({
    queryKey: ['swag-grouped-products', contractAddress, chainId],
    queryFn: async (): Promise<ProductGroup[]> => {
      if (!contractAddress || !chainId) return [];

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({ transport: http(rpcUrl) });

      // 1. Fetch all token IDs
      const tokenIdsResult = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: Swag1155ABI as any,
        functionName: 'listTokenIds',
        args: [],
      });
      const tokenIds = (tokenIdsResult as bigint[]).map(id => Number(id));
      if (tokenIds.length === 0) return [];

      // 2. Fetch on-chain URIs in parallel
      const uriResults = await Promise.all(
        tokenIds.map(async tokenId => {
          const uri = await client.readContract({
            address: contractAddress as `0x${string}`,
            abi: Swag1155ABI as any,
            functionName: 'uri',
            args: [BigInt(tokenId)],
          });
          return { tokenId, uri: String(uri) };
        }),
      );

      // 3. Fetch IPFS metadata in parallel
      const metaResults = await Promise.all(
        uriResults.map(async ({ tokenId, uri }) => ({
          tokenId,
          metadata: await fetchMetadata(uri),
        })),
      );

      // 4. Group tokens by "Product" attribute (or cleaned-up name)
      const groupMap = new Map<string, ProductGroup>();

      for (const { tokenId, metadata } of metaResults) {
        if (!metadata) continue;

        const productAttr = metadata.attributes?.find(
          a => a.trait_type === 'Product',
        );
        const sizeAttr = metadata.attributes?.find(
          a => a.trait_type === 'Size',
        );
        const baseAttrs = (metadata.attributes || []).filter(
          a => a.trait_type !== 'Size',
        );

        const groupKey =
          productAttr?.value ||
          metadata.name.replace(TRAILING_SIZE_RE, '').trim() ||
          metadata.name;

        const displayName =
          productAttr?.value ||
          metadata.name.replace(TRAILING_SIZE_RE, '').trim() ||
          metadata.name;

        const size = sizeAttr?.value || 'NA';

        if (groupMap.has(groupKey)) {
          groupMap.get(groupKey)!.sizes.push({ tokenId, size });
        } else {
          groupMap.set(groupKey, {
            groupKey,
            productName: displayName,
            description: metadata.description || '',
            imageUri: metadata.image || '',
            baseAttributes: baseAttrs,
            sizes: [{ tokenId, size }],
          });
        }
      }

      // 5. Sort sizes in natural apparel order
      for (const group of groupMap.values()) {
        group.sizes = sortSizes(group.sizes);
      }

      return Array.from(groupMap.values());
    },
    enabled: Boolean(contractAddress && chainId),
    staleTime: 1000 * 60, // 1 minute
    retry: 2,
  });

  return {
    groups: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

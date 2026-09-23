/**
 * The catalogue: every active design, joined with its Base variant and its
 * Shopify variants. One anon Supabase read, cached for a minute.
 *
 * Supabase is presentation here — names, photos, list price, the card-channel
 * ids. Stock and the price the contract actually charges come from the chain
 * (useSwagOnchain); nothing in this row is authoritative for money.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { CHAIN_IDS, SWAG_SHOPIFY_STORE } from '../../config/constants';
import type {
  SwagChainVariant,
  SwagProduct,
  SwagShopifyVariant,
  SwagSize,
} from '../../types/swag';
import { swagKeys } from './client';

const SIZE_ORDER: SwagSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Photos live in the site's public/ folder; the row stores the path under it. */
export function productImageUrl(product: SwagProduct): string | null {
  return product.image_path ? `https://ethcali.org/${product.image_path.replace(/^\/+/, '')}` : null;
}

/**
 * Shopify's cart permalink takes the numeric variant id; the row stores the
 * GID (gid://shopify/ProductVariant/123), so take the numeric tail.
 */
export function shopifyCartUrl(variant: SwagShopifyVariant, quantity = 1): string {
  const numeric = variant.shopify_variant_id.split('/').pop() ?? variant.shopify_variant_id;
  return `https://${SWAG_SHOPIFY_STORE}/cart/${numeric}:${quantity}`;
}

/** The Shopify variant for a size (or the only one, for an unsized design). */
export function shopifyVariantFor(product: SwagProduct, size: SwagSize | null): SwagShopifyVariant | null {
  if (product.shopify.length === 0) return null;
  if (!product.sized) return product.shopify[0] ?? null;
  return product.shopify.find((v) => v.size === size) ?? null;
}

const SELECT = [
  'id, sku, category, name_es, name_en, description_es, description_en',
  'image_path, image_cid, metadata_cid, price_usd, sized, sizes',
  'shopify_product_id, shopify_handle, sort_order, active',
  'variants:swag_variants(id, chain_id, token_id, collection_address, status)',
  'shopify:swag_shopify_variants(id, shopify_variant_id, sku, size, price_cop)',
].join(', ');

/** The row as PostgREST returns it: numerics may arrive as strings. */
interface CatalogueRow extends Omit<SwagProduct, 'price_usd' | 'variant' | 'shopify' | 'sizes'> {
  price_usd: number | string;
  sizes: string[] | null;
  variants: SwagChainVariant[] | null;
  shopify: Array<Omit<SwagShopifyVariant, 'price_cop'> & { price_cop: number | string | null }> | null;
}

function toProduct(row: CatalogueRow): SwagProduct {
  const variant =
    row.variants?.find((v) => v.chain_id === CHAIN_IDS.BASE && v.status === 'live') ?? null;

  const shopify: SwagShopifyVariant[] = (row.shopify ?? [])
    .map((s) => ({ ...s, price_cop: s.price_cop === null ? null : Number(s.price_cop) }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.size ?? 'XS') - SIZE_ORDER.indexOf(b.size ?? 'XS'));

  return {
    ...row,
    price_usd: Number(row.price_usd),
    sizes: (row.sizes ?? []) as SwagSize[],
    variant,
    shopify,
  };
}

async function fetchCatalogue(): Promise<SwagProduct[]> {
  if (!supabase) throw new Error('The catalogue is not configured on this deployment.');

  // No embedded filter on chain_id: RLS already restricts swag_variants to
  // status = 'live', and toProduct() picks the Base row. One fewer PostgREST
  // feature to depend on for a payload that is 17 rows either way.
  const { data, error } = await supabase
    .from('swag_products')
    .select(SELECT)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as CatalogueRow[]).map(toProduct);
}

export function useSwagCatalogue() {
  const query = useQuery({
    queryKey: swagKeys.catalogue,
    queryFn: fetchCatalogue,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const products = useMemo(() => query.data ?? [], [query.data]);

  /** Token ids of the designs that are live on Base, in catalogue order. */
  const tokenIds = useMemo(
    () => products.flatMap((p) => (p.variant ? [p.variant.token_id] : [])),
    [products]
  );

  const byTokenId = useMemo(() => {
    const map = new Map<number, SwagProduct>();
    for (const p of products) if (p.variant) map.set(p.variant.token_id, p);
    return map;
  }, [products]);

  return {
    products,
    tokenIds,
    byTokenId,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

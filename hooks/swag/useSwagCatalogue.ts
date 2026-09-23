/**
 * The catalogue: every active design, joined with its on-chain variant on the
 * collection's chain and its Shopify variants. One anon Supabase read, cached for a minute.
 *
 * Supabase is presentation here — names, photos, list price, the card-channel
 * ids. Stock and the price the contract actually charges come from the chain
 * (useSwagOnchain); nothing in this row is authoritative for money.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { SWAG_SHOPIFY_STORE } from '../../config/constants';
import type {
  SwagChainVariant,
  SwagProduct,
  SwagShopifyVariant,
  SwagSize,
} from '../../types/swag';
import { SWAG, swagKeys } from './client';

const SIZE_ORDER: SwagSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Photos live in the site's public/ folder; the row stores the path under it. */
export function productImageUrl(product: SwagProduct): string | null {
  return product.image_path ? `https://www.ethcali.org/${product.image_path.replace(/^\/+/, '')}` : null;
}

/** The website's product page: the canonical URL and where the OG image is served from. */
export const SWAG_SITE_ORIGIN = 'https://www.ethcali.org';

export function siteProductUrl(product: SwagProduct): string {
  return `${SWAG_SITE_ORIGIN}/swag/${product.sku.toLowerCase()}`;
}

/** Absolute photo URL for Open Graph, on the www host the site publishes under. */
export function productOgImageUrl(product: Pick<SwagProduct, 'image_path'>): string | null {
  return product.image_path ? `${SWAG_SITE_ORIGIN}/${product.image_path.replace(/^\/+/, '')}` : null;
}

/** The app's own route for a design: the checkout surface behind the site page. */
export function appProductPath(product: SwagProduct): string {
  return `/swag/${product.sku.toLowerCase()}`;
}

/** Per-query UTM parameters, as an attribution-preserving bag for outbound links. */
export type UtmParams = Record<string, string>;

/** Only the utm_* keys of a router query, first value each, non-empty. */
export function utmFromQuery(query: Record<string, string | string[] | undefined>): UtmParams {
  const utm: UtmParams = {};
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith('utm_')) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first) utm[key] = first;
  }
  return utm;
}

/** Appends the campaign parameters to an outbound URL so the ad that brought the buyer is credited at checkout. */
export function withUtm(url: string, utm: UtmParams): string {
  const entries = Object.entries(utm);
  if (entries.length === 0) return url;
  const u = new URL(url);
  for (const [key, value] of entries) u.searchParams.set(key, value);
  return u.toString();
}

/**
 * The USDC discount as the two prices imply it, in whole percent. Null when
 * either price is missing or USDC is not cheaper — a "−0 %" is not a discount.
 */
export function usdcDiscountPct(listUsd: number, usdcUsd: number | null): number | null {
  if (usdcUsd === null || !(listUsd > 0) || !(usdcUsd > 0) || usdcUsd >= listUsd) return null;
  const pct = Math.round((1 - usdcUsd / listUsd) * 100);
  return pct > 0 ? pct : null;
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
  'image_path, image_cid, metadata_cid, price_usd, price_usdc, sized, sizes',
  'shopify_product_id, shopify_handle, sort_order, active',
  'variants:swag_variants(id, chain_id, token_id, collection_address, status)',
  'shopify:swag_shopify_variants(id, shopify_variant_id, sku, size, price_cop)',
].join(', ');

/** The row as PostgREST returns it: numerics may arrive as strings. */
interface CatalogueRow
  extends Omit<SwagProduct, 'price_usd' | 'price_usdc' | 'variant' | 'shopify' | 'sizes'> {
  price_usd: number | string;
  price_usdc: number | string | null;
  sizes: string[] | null;
  variants: SwagChainVariant[] | null;
  shopify: Array<Omit<SwagShopifyVariant, 'price_cop'> & { price_cop: number | string | null }> | null;
}

function toProduct(row: CatalogueRow): SwagProduct {
  const variant =
    row.variants?.find(
      (v) =>
        v.chain_id === SWAG.chainId &&
        v.status === 'live' &&
        v.collection_address?.toLowerCase() === SWAG.address.toLowerCase()
    ) ?? null;

  const shopify: SwagShopifyVariant[] = (row.shopify ?? [])
    .map((s) => ({ ...s, price_cop: s.price_cop === null ? null : Number(s.price_cop) }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.size ?? 'XS') - SIZE_ORDER.indexOf(b.size ?? 'XS'));

  return {
    ...row,
    price_usd: Number(row.price_usd),
    price_usdc: row.price_usdc === null || row.price_usdc === undefined ? null : Number(row.price_usdc),
    sizes: (row.sizes ?? []) as SwagSize[],
    variant,
    shopify,
  };
}

async function fetchCatalogue(): Promise<SwagProduct[]> {
  if (!supabase) throw new Error('The catalogue is not configured on this deployment.');

  // No embedded filter on chain_id: RLS already restricts swag_variants to
  // status = 'live', and toProduct() picks the row for the live collection on
  // its chain — the retired Base rows are also 'live' in the table and must
  // not win. One fewer PostgREST feature to depend on for a payload that is a
  // few dozen rows either way.
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

  /** Token ids of the designs that are live on the collection, in catalogue order. */
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

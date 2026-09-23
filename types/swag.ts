import type { SwagOrderView } from './swag-orders';
/**
 * Swag store types.
 *
 * One tokenId = one design. Size is a Shopify variant option and an order
 * field, never an on-chain attribute: the NFT proves the design, the
 * fulfilment record says the size.
 */

export type SwagCategory = 'Cap' | 'Mug' | 'Hoodie' | 'T-shirt';

export type SwagSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

/** Artwork pipeline state of a design on a chain (public.swag_variants.status). */
export type SwagVariantStatus = 'draft' | 'artwork_ready' | 'pinned' | 'live';

/** public.swag_variants — the design on one chain. */
export interface SwagChainVariant {
  id: number;
  chain_id: number;
  token_id: number;
  /** Lowercase hex address of the Swag1155 clone; null until deployed. */
  collection_address: string | null;
  status: SwagVariantStatus;
}

/** public.swag_shopify_variants — the card channel's handle on a design. */
export interface SwagShopifyVariant {
  id: number;
  /** GID, e.g. gid://shopify/ProductVariant/46749005971642. */
  shopify_variant_id: string;
  sku: string;
  size: SwagSize | null;
  /** Last COP price pushed to Shopify. A cache, never the price of record. */
  price_cop: number | null;
}

/** public.swag_products joined with its variant on the live collection and its Shopify variants. */
export interface SwagProduct {
  id: number;
  sku: string;
  category: SwagCategory;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  /** Path under the site's public/, e.g. 'swags/cap-pepe.png'. */
  image_path: string | null;
  image_cid: string | null;
  metadata_cid: string | null;
  /** List price, what the card channel charges. */
  price_usd: number;
  /**
   * The discounted USDC price (price_usd × 0.9), mirrored from the chain so the
   * catalogue can show it before the RPC answers. Null until synced; the
   * contract's getTokenPrice() is what a buyer actually pays.
   */
  price_usdc: number | null;
  sized: boolean;
  sizes: SwagSize[];
  shopify_product_id: string | null;
  shopify_handle: string | null;
  sort_order: number;
  active: boolean;
  /** The live variant on the collection's chain, or null when the design is not on chain yet. */
  variant: SwagChainVariant | null;
  shopify: SwagShopifyVariant[];
}

// ── Orders (public.swag_orders, written server-side only) ───────────────────

export type SwagOrderChannel = 'onchain' | 'shopify' | 'event';

export type SwagOrderStatus = 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface SwagShipping {
  name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  /** ISO 3166-1 alpha-2, defaults to CO. */
  country: string;
  notes?: string;
}

/** The EIP-712 ClaimVoucher the signer issues for a Shopify or event order. */
export interface SwagClaimVoucher {
  tokenId: string;
  to: string;
  quantity: string;
  orderRef: string;
  deadline: string;
  signature: string;
}

/**
 * What GET /api/swag/orders returns: the API's PII-free view, not the
 * swag_orders row. Address, email and the signed voucher never reach the
 * browser list; the claim page fetches its voucher per order on demand.
 */
export type SwagOrder = SwagOrderView;

/** What POST /api/swag/orders takes after a confirmed on-chain buy. */
export interface CreateSwagOrderInput {
  txHash: string;
  shipping: SwagShipping;
  size: SwagSize | null;
  quantity: number;
}

// ── NFT metadata (what the pin route writes to IPFS) ────────────────────────

export interface Swag1155MetadataAttribute {
  trait_type: 'Product' | 'Color' | 'Gender' | 'Style' | 'Size';
  value: string;
}

export interface Swag1155Metadata {
  name: string;
  description: string;
  image: string;
  attributes?: Swag1155MetadataAttribute[];
}

/**
 * Swag orders — the shapes shared by the API routes, the server helpers and
 * the claim page. Mirrors supabase/migrations/20260923100000_swag_orders.sql.
 *
 * bigint-valued fields cross the wire as decimal strings: JSON has no bigint,
 * and a uint256 deadline or tokenId must round-trip byte-exact into the
 * EIP-712 struct the contract hashes.
 */

export type SwagOrderChannel = 'onchain' | 'shopify' | 'event';
export type SwagOrderStatus = 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type SwagSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const SWAG_SIZES: readonly SwagSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** What the warehouse needs. country is ISO 3166-1 alpha-2, uppercase. */
export interface SwagShipping {
  name: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  region?: string;
  country: string;
  notes?: string;
}

/** The EIP-712 `Claim` struct as the contract hashes it, JSON-safe. */
export interface ClaimVoucherFields {
  tokenId: string;
  to: `0x${string}`;
  quantity: string;
  orderRef: `0x${string}`;
  /** Unix seconds. */
  deadline: string;
}

/** swag_orders.voucher once issued. */
export interface StoredVoucher {
  voucher: ClaimVoucherFields;
  signature: `0x${string}`;
  issuedAt: string;
}

/** A swag_orders row as the service-role client returns it. */
export interface SwagOrderRow {
  id: number;
  channel: SwagOrderChannel;
  product_id: number;
  variant_id: number;
  quantity: number;
  size: SwagSize | null;
  buyer_wallet: string | null;
  buyer_email: string | null;
  shipping: SwagShipping | Record<string, never>;
  status: SwagOrderStatus;
  tx_hash: string | null;
  shopify_order_id: string | null;
  shopify_line_item_id: string | null;
  order_ref: `0x${string}`;
  voucher: StoredVoucher | null;
  claim_tx_hash: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** What GET /api/swag/orders returns per row: the row minus PII, plus the design. */
export interface SwagOrderView {
  id: number;
  channel: SwagOrderChannel;
  status: SwagOrderStatus;
  quantity: number;
  size: SwagSize | null;
  createdAt: string;
  txHash: string | null;
  claimTxHash: string | null;
  /** A voucher has been issued and is stored on the row. */
  voucherIssued: boolean;
  /** shopify, paid, and not yet claimed on chain. */
  claimable: boolean;
  tokenId: number;
  product: {
    sku: string;
    nameEs: string;
    nameEn: string;
    imagePath: string | null;
  };
}

export interface SwagOrdersResponse {
  orders: SwagOrderView[];
}

/** POST /api/swag/orders */
export interface CreateSwagOrderBody {
  txHash: string;
  shipping: SwagShipping;
  size?: SwagSize;
  /** Defaults to the quantity in the Purchased log; must match it when given. */
  quantity?: number;
}

export interface CreateSwagOrderResponse {
  order: SwagOrderView;
  /** True when the tx_hash was already on file and the existing row is returned. */
  existing: boolean;
}

/** POST /api/swag/claim — issue a voucher. */
export interface ClaimIssueBody {
  orderId: number;
  /** One of the caller's linked wallets. Defaults to the embedded wallet. */
  to?: string;
}

export interface ClaimIssueResponse {
  orderId: number;
  voucher: ClaimVoucherFields;
  signature: `0x${string}`;
  /** Where to send claim(): the collection on Base. */
  collection: `0x${string}`;
  chainId: number;
}

/** POST /api/swag/claim with txHash — confirm the mint. */
export interface ClaimConfirmBody {
  orderId: number;
  txHash: string;
}

export interface ClaimConfirmResponse {
  orderId: number;
  claimTxHash: string;
}

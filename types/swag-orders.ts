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

// ── Admin (pages/api/swag/admin/*, behind requireSwagAdmin) ─────────────────

/**
 * Notes are a small key=value log the webhook and the admin UI both append
 * to. These two keys drive the voucher-cancel queue: the refund webhook writes
 * the first, the admin page writes the second after cancelOrder() confirms.
 */
export const NOTE_VOUCHER_NEEDS_CANCEL = 'voucher_needs_cancel=true';
export const NOTE_VOUCHER_CANCELLED_TX = 'voucher_cancelled_tx=';

/**
 * shipping as stored: what the buyer or Shopify gave us, plus the tracking
 * reference an operator adds when the parcel leaves. Partial because a Shopify
 * address can arrive with fields missing and the row is still worth shipping.
 */
export type SwagAdminShipping = Partial<SwagShipping> & { tracking?: string };

/** A row as an operator sees it. The address and email are here on purpose. */
export interface SwagAdminOrderView {
  id: number;
  channel: SwagOrderChannel;
  status: SwagOrderStatus;
  quantity: number;
  size: SwagSize | null;
  tokenId: number;
  product: { sku: string; nameEs: string; nameEn: string };
  buyer: { wallet: string | null; email: string | null };
  shipping: SwagAdminShipping;
  txHash: string | null;
  claimTxHash: string | null;
  orderRef: `0x${string}`;
  shopifyOrderId: string | null;
  voucherIssued: boolean;
  /** Refunded with a live voucher and no cancelOrder() recorded yet. */
  voucherNeedsCancel: boolean;
  /** The cancelOrder() transaction, once the admin page has recorded it. */
  voucherCancelledTx: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/swag/admin/orders?status=&channel=&q=&cursor= — pages of 50, newest first. */
export interface SwagAdminOrdersResponse {
  orders: SwagAdminOrderView[];
  /** Pass back as ?cursor= for the next page; null on the last one. */
  nextCursor: number | null;
}

/** PATCH /api/swag/admin/orders/[id] */
export interface SwagAdminOrderPatchBody {
  /** Goes through the swag_orders_guard_status trigger; a refused move is a 409. */
  status?: Extract<SwagOrderStatus, 'shipped' | 'delivered' | 'cancelled'>;
  /** Stored as shipping.tracking. Empty string removes it. */
  tracking?: string;
  /** Replaces notes. Send the existing text plus the new line to append. */
  notes?: string;
}

export interface SwagAdminOrderPatchResponse {
  order: SwagAdminOrderView;
}

/** getVariant(id) plus the USDC price, bigints as decimal strings. */
export interface SwagAdminTokenStock {
  tokenId: number;
  onchainCap: string;
  onchainMinted: string;
  voucherCap: string;
  voucherMinted: string;
  active: boolean;
  /** USDC base units (6 decimals); "0" when no USDC price is set. */
  priceUsdc: string;
}

/** GET /api/swag/admin/summary */
export interface SwagAdminSummary {
  counts: {
    byStatus: Record<SwagOrderStatus, number>;
    byChannel: Record<SwagOrderChannel, number>;
    total: number;
  };
  collection: {
    address: `0x${string}`;
    chainId: number;
    paused: boolean;
    treasury: `0x${string}`;
    stock: SwagAdminTokenStock[];
  };
  /** Orders still flagged voucher_needs_cancel=true, with the chain's own answer. */
  voucherCancelQueue: Array<{
    id: number;
    orderRef: `0x${string}`;
    buyerEmail: string | null;
    tokenId: number;
    /** orderClaimed(orderRef) on the collection — true once claim() or cancelOrder() ran. */
    closedOnChain: boolean;
  }>;
}

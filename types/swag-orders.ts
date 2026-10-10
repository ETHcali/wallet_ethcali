/**
 * Swag orders — the shapes shared by the API routes, the server helpers and
 * the claim page. Mirrors supabase/migrations/20260923100000_swag_orders.sql.
 *
 * bigint-valued fields cross the wire as decimal strings: JSON has no bigint,
 * and a uint256 deadline or tokenId must round-trip byte-exact into the
 * EIP-712 struct the contract hashes.
 */

export type SwagOrderChannel = 'onchain' | 'shopify' | 'event';
export type SwagOrderStatus = 'awaiting_shipping_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
export type SwagCurrency = 'USDC' | 'COP';
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
  /** Recipient's ID number (cédula / NIT), digits only. Envia requires it for Colombian labels. */
  document?: string;
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
  /** USDC orders: the signed quote accepted at checkout (lib/swag/shipping.ts). */
  shipping_quote: SwagShippingQuote | null;
  /** USDC orders: the transaction that paid shipping. */
  shipping_tx_hash: string | null;
  /** Copied from the payment of record when verified. Display and totals only. */
  item_amount: number | string | null;
  item_currency: SwagCurrency | null;
  shipping_amount: number | string | null;
  shipping_currency: SwagCurrency | null;
  created_at: string;
  updated_at: string;
}

/**
 * Where the parcel is. Written into `shipping.tracking` by the Shopify
 * fulfilment webhooks (orders/fulfilled, fulfillments/update); an operator's
 * PATCH may still store a bare string there, which reads back as `{ number }`.
 */
export interface SwagTracking {
  number: string | null;
  url: string | null;
  company: string | null;
}

/**
 * A signed shipping quote, as POST /api/swag/shipping/quote returns it and as
 * swag_orders.shipping_quote stores it. amountUnits is USDC base units (6
 * decimals) as a decimal string; exp is unix seconds.
 */
export interface SwagShippingQuote {
  v: 1;
  zone: string;
  amountUnits: string;
  wallet: string;
  country: string;
  exp: number;
  sig: string;
}

/** A zone as the storefront sees it. */
export interface SwagShippingZoneView {
  code: string;
  labelEs: string;
  labelEn: string;
  countries: string[];
  priceUsd: number;
  etaMinDays: number;
  etaMaxDays: number;
}

/** GET /api/swag/shipping/zones — active zones only. */
export interface SwagShippingZonesResponse {
  zones: SwagShippingZoneView[];
}

/** POST /api/swag/shipping/quote */
export interface SwagShippingQuoteBody {
  country: string;
  city: string;
  /** The linked wallet that will pay; defaults to the embedded one. */
  wallet?: string;
}

export interface SwagShippingQuoteResponse {
  zone: SwagShippingZoneView;
  quote: SwagShippingQuote;
}

/** POST /api/swag/shipping/pay — prove the shipping transfer for an order. */
export interface SwagPayShippingBody {
  orderId: number;
  txHash: string;
}

/** Where a USDC order's shipping stands, on the buyer's view of it. */
export interface SwagOrderShippingPayment {
  zone: string;
  amountUnits: string;
  /** The wallet it must be paid from. */
  wallet: string;
  txHash: string | null;
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
  /** Present once Shopify has fulfilled the order (or an operator added a reference). */
  tracking?: SwagTracking;
  /** USDC orders with a shipping quote: what is owed and whether it is paid. */
  shippingPayment?: SwagOrderShippingPayment;
}

export interface SwagOrdersResponse {
  orders: SwagOrderView[];
}

/** POST /api/swag/orders */
export interface CreateSwagOrderBody {
  txHash: string;
  shipping: SwagShipping;
  /** Required: the signed quote for this address, from POST /api/swag/shipping/quote. */
  shippingQuote: SwagShippingQuote;
  size?: SwagSize;
  /** Defaults to the quantity in the Purchased log; must match it when given. */
  quantity?: number;
}

/**
 * Outcome of mirroring a USDC purchase into Shopify (lib/swag/shopifyMirror.ts).
 * A failed mirror never fails the order: the row exists, the response is still
 * 201, and `notes` carries `mirror_failed=true` for the order desk.
 */
export interface SwagMirrorResult {
  ok: boolean;
  /** The Shopify order GID, once created (or already on the row). */
  shopifyOrderId?: string;
  /** True when the row already carried a shopify_order_id and nothing was sent. */
  skipped?: boolean;
  error?: string;
}

export interface CreateSwagOrderResponse {
  order: SwagOrderView;
  /** True when the tx_hash was already on file and the existing row is returned. */
  existing: boolean;
  /** Only on onchain orders: whether the Shopify fulfilment mirror exists. */
  mirror?: SwagMirrorResult;
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
  /** Where to send claim(): the collection, on `chainId`. */
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
/** POST /api/swag/orders could not create the Shopify mirror; the order desk creates it by hand. */
export const NOTE_MIRROR_FAILED = 'mirror_failed=true';

/**
 * shipping as the admin page sees it: what the buyer or Shopify gave us, plus
 * the tracking reference an operator adds when the parcel leaves. Partial
 * because a Shopify address can arrive with fields missing and the row is
 * still worth shipping. `tracking` is flattened to the number here (the order
 * page renders and edits a string); the full object is `trackingDetail` on
 * the view.
 */
export type SwagAdminShipping = Partial<SwagShipping> & { tracking?: string };

/**
 * shipping exactly as the jsonb column holds it. `tracking` is a bare string
 * when an operator typed it and a SwagTracking object when a Shopify
 * fulfilment webhook wrote it.
 */
export type SwagStoredShipping = Partial<SwagShipping> & { tracking?: string | SwagTracking };

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
  /** Carrier, number and link as Shopify reported them; null until fulfilled. */
  trackingDetail: SwagTracking | null;
  /** The Shopify mirror of a USDC order failed and has to be created by hand. */
  mirrorFailed: boolean;
  /** What was charged, copied from the payment of record. Null where not recorded. */
  payment: {
    item: { amount: number; currency: SwagCurrency } | null;
    shipping: { amount: number; currency: SwagCurrency; zone: string | null; txHash: string | null } | null;
    /** A USDC order whose shipping quote is not paid yet: the amount owed. */
    shippingDue: { amount: number; currency: 'USDC'; zone: string } | null;
  };
  /** Every status the order entered, oldest first. */
  timeline: Array<{ status: SwagOrderStatus; at: string }>;
}

/**
 * Why an order is waiting on someone. One predicate (lib/swag/orders.ts ›
 * attentionOf) decides it, so the count on a tile and the list it opens never
 * disagree.
 */
export type SwagAttention = 'shipping_unpaid' | 'stale' | 'no_document' | 'mirror_failed' | 'no_tracking' | 'voucher_cancel';

export const SWAG_ATTENTION: readonly SwagAttention[] = [
  'stale',
  'no_document',
  'mirror_failed',
  'no_tracking',
  'shipping_unpaid',
  'voucher_cancel',
];

/** Paid or in production for longer than this is "stale": past the weekly batch it should have joined. */
export const SWAG_STALE_DAYS = 7;

/** GET /api/swag/admin/orders?status=&channel=&attention=&q=&cursor= — pages of 50, newest first. */
export interface SwagAdminOrdersResponse {
  orders: SwagAdminOrderView[];
  /** Pass back as ?cursor= for the next page; null on the last one. */
  nextCursor: number | null;
}

/** PATCH /api/swag/admin/orders/[id] */
export interface SwagAdminOrderPatchBody {
  /** Goes through the swag_orders_guard_status trigger; a refused move is a 409. */
  status?: Extract<SwagOrderStatus, 'in_production' | 'shipped' | 'delivered' | 'cancelled'>;
  /** Stored as shipping.tracking. Empty string removes it. */
  tracking?: string;
  /** Replaces notes. Send the existing text plus the new line to append. */
  notes?: string;
}

export interface SwagAdminOrderPatchResponse {
  order: SwagAdminOrderView;
}

/**
 * POST /api/swag/admin/orders/bulk — one forward move for many orders.
 * Cancelling stays one order at a time, behind its own confirmation.
 */
export interface SwagAdminBulkBody {
  ids: number[];
  status: Extract<SwagOrderStatus, 'in_production' | 'shipped' | 'delivered'>;
  /** status 'shipped' only: tracking per order id. A missing or empty entry leaves tracking as it is. */
  tracking?: Record<string, string>;
}

/** Per order, because the status trigger can refuse one move and allow the next. */
export interface SwagAdminBulkResponse {
  results: Array<{ id: number; ok: true } | { id: number; ok: false; error: string }>;
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
  /**
   * The caller's level, read from the collection across every linked wallet
   * (the embedded one included). Presentation only — each route re-checks.
   */
  viewer: {
    role: 'admin' | 'fulfilment';
    /** Holds DEFAULT_ADMIN_ROLE: may grant and revoke staff. */
    superAdmin: boolean;
    /** The wallet that carries the role. */
    wallet: string;
  };
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
  /**
   * Money in, per currency, over orders that are not cancelled. Item and
   * shipping kept apart; USDC is on-chain, COP is card through Shopify.
   */
  revenue: Record<SwagCurrency, { item: number; shipping: number; orders: number }>;
  /** Orders whose USDC shipping is still unpaid, and the USDC owed. */
  shippingDue: { orders: number; usdc: number };
  /**
   * How many orders wait on each reason. voucher_cancel counts only rows the
   * chain has not closed yet (orderClaimed is false).
   */
  attention: Record<SwagAttention, number>;
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

/** GET /api/swag/admin/batch — the window lib/swag/batch.ts computes, and its orders. */
export interface SwagAdminBatchResponse {
  batch: {
    /** ISO, UTC. Orders created before it are in this batch. */
    cutoff: string;
    /** Bogotá calendar date the batch is handed to the carrier. */
    dispatchDate: string;
    phase: 'collecting' | 'producing';
  };
  /** paid and in_production orders created before the cutoff, oldest first. */
  orders: SwagAdminOrderView[];
  /** Open orders created after the cutoff, waiting for next week. */
  later: number;
  /** More orders than the view returns; print from the order list instead. */
  truncated: boolean;
}

/** POST /api/swag/admin/batch { action: 'start' } */
export interface SwagAdminBatchStartResponse {
  batch: SwagAdminBatchResponse['batch'];
  /** Order ids moved paid → in_production. */
  moved: number[];
}

// ── Staff (pages/api/swag/admin/staff*) ─────────────────────────────────────

export type SwagStaffRole = 'admin' | 'fulfilment';

/** A swag_staff row with the chain's current answer beside it. */
export interface SwagStaffView {
  address: string;
  label: string;
  email: string | null;
  /** The role recorded when it was granted. */
  role: SwagStaffRole;
  grantedBy: string;
  grantTxHash: string | null;
  createdAt: string;
  /** Read from the collection now. The row means nothing without these. */
  onChain: { admin: boolean; fulfilment: boolean; superAdmin: boolean } | null;
}

export interface SwagStaffListResponse {
  staff: SwagStaffView[];
}

/** POST /api/swag/admin/staff/resolve { email } */
export interface SwagStaffResolveResponse {
  address: string;
  did: string;
  /** The Privy account did not exist and was created by this call. */
  created: boolean;
}

/** POST /api/swag/admin/staff — record a grant that is already on chain. */
export interface SwagStaffRecordBody {
  address: string;
  role: SwagStaffRole;
  label: string;
  email?: string;
  did?: string;
  txHash?: string;
}

export interface SwagStaffRecordResponse {
  member: SwagStaffView;
}

/** A zone as the admin edits it: the storefront view plus the city list and the switch. */
export interface SwagAdminShippingZone extends SwagShippingZoneView {
  cities: string[];
  active: boolean;
  updatedAt: string;
}

/** GET /api/swag/admin/shipping */
export interface SwagAdminShippingResponse {
  zones: SwagAdminShippingZone[];
}

/** PATCH /api/swag/admin/shipping { code, …changes } */
export interface SwagAdminShippingPatchBody {
  code: string;
  priceUsd?: number;
  etaMinDays?: number;
  etaMaxDays?: number;
  active?: boolean;
  /** Replaces the list. Normalised server-side (lowercase, no accents). */
  cities?: string[];
}

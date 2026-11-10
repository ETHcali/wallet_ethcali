/**
 * swag_orders — the server-side helpers the API routes and the Shopify
 * webhook share. Everything here runs with the service role; nothing here
 * decides who may call it. That is the routes' job (requireUser) and the
 * webhook's (HMAC).
 *
 * The table has no client access at all, so this file is the only place the
 * row shape is read or written. Keep the SELECT list and the view mapping
 * together here so a column added to the table is exposed in exactly one
 * deliberate step.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSwagCollection, SWAG_CHAIN_ID, type PurchasedLog } from './onchain';
import { createMirrorOrder, type MirrorPurchase } from './shopifyMirror';
import { logger } from '../../utils/logger';
import {
  NOTE_MIRROR_FAILED,
  NOTE_VOUCHER_CANCELLED_TX,
  NOTE_VOUCHER_NEEDS_CANCEL,
  SWAG_ATTENTION,
  SWAG_SIZES,
  SWAG_STALE_DAYS,
  type SwagAdminBulkBody,
  type SwagAdminBulkResponse,
  type SwagAdminOrderPatchBody,
  type SwagAdminOrderView,
  type SwagAdminOrdersResponse,
  type SwagAdminShipping,
  type SwagAttention,
  type SwagMirrorResult,
  type SwagOrderChannel,
  type SwagOrderRow,
  type SwagOrderStatus,
  type SwagOrderView,
  type SwagShipping,
  type SwagSize,
  type SwagStoredShipping,
  type SwagTracking,
} from '../../types/swag-orders';

export class OrderError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

// ── Input validation ────────────────────────────────────────────────────────

/** Anything a person typed, with control characters and surrounding space removed. */
function clean(value: unknown): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
}

function field(
  raw: Record<string, unknown>,
  key: keyof SwagShipping,
  { min, max }: { min: number; max: number }
): string {
  const value = clean(raw[key]);
  if (value.length < min) {
    throw new OrderError(min === 0 ? `${key} is too long` : `${key} is required`, 400);
  }
  if (value.length > max) throw new OrderError(`${key} is too long`, 400);
  return value;
}

/**
 * A shipping block the warehouse can act on. Lengths are generous and the
 * only format rule is the country code: the rest is address text, and address
 * text is different in every country we ship to.
 */
export function parseShipping(raw: unknown): SwagShipping {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new OrderError('shipping is required', 400);
  }
  const r = raw as Record<string, unknown>;

  const country = field(r, 'country', { min: 2, max: 2 }).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new OrderError('country must be a two-letter ISO code', 400);
  }

  const shipping: SwagShipping = {
    name: field(r, 'name', { min: 2, max: 120 }),
    address1: field(r, 'address1', { min: 3, max: 200 }),
    city: field(r, 'city', { min: 1, max: 100 }),
    country,
  };

  const phone = field(r, 'phone', { min: 0, max: 40 });
  const address2 = field(r, 'address2', { min: 0, max: 200 });
  const region = field(r, 'region', { min: 0, max: 100 });
  const notes = field(r, 'notes', { min: 0, max: 500 });
  if (phone) shipping.phone = phone;
  if (address2) shipping.address2 = address2;
  if (region) shipping.region = region;
  if (notes) shipping.notes = notes;

  // Envia will not print a Colombian label without the recipient's cédula or
  // NIT, so a Colombian address is not complete without it. Digits only.
  const document = field(r, 'document', { min: 0, max: 20 }).replace(/[^0-9]/g, '');
  if (country === 'CO' && !/^[0-9]{5,12}$/.test(document)) {
    throw new OrderError('document (cédula or NIT) is required for Colombian addresses', 400);
  }
  if (document) shipping.document = document;

  return shipping;
}

export function parseSize(raw: unknown): SwagSize | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const size = clean(raw).toUpperCase();
  if (!(SWAG_SIZES as readonly string[]).includes(size)) {
    throw new OrderError(`size must be one of ${SWAG_SIZES.join(', ')}`, 400);
  }
  return size as SwagSize;
}

// ── Catalogue lookups ───────────────────────────────────────────────────────

export interface ResolvedVariant {
  variantId: number;
  productId: number;
  tokenId: number;
  sku: string;
  sized: boolean;
  sizes: string[];
}

interface VariantJoinRow {
  id: number;
  product_id: number;
  token_id: number;
  product: { sku: string; sized: boolean; sizes: string[] } | null;
}

function toResolved(row: VariantJoinRow): ResolvedVariant | null {
  if (!row.product) return null;
  return {
    variantId: row.id,
    productId: row.product_id,
    tokenId: row.token_id,
    sku: row.product.sku,
    sized: row.product.sized,
    sizes: row.product.sizes,
  };
}

const VARIANT_SELECT = 'id, product_id, token_id, product:swag_products!inner(sku, sized, sizes)';

/** The design behind a tokenId on the live collection. */
export async function resolveVariantByToken(
  db: SupabaseClient,
  tokenId: number
): Promise<ResolvedVariant | null> {
  const { data, error } = await db
    .from('swag_variants')
    .select(VARIANT_SELECT)
    .eq('chain_id', SWAG_CHAIN_ID)
    .eq('collection_address', getSwagCollection().toLowerCase())
    .eq('token_id', tokenId)
    .maybeSingle();
  if (error) throw new OrderError(error.message, 500);
  return data ? toResolved(data as unknown as VariantJoinRow) : null;
}

/** The live collection's deployment of a design. */
export async function resolveVariantByProduct(
  db: SupabaseClient,
  productId: number
): Promise<ResolvedVariant | null> {
  const { data, error } = await db
    .from('swag_variants')
    .select(VARIANT_SELECT)
    .eq('chain_id', SWAG_CHAIN_ID)
    .eq('collection_address', getSwagCollection().toLowerCase())
    .eq('product_id', productId)
    .maybeSingle();
  if (error) throw new OrderError(error.message, 500);
  return data ? toResolved(data as unknown as VariantJoinRow) : null;
}

/**
 * A Shopify line-item SKU → the design on the collection and the size it names.
 *
 * First the exact mapping the sync wrote (swag_shopify_variants), which knows
 * the size outright. Failing that, the convention: strip a trailing -<SIZE>
 * and match swag_products.sku. The fallback exists so a variant created by
 * hand in the Shopify admin, with the SKU typed correctly, still fulfils.
 */
export async function resolveVariantBySku(
  db: SupabaseClient,
  lineSku: string
): Promise<{ variant: ResolvedVariant; size: SwagSize | null } | null> {
  const sku = lineSku.trim().toUpperCase();
  if (!sku) return null;

  const { data: mapped, error } = await db
    .from('swag_shopify_variants')
    .select('product_id, size')
    .eq('sku', sku)
    .maybeSingle();
  if (error) throw new OrderError(error.message, 500);

  if (mapped) {
    const variant = await resolveVariantByProduct(db, mapped.product_id as number);
    return variant ? { variant, size: (mapped.size as SwagSize | null) ?? null } : null;
  }

  let designSku = sku;
  let size: SwagSize | null = null;
  const dash = sku.lastIndexOf('-');
  if (dash > 0) {
    const suffix = sku.slice(dash + 1);
    if ((SWAG_SIZES as readonly string[]).includes(suffix)) {
      designSku = sku.slice(0, dash);
      size = suffix as SwagSize;
    }
  }

  const { data: product, error: productError } = await db
    .from('swag_products')
    .select('id')
    .eq('sku', designSku)
    .maybeSingle();
  if (productError) throw new OrderError(productError.message, 500);
  if (!product) return null;

  const variant = await resolveVariantByProduct(db, product.id as number);
  return variant ? { variant, size } : null;
}

/**
 * The Shopify variant for (design, size): the line item a USDC order is
 * mirrored as. An unsized design has exactly one row with size null.
 */
export async function resolveShopifyVariantId(
  db: SupabaseClient,
  productId: number,
  size: SwagSize | null
): Promise<string | null> {
  let query = db.from('swag_shopify_variants').select('shopify_variant_id').eq('product_id', productId);
  query = size === null ? query.is('size', null) : query.eq('size', size);
  const { data, error } = await query.maybeSingle();
  if (error) throw new OrderError(error.message, 500);
  return (data?.shopify_variant_id as string | undefined) ?? null;
}

// ── Rows in and out ─────────────────────────────────────────────────────────

const ORDER_SELECT =
  '*, product:swag_products!inner(sku, name_es, name_en, image_path), variant:swag_variants!inner(token_id), events:swag_order_events(to_status, at)';

export type OrderJoined = SwagOrderRow & {
  product: { sku: string; name_es: string; name_en: string; image_path: string | null };
  variant: { token_id: number };
  /** The status timeline (swag_order_events). May be empty on the row an insert returns. */
  events?: Array<{ to_status: SwagOrderStatus; at: string }>;
};

const money = (v: number | string | null): number | null => (v === null || v === undefined ? null : Number(v));

/**
 * shipping.tracking as stored → one shape. An operator's PATCH writes a bare
 * string; the fulfilment webhook writes { number, url, company }. Empty
 * either way is null.
 */
export function normaliseTracking(value: unknown): SwagTracking | null {
  if (typeof value === 'string') {
    const number = value.trim();
    return number ? { number, url: null, company: null } : null;
  }
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    const pick = (k: string) => (typeof v[k] === 'string' && (v[k] as string).trim() ? (v[k] as string).trim() : null);
    const tracking = { number: pick('number'), url: pick('url'), company: pick('company') };
    return tracking.number || tracking.url || tracking.company ? tracking : null;
  }
  return null;
}

/** The row as the buyer may see it: no address, no email, no signature. */
export function toOrderView(row: OrderJoined): SwagOrderView {
  const tracking = normaliseTracking((row.shipping as SwagStoredShipping).tracking);
  const view: SwagOrderView = {
    id: row.id,
    channel: row.channel,
    status: row.status,
    quantity: row.quantity,
    size: row.size,
    createdAt: row.created_at,
    txHash: row.tx_hash,
    claimTxHash: row.claim_tx_hash,
    voucherIssued: row.voucher !== null,
    // Refunded orders cannot be claimed; a parcel being shipped or delivered
    // is no reason to withhold the token. Mirrors pages/api/swag/claim.ts.
    claimable: row.channel === 'shopify' && row.status !== 'cancelled' && row.claim_tx_hash === null,
    tokenId: row.variant.token_id,
    product: {
      sku: row.product.sku,
      nameEs: row.product.name_es,
      nameEn: row.product.name_en,
      imagePath: row.product.image_path,
    },
  };
  if (tracking) view.tracking = tracking;
  if (row.shipping_quote) {
    view.shippingPayment = {
      zone: row.shipping_quote.zone,
      amountUnits: row.shipping_quote.amountUnits,
      wallet: row.shipping_quote.wallet,
      txHash: row.shipping_tx_hash,
    };
  }
  return view;
}

export async function getOrderById(db: SupabaseClient, id: number): Promise<OrderJoined | null> {
  const { data, error } = await db.from('swag_orders').select(ORDER_SELECT).eq('id', id).maybeSingle();
  if (error) throw new OrderError(error.message, 500);
  return (data as unknown as OrderJoined | null) ?? null;
}

export async function getOrderByTxHash(db: SupabaseClient, txHash: string): Promise<OrderJoined | null> {
  const { data, error } = await db
    .from('swag_orders')
    .select(ORDER_SELECT)
    .eq('tx_hash', txHash.toLowerCase())
    .maybeSingle();
  if (error) throw new OrderError(error.message, 500);
  return (data as unknown as OrderJoined | null) ?? null;
}

/**
 * Everything the caller bought through either door, newest first.
 *
 * buyer_email is stored lowercased by the webhook and the caller's emails
 * arrive lowercased from requireUser, so this is an exact match — no ILIKE,
 * whose `_` and `%` would turn an address into a pattern.
 */
export async function listOrdersFor(
  db: SupabaseClient,
  who: { wallets: string[]; emails: string[] }
): Promise<SwagOrderView[]> {
  const rows: OrderJoined[] = [];

  if (who.wallets.length > 0) {
    const { data, error } = await db
      .from('swag_orders')
      .select(ORDER_SELECT)
      .eq('channel', 'onchain')
      .in('buyer_wallet', who.wallets);
    if (error) throw new OrderError(error.message, 500);
    rows.push(...((data ?? []) as unknown as OrderJoined[]));
  }

  if (who.emails.length > 0) {
    const { data, error } = await db
      .from('swag_orders')
      .select(ORDER_SELECT)
      .in('channel', ['shopify', 'event'])
      .in('buyer_email', who.emails);
    if (error) throw new OrderError(error.message, 500);
    rows.push(...((data ?? []) as unknown as OrderJoined[]));
  }

  rows.sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));
  return rows.map(toOrderView);
}

/** Columns a route may set on insert. Timestamps and status default in the database. */
export type NewSwagOrder = Pick<
  SwagOrderRow,
  'channel' | 'product_id' | 'variant_id' | 'quantity' | 'size' | 'order_ref'
> &
  Partial<
    Pick<
      SwagOrderRow,
      | 'buyer_wallet'
      | 'buyer_email'
      | 'shipping'
      | 'tx_hash'
      | 'shopify_order_id'
      | 'shopify_line_item_id'
      | 'status'
      | 'shipping_quote'
      | 'item_amount'
      | 'item_currency'
      | 'shipping_amount'
      | 'shipping_currency'
    >
  >;

export async function insertOrder(db: SupabaseClient, row: NewSwagOrder): Promise<OrderJoined> {
  const { data, error } = await db.from('swag_orders').insert(row).select(ORDER_SELECT).single();
  if (error) {
    // 23505 is unique_violation: the receipt or the line item is already on file.
    throw new OrderError(error.message, error.code === '23505' ? 409 : 500);
  }
  return data as unknown as OrderJoined;
}

/** Append a line to notes without losing what an operator already wrote. */
export function appendNote(existing: string | null, line: string): string {
  if (!existing) return line;
  return existing.includes(line) ? existing : `${existing}\n${line}`;
}

/** Drop every notes line that starts with `prefix`; null when nothing is left. */
export function removeNote(existing: string | null, prefix: string): string | null {
  if (!existing) return null;
  const kept = existing.split('\n').filter((line) => !line.startsWith(prefix));
  const joined = kept.join('\n').trim();
  return joined || null;
}

// ── Admin ───────────────────────────────────────────────────────────────────
//
// Everything below is reached only through requireSwagAdmin. It returns the
// full row — address, email, notes — because the person calling it is the one
// packing the parcel.

/** The cancelOrder() hash the admin page recorded, if any. */
export function voucherCancelledTx(notes: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(new RegExp(`${NOTE_VOUCHER_CANCELLED_TX}(0x[0-9a-fA-F]{64})`));
  return match ? match[1].toLowerCase() : null;
}

/** Flagged by the refund webhook and not yet closed on chain from this UI. */
export function needsVoucherCancel(row: Pick<SwagOrderRow, 'notes' | 'claim_tx_hash'>): boolean {
  return (
    row.claim_tx_hash === null &&
    Boolean(row.notes?.includes(NOTE_VOUCHER_NEEDS_CANCEL)) &&
    voucherCancelledTx(row.notes) === null
  );
}

/** The columns attentionOf reads; the summary and the filtered list both select exactly these. */
export const ATTENTION_COLUMNS = 'id, status, channel, created_at, shipping, notes, claim_tx_hash';
export type AttentionRow = Pick<SwagOrderRow, 'id' | 'status' | 'channel' | 'created_at' | 'shipping' | 'notes' | 'claim_tx_hash'>;

const OPEN: readonly SwagOrderStatus[] = ['awaiting_shipping_payment', 'paid', 'in_production'];

/**
 * Every reason this order is waiting on someone. The one predicate behind the
 * summary's counts and the ?attention= list, so a tile and the list it opens
 * always agree. voucher_cancel here is the database's view; the summary
 * narrows it with the chain's orderClaimed().
 */
export function attentionOf(row: AttentionRow, now: number = Date.now()): SwagAttention[] {
  const shipping = (row.shipping ?? {}) as SwagStoredShipping;
  const reasons: SwagAttention[] = [];
  if (row.status === 'awaiting_shipping_payment') reasons.push('shipping_unpaid');
  if (
    (row.status === 'paid' || row.status === 'in_production') &&
    now - new Date(row.created_at).getTime() > SWAG_STALE_DAYS * 86_400_000
  ) {
    reasons.push('stale');
  }
  if (OPEN.includes(row.status) && (shipping.country ?? '').toUpperCase() === 'CO' && !clean(shipping.document)) {
    reasons.push('no_document');
  }
  if (row.status !== 'cancelled' && Boolean(row.notes?.includes(NOTE_MIRROR_FAILED))) reasons.push('mirror_failed');
  if (row.status === 'shipped' && !normaliseTracking(shipping.tracking)?.number) reasons.push('no_tracking');
  if (needsVoucherCancel(row)) reasons.push('voucher_cancel');
  return reasons;
}

/** How many rows wait on each reason. */
export function countAttention(rows: readonly AttentionRow[], now: number = Date.now()): Record<SwagAttention, number> {
  const counts = Object.fromEntries(SWAG_ATTENTION.map((k) => [k, 0])) as Record<SwagAttention, number>;
  for (const row of rows) for (const reason of attentionOf(row, now)) counts[reason] += 1;
  return counts;
}

export function toAdminOrderView(row: OrderJoined): SwagAdminOrderView {
  const stored = (row.shipping ?? {}) as SwagStoredShipping;
  const tracking = normaliseTracking(stored.tracking);
  // The order page renders and edits `shipping.tracking` as a string, so the
  // stored object is flattened to its number here and offered whole beside it.
  const shipping: SwagAdminShipping = { ...stored, tracking: tracking?.number ?? undefined };
  if (shipping.tracking === undefined) delete shipping.tracking;
  return {
    id: row.id,
    channel: row.channel,
    status: row.status,
    quantity: row.quantity,
    size: row.size,
    tokenId: row.variant.token_id,
    product: { sku: row.product.sku, nameEs: row.product.name_es, nameEn: row.product.name_en },
    buyer: { wallet: row.buyer_wallet, email: row.buyer_email },
    shipping,
    txHash: row.tx_hash,
    claimTxHash: row.claim_tx_hash,
    orderRef: row.order_ref,
    shopifyOrderId: row.shopify_order_id,
    voucherIssued: row.voucher !== null,
    voucherNeedsCancel: needsVoucherCancel(row),
    voucherCancelledTx: voucherCancelledTx(row.notes),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    trackingDetail: tracking,
    mirrorFailed: Boolean(row.notes?.includes(NOTE_MIRROR_FAILED)),
    payment: {
      item: row.item_currency ? { amount: money(row.item_amount) ?? 0, currency: row.item_currency } : null,
      shipping: row.shipping_currency
        ? {
            amount: money(row.shipping_amount) ?? 0,
            currency: row.shipping_currency,
            zone: row.shipping_quote?.zone ?? null,
            txHash: row.shipping_tx_hash,
          }
        : null,
      shippingDue:
        row.status === 'awaiting_shipping_payment' && row.shipping_quote
          ? { amount: Number(row.shipping_quote.amountUnits) / 1e6, currency: 'USDC', zone: row.shipping_quote.zone }
          : null,
    },
    timeline: (row.events ?? [])
      .slice()
      .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
      .map((e) => ({ status: e.to_status, at: e.at })),
  };
}

export const ADMIN_PAGE_SIZE = 50;

const ORDER_STATUSES: readonly SwagOrderStatus[] = ['awaiting_shipping_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled'];
const ORDER_CHANNELS: readonly SwagOrderChannel[] = ['onchain', 'shopify', 'event'];

/**
 * A search term that is safe to put inside a PostgREST `or=()` filter. No
 * commas, parentheses, quotes or `*` — those are the filter grammar. Letters
 * in any script and single spaces are allowed, for names and cities. `_`
 * stays a single-character wildcard, which is harmless here.
 */
const SEARCH_TERM = /^[\p{L}\p{N}@.+_ -]{1,80}$/u;

export interface AdminOrderFilters {
  status?: SwagOrderStatus;
  channel?: SwagOrderChannel;
  /** Only orders waiting on this reason (attentionOf). */
  attention?: SwagAttention;
  /**
   * Matched against the order number (`#12` or `12`), the design SKU, the
   * buyer email and wallet, the recipient's name and city, and tracking.
   */
  q?: string;
  /** The smallest id already shown; the next page is everything older. */
  cursor?: number;
}

/** Query-string values → typed filters, or a 400 for anything off the menu. */
export function parseAdminOrderFilters(query: Record<string, string | string[] | undefined>): AdminOrderFilters {
  const one = (key: string) => {
    const v = query[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s === undefined || s === '' ? undefined : s;
  };
  const filters: AdminOrderFilters = {};

  const status = one('status');
  if (status !== undefined) {
    if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
      throw new OrderError(`status must be one of ${ORDER_STATUSES.join(', ')}`, 400);
    }
    filters.status = status as SwagOrderStatus;
  }

  const channel = one('channel');
  if (channel !== undefined) {
    if (!(ORDER_CHANNELS as readonly string[]).includes(channel)) {
      throw new OrderError(`channel must be one of ${ORDER_CHANNELS.join(', ')}`, 400);
    }
    filters.channel = channel as SwagOrderChannel;
  }

  const attention = one('attention');
  if (attention !== undefined) {
    if (!(SWAG_ATTENTION as readonly string[]).includes(attention)) {
      throw new OrderError(`attention must be one of ${SWAG_ATTENTION.join(', ')}`, 400);
    }
    filters.attention = attention as SwagAttention;
  }

  const q = one('q')?.trim().replace(/\s+/g, ' ').replace(/^#/, '');
  if (q) {
    if (!SEARCH_TERM.test(q)) throw new OrderError('Search may only contain letters, digits, spaces and @ . + _ -', 400);
    filters.q = q;
  }

  const cursor = one('cursor');
  if (cursor !== undefined) {
    const n = Number(cursor);
    if (!Number.isInteger(n) || n <= 0) throw new OrderError('cursor must be a positive integer', 400);
    filters.cursor = n;
  }

  return filters;
}

/** Every order, newest first, ADMIN_PAGE_SIZE at a time, with an id cursor. */
export async function listAdminOrders(
  db: SupabaseClient,
  filters: AdminOrderFilters
): Promise<SwagAdminOrdersResponse> {
  let query = db.from('swag_orders').select(ORDER_SELECT).order('id', { ascending: false }).limit(ADMIN_PAGE_SIZE + 1);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.channel) query = query.eq('channel', filters.channel);
  if (filters.cursor) query = query.lt('id', filters.cursor);

  if (filters.attention) {
    // The reasons are computed, not stored, so resolve them to ids with the
    // same predicate the summary counts with. The table is one row per
    // order line; reading its narrow columns whole is cheap.
    const { data: all, error: attentionError } = await db.from('swag_orders').select(ATTENTION_COLUMNS);
    if (attentionError) throw new OrderError(attentionError.message, 500);
    const now = Date.now();
    const ids = ((all ?? []) as AttentionRow[])
      .filter((row) => attentionOf(row, now).includes(filters.attention as SwagAttention))
      .map((row) => row.id);
    if (ids.length === 0) return { orders: [], nextCursor: null };
    query = query.in('id', ids);
  }

  if (filters.q) {
    // The SKU lives on the design, and PostgREST cannot OR a parent column
    // with an embedded one, so resolve matching designs to ids first.
    const { data: products, error: productError } = await db
      .from('swag_products')
      .select('id')
      .ilike('sku', `%${filters.q}%`);
    if (productError) throw new OrderError(productError.message, 500);
    const ids = (products ?? []).map((p) => p.id as number);

    const like = `*${filters.q}*`;
    const clauses = [
      `buyer_email.ilike.${like}`,
      `buyer_wallet.ilike.${like}`,
      `shipping->>name.ilike.${like}`,
      `shipping->>city.ilike.${like}`,
      // ->> on the tracking object yields its JSON text, so this matches an
      // operator's bare string and the webhook's { number, … } alike.
      `shipping->>tracking.ilike.${like}`,
    ];
    if (/^\d{1,9}$/.test(filters.q)) clauses.push(`id.eq.${filters.q}`);
    if (ids.length > 0) clauses.push(`product_id.in.(${ids.join(',')})`);
    query = query.or(clauses.join(','));
  }

  const { data, error } = await query;
  if (error) throw new OrderError(error.message, 500);

  const rows = (data ?? []) as unknown as OrderJoined[];
  const page = rows.slice(0, ADMIN_PAGE_SIZE);
  const nextCursor = rows.length > ADMIN_PAGE_SIZE ? page[page.length - 1].id : null;
  return { orders: page.map(toAdminOrderView), nextCursor };
}

const PATCHABLE_STATUSES = ['in_production', 'shipped', 'delivered', 'cancelled'] as const;

/** Body → validated patch. Nothing else in the body is read. */
export function parseAdminOrderPatch(raw: unknown): SwagAdminOrderPatchBody {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new OrderError('A JSON body is required', 400);
  const r = raw as Record<string, unknown>;
  const patch: SwagAdminOrderPatchBody = {};

  if (r.status !== undefined) {
    if (typeof r.status !== 'string' || !(PATCHABLE_STATUSES as readonly string[]).includes(r.status)) {
      throw new OrderError(`status must be one of ${PATCHABLE_STATUSES.join(', ')}`, 400);
    }
    patch.status = r.status as SwagAdminOrderPatchBody['status'];
  }
  if (r.tracking !== undefined) {
    if (typeof r.tracking !== 'string') throw new OrderError('tracking must be a string', 400);
    const tracking = clean(r.tracking);
    if (tracking.length > 120) throw new OrderError('tracking is too long', 400);
    patch.tracking = tracking;
  }
  if (r.notes !== undefined) {
    if (typeof r.notes !== 'string') throw new OrderError('notes must be a string', 400);
    if (r.notes.length > 4000) throw new OrderError('notes is too long', 400);
    // Newlines stay: notes is a line-per-entry log.
    // eslint-disable-next-line no-control-regex
    patch.notes = r.notes.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim();
  }
  if (Object.keys(patch).length === 0) throw new OrderError('Nothing to update', 400);
  return patch;
}

/**
 * Apply an operator's change. Status goes through the database trigger and
 * its refusal comes back as a 409 with the trigger's own sentence; tracking is
 * merged into the shipping block rather than replacing it.
 */
export async function patchAdminOrder(
  db: SupabaseClient,
  id: number,
  patch: SwagAdminOrderPatchBody
): Promise<OrderJoined> {
  const existing = await getOrderById(db, id);
  if (!existing) throw new OrderError('No such order', 404);

  const update: Partial<Pick<SwagOrderRow, 'status' | 'shipping' | 'notes'>> = {};
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.notes !== undefined) update.notes = patch.notes || null;
  if (patch.status === 'cancelled' && existing.voucher && !existing.claim_tx_hash) {
    // Same rule as the refund webhook: a cancelled order with a live voucher
    // joins the on-chain cancel queue, whoever cancelled it.
    update.notes = appendNote(update.notes ?? existing.notes, NOTE_VOUCHER_NEEDS_CANCEL);
  }
  if (patch.tracking !== undefined) {
    const shipping: SwagAdminShipping = { ...(existing.shipping as SwagAdminShipping) };
    if (patch.tracking) shipping.tracking = patch.tracking;
    else delete shipping.tracking;
    update.shipping = shipping as SwagShipping;
  }

  const { data, error } = await db.from('swag_orders').update(update).eq('id', id).select(ORDER_SELECT).single();
  if (error) {
    // 23514 is check_violation — the errcode swag_orders_guard_status raises
    // with. Its message names the refused move; that is the sentence to show.
    throw new OrderError(error.message, error.code === '23514' ? 409 : 500);
  }
  return data as unknown as OrderJoined;
}

const BULK_STATUSES = ['in_production', 'shipped', 'delivered'] as const;
const BULK_MAX = 100;

/** Body → validated bulk move. Cancelling is not offered in bulk. */
export function parseAdminBulk(raw: unknown): SwagAdminBulkBody {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new OrderError('A JSON body is required', 400);
  const r = raw as Record<string, unknown>;
  if (typeof r.status !== 'string' || !(BULK_STATUSES as readonly string[]).includes(r.status)) {
    throw new OrderError(`status must be one of ${BULK_STATUSES.join(', ')}`, 400);
  }
  if (!Array.isArray(r.ids) || r.ids.length === 0) throw new OrderError('ids must list at least one order', 400);
  if (r.ids.length > BULK_MAX) throw new OrderError(`At most ${BULK_MAX} orders at a time`, 400);
  const ids = Array.from(new Set(r.ids));
  if (!ids.every((id) => Number.isInteger(id) && (id as number) > 0)) throw new OrderError('ids must be positive integers', 400);

  const body: SwagAdminBulkBody = { ids: ids as number[], status: r.status as SwagAdminBulkBody['status'] };
  if (r.tracking !== undefined) {
    if (body.status !== 'shipped') throw new OrderError('tracking goes with status shipped only', 400);
    if (!r.tracking || typeof r.tracking !== 'object' || Array.isArray(r.tracking)) throw new OrderError('tracking must map order ids to strings', 400);
    const tracking: Record<string, string> = {};
    for (const [id, value] of Object.entries(r.tracking as Record<string, unknown>)) {
      if (typeof value !== 'string') throw new OrderError('tracking must map order ids to strings', 400);
      const v = clean(value);
      if (v.length > 120) throw new OrderError(`tracking for #${id} is too long`, 400);
      if (v) tracking[id] = v;
    }
    body.tracking = tracking;
  }
  return body;
}

/**
 * One move for many orders, each through patchAdminOrder and so through the
 * status trigger. Sequential on purpose: a refusal on one order is reported
 * beside its id and never stops the rest.
 */
export async function bulkPatchAdminOrders(db: SupabaseClient, body: SwagAdminBulkBody): Promise<SwagAdminBulkResponse> {
  const results: SwagAdminBulkResponse['results'] = [];
  for (const id of body.ids) {
    const tracking = body.tracking?.[String(id)];
    try {
      await patchAdminOrder(db, id, { status: body.status, ...(tracking ? { tracking } : {}) });
      results.push({ id, ok: true });
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof OrderError ? e.message : 'Could not update the order' });
    }
  }
  return { results };
}

/** The voucher-cancel queue: cancelled rows the webhook flagged and nobody has closed. */
export async function listVoucherCancelQueue(db: SupabaseClient): Promise<OrderJoined[]> {
  const { data, error } = await db
    .from('swag_orders')
    .select(ORDER_SELECT)
    .eq('status', 'cancelled')
    .is('claim_tx_hash', null)
    .ilike('notes', `%${NOTE_VOUCHER_NEEDS_CANCEL}%`)
    .order('id', { ascending: false });
  if (error) throw new OrderError(error.message, 500);
  return ((data ?? []) as unknown as OrderJoined[]).filter(needsVoucherCancel);
}

// ── Shopify mirror (USDC orders) ────────────────────────────────────────────
//
// A USDC order is packed from the same Shopify queue as a card order, so
// POST /api/swag/orders creates a Shopify order for it (lib/swag/shopifyMirror.ts)
// and records the GID on the onchain row. The chain remains the receipt; the
// mirror is where the parcel is managed.

const NOTE_MIRROR_ERROR = 'mirror_error=';

/**
 * Mirror one onchain row into Shopify, at most once.
 *
 * Idempotent on `shopify_order_id`: a row that already has one is skipped.
 * The GID is written with `shopify_order_id IS NULL` as the condition, so if
 * two retries ever raced past the read, the loser learns it and says so in
 * the log rather than overwriting the winner. A failed mirror never fails
 * the order: it is flagged `mirror_failed=true` in notes for the order desk
 * and the reason is returned to the client.
 */
export async function mirrorOnchainOrder(
  db: SupabaseClient,
  row: OrderJoined,
  purchased: PurchasedLog,
  email: string | null
): Promise<SwagMirrorResult> {
  if (row.channel !== 'onchain' || !row.tx_hash || !row.buyer_wallet) {
    return { ok: false, error: 'Only onchain orders are mirrored' };
  }
  if (row.shopify_order_id) return { ok: true, shopifyOrderId: row.shopify_order_id, skipped: true };

  try {
    const shopifyVariantId = await resolveShopifyVariantId(db, row.product_id, row.size);
    if (!shopifyVariantId) {
      throw new Error(`no Shopify variant for ${row.product.sku}${row.size ? ` size ${row.size}` : ''}`);
    }

    const purchase: MirrorPurchase = {
      txHash: row.tx_hash,
      tokenId: purchased.tokenId.toString(),
      buyerWallet: row.buyer_wallet,
      paidUsdc: purchased.paid.toString(),
      quantity: row.quantity,
      shopifyVariantId,
      sku: row.product.sku,
      size: row.size,
      shipping: row.shipping as SwagShipping,
      email,
    };

    const created = await createMirrorOrder(purchase);

    const notes = removeNote(removeNote(row.notes, NOTE_MIRROR_ERROR), NOTE_MIRROR_FAILED);
    const { data, error } = await db
      .from('swag_orders')
      .update({ shopify_order_id: created.shopifyOrderId, notes })
      .eq('id', row.id)
      .is('shopify_order_id', null)
      .select('id');
    if (error) throw new OrderError(`mirrored as ${created.shopifyOrderId} but could not record it: ${error.message}`, 500);
    if (!data || data.length === 0) {
      // Someone else recorded a mirror between our read and our write. Both
      // Shopify orders exist; the one not on the row needs cancelling by hand.
      logger.error(
        `[swag/mirror] order ${row.id}: duplicate mirror ${created.shopifyOrderId} (${created.name}); another mirror is already recorded`
      );
      return { ok: false, shopifyOrderId: created.shopifyOrderId, error: 'A mirror was already recorded for this order' };
    }

    if (created.degradedAddress) {
      logger.warn(`[swag/mirror] order ${row.id}: Shopify refused the full address; sent it reduced (${created.name})`);
    }
    logger.info(`[swag/mirror] order ${row.id} → ${created.shopifyOrderId} (${created.name}) COP ${created.pricing.totalCop}`);
    return { ok: true, shopifyOrderId: created.shopifyOrderId };
  } catch (e) {
    const reason = (e as Error).message.slice(0, 300);
    logger.error(`[swag/mirror] order ${row.id} (${row.tx_hash}) not mirrored: ${reason}`);
    const notes = appendNote(appendNote(removeNote(row.notes, NOTE_MIRROR_ERROR), NOTE_MIRROR_FAILED), `${NOTE_MIRROR_ERROR}${reason}`);
    const { error } = await db.from('swag_orders').update({ notes }).eq('id', row.id);
    if (error) logger.error(`[swag/mirror] order ${row.id}: could not flag the failure (${error.message})`);
    return { ok: false, error: reason };
  }
}

// ── Fulfilment from Shopify ─────────────────────────────────────────────────

export interface FulfilmentOutcome {
  /** Rows moved paid or in_production → shipped. */
  shipped: number;
  /** Rows already shipped whose tracking was updated. */
  tracked: number;
  /** Rows left alone: delivered, cancelled, or nothing new to record. */
  skipped: number;
  /** No swag_orders row carries this Shopify order id. */
  unknown: boolean;
}

/**
 * Shopify says an order shipped. Every row that points at it — a card order's
 * line items or a USDC order's mirror — goes paid or in_production → shipped with the tracking
 * merged into `shipping`. Rows already shipped only pick up new tracking;
 * delivered and cancelled rows are not touched. The transition trigger has
 * the last word on status.
 */
export async function applyFulfilment(
  db: SupabaseClient,
  shopifyOrderId: string,
  tracking: SwagTracking | null
): Promise<FulfilmentOutcome> {
  const { data, error } = await db
    .from('swag_orders')
    .select('id, status, shipping')
    .eq('shopify_order_id', shopifyOrderId);
  if (error) throw new OrderError(error.message, 500);

  const rows = (data ?? []) as Array<Pick<SwagOrderRow, 'id' | 'status' | 'shipping'>>;
  const outcome: FulfilmentOutcome = { shipped: 0, tracked: 0, skipped: 0, unknown: rows.length === 0 };

  for (const row of rows) {
    const stored = (row.shipping ?? {}) as SwagStoredShipping;
    const current = normaliseTracking(stored.tracking);
    const changed = Boolean(tracking) && JSON.stringify(tracking) !== JSON.stringify(current);
    const shipping: SwagStoredShipping = { ...stored };
    if (tracking && changed) shipping.tracking = tracking;

    if (row.status === 'paid' || row.status === 'in_production') {
      const { error: updateError } = await db
        .from('swag_orders')
        .update({ status: 'shipped', shipping })
        .eq('id', row.id)
        .eq('status', row.status);
      if (updateError) throw new OrderError(updateError.message, 500);
      outcome.shipped += 1;
    } else if (row.status === 'shipped' && changed) {
      const { error: updateError } = await db.from('swag_orders').update({ shipping }).eq('id', row.id);
      if (updateError) throw new OrderError(updateError.message, 500);
      outcome.tracked += 1;
    } else {
      outcome.skipped += 1;
    }
  }

  return outcome;
}

// ── The weekly batch (lib/swag/batch.ts decides the window) ─────────────────

/** Most open orders a batch view returns. A week of this store is far below it. */
export const BATCH_LIMIT = 500;

/**
 * Open orders (paid or in production) created before the cutoff, oldest
 * first — the ones that belong on this week's press — and how many open
 * orders arrived after it and wait for next week.
 */
export async function listBatchOrders(
  db: SupabaseClient,
  cutoff: string
): Promise<{ orders: SwagAdminOrderView[]; later: number; truncated: boolean }> {
  const [inBatch, after] = await Promise.all([
    db
      .from('swag_orders')
      .select(ORDER_SELECT)
      .in('status', ['paid', 'in_production'])
      .lt('created_at', cutoff)
      .order('created_at', { ascending: true })
      .limit(BATCH_LIMIT + 1),
    db
      .from('swag_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['paid', 'in_production'])
      .gte('created_at', cutoff),
  ]);
  if (inBatch.error) throw new OrderError(inBatch.error.message, 500);
  if (after.error) throw new OrderError(after.error.message, 500);

  const rows = (inBatch.data ?? []) as unknown as OrderJoined[];
  return {
    orders: rows.slice(0, BATCH_LIMIT).map(toAdminOrderView),
    later: after.count ?? 0,
    truncated: rows.length > BATCH_LIMIT,
  };
}

/**
 * Send the batch to the press: every paid order created before the cutoff
 * moves to in_production in one statement. Orders already in production,
 * shipped or cancelled are untouched; the transition trigger still checks
 * each row. Returns the ids that moved.
 */
export async function startBatch(db: SupabaseClient, cutoff: string): Promise<number[]> {
  const { data, error } = await db
    .from('swag_orders')
    .update({ status: 'in_production' })
    .eq('status', 'paid')
    .lt('created_at', cutoff)
    .select('id');
  if (error) throw new OrderError(error.message, error.code === '23514' ? 409 : 500);
  return ((data ?? []) as Array<{ id: number }>).map((r) => r.id);
}

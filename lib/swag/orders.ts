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
  SWAG_SIZES,
  type SwagAdminOrderPatchBody,
  type SwagAdminOrderView,
  type SwagAdminOrdersResponse,
  type SwagAdminShipping,
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
  '*, product:swag_products!inner(sku, name_es, name_en, image_path), variant:swag_variants!inner(token_id)';

export type OrderJoined = SwagOrderRow & {
  product: { sku: string; name_es: string; name_en: string; image_path: string | null };
  variant: { token_id: number };
};

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
      'buyer_wallet' | 'buyer_email' | 'shipping' | 'tx_hash' | 'shopify_order_id' | 'shopify_line_item_id'
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
  };
}

export const ADMIN_PAGE_SIZE = 50;

const ORDER_STATUSES: readonly SwagOrderStatus[] = ['paid', 'shipped', 'delivered', 'cancelled'];
const ORDER_CHANNELS: readonly SwagOrderChannel[] = ['onchain', 'shopify', 'event'];

/**
 * A search term that is safe to put inside a PostgREST `or=()` filter. No
 * commas, parentheses or quotes — those are the filter grammar — and no
 * whitespace. `_` stays a single-character wildcard, which is harmless here.
 */
const SEARCH_TERM = /^[A-Za-z0-9@.+_-]{1,80}$/;

export interface AdminOrderFilters {
  status?: SwagOrderStatus;
  channel?: SwagOrderChannel;
  /** Matched against the design SKU, the buyer email and the buyer wallet. */
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

  const q = one('q')?.trim();
  if (q) {
    if (!SEARCH_TERM.test(q)) throw new OrderError('q may only contain letters, digits, @ . + _ -', 400);
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

  if (filters.q) {
    // The SKU lives on the design, and PostgREST cannot OR a parent column
    // with an embedded one, so resolve matching designs to ids first.
    const { data: products, error: productError } = await db
      .from('swag_products')
      .select('id')
      .ilike('sku', `%${filters.q}%`);
    if (productError) throw new OrderError(productError.message, 500);
    const ids = (products ?? []).map((p) => p.id as number);

    const clauses = [`buyer_email.ilike.*${filters.q}*`, `buyer_wallet.ilike.*${filters.q}*`];
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

const PATCHABLE_STATUSES = ['shipped', 'delivered', 'cancelled'] as const;

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
  /** Rows moved paid → shipped. */
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
 * line items or a USDC order's mirror — goes paid → shipped with the tracking
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

    if (row.status === 'paid') {
      const { error: updateError } = await db
        .from('swag_orders')
        .update({ status: 'shipped', shipping })
        .eq('id', row.id)
        .eq('status', 'paid');
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

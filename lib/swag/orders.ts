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
import { getSwagCollection, SWAG_CHAIN_ID } from './onchain';
import {
  SWAG_SIZES,
  type SwagOrderRow,
  type SwagOrderView,
  type SwagShipping,
  type SwagSize,
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

/** The design behind a tokenId on the Base collection. */
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

/** The Base deployment of a design. */
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
 * A Shopify line-item SKU → the design on Base and the size it names.
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

// ── Rows in and out ─────────────────────────────────────────────────────────

const ORDER_SELECT =
  '*, product:swag_products!inner(sku, name_es, name_en, image_path), variant:swag_variants!inner(token_id)';

type OrderJoined = SwagOrderRow & {
  product: { sku: string; name_es: string; name_en: string; image_path: string | null };
  variant: { token_id: number };
};

/** The row as the buyer may see it: no address, no email, no signature. */
export function toOrderView(row: OrderJoined): SwagOrderView {
  return {
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

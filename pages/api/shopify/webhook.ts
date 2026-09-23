/**
 * Shopify → swag_orders.
 *
 *   POST /api/shopify/webhook     topics: orders/paid, refunds/create
 *
 * Register it once in the Shopify admin (docs/SWAG_ORDERS.md has the steps).
 * There is no session here: the caller is Shopify, and the proof is the HMAC
 * over the raw request body with the webhook secret. So the body parser is
 * off — a parsed-and-reserialised body hashes differently, and "HMAC on the
 * parsed body" is the classic way this integration fails silently.
 *
 * The response discipline is the other half. Shopify retries a failing hook
 * for 48 hours and then removes the subscription, after which every card sale
 * stops producing an order row and nobody is told. So the only non-2xx
 * answers are for a request that is not from Shopify (401) or not a POST
 * (405). A database error is logged and answered 200 { ok: false }: the
 * webhook stays alive, and the order is recoverable from Shopify by hand.
 *
 * orders/paid   one row per line item whose SKU is in the catalogue. Unknown
 *               SKUs are logged and skipped — the store may sell things that
 *               are not NFTs. Idempotent on (order, line item): a redelivered
 *               webhook finds its rows already there.
 * refunds/create the matching rows go to cancelled. If a voucher had been
 *               issued and not yet redeemed, the row is flagged
 *               voucher_needs_cancel=true for an operator to burn the orderRef
 *               on chain with cancelOrder(); the ops key is not on this
 *               server, on purpose.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { createHmac, timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '../../../lib/supabase';
import {
  appendNote,
  insertOrder,
  OrderError,
  resolveVariantBySku,
} from '../../../lib/swag/orders';
import { orderRefFor } from '../../../lib/swag/voucher';
import { logger } from '../../../utils/logger';
import { SWAG_SIZES, type SwagShipping, type SwagSize } from '../../../types/swag-orders';

export const config = { api: { bodyParser: false } };

// ── Shopify payload shapes (the parts we read) ──────────────────────────────

interface ShopifyAddress {
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  province_code?: string | null;
  country_code?: string | null;
  zip?: string | null;
}

interface ShopifyLineItem {
  id: number | string;
  sku?: string | null;
  quantity?: number;
  variant_title?: string | null;
  title?: string | null;
}

interface ShopifyOrder {
  id: number | string;
  admin_graphql_api_id?: string;
  email?: string | null;
  contact_email?: string | null;
  customer?: { email?: string | null } | null;
  phone?: string | null;
  note?: string | null;
  shipping_address?: ShopifyAddress | null;
  billing_address?: ShopifyAddress | null;
  line_items?: ShopifyLineItem[];
}

interface ShopifyRefund {
  id: number | string;
  order_id: number | string;
  refund_line_items?: Array<{ line_item_id: number | string; quantity?: number }>;
}

// ── Verification ────────────────────────────────────────────────────────────

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function header(req: NextApiRequest, name: string): string {
  const value = req.headers[name];
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

/** Constant-time comparison of the base64 digests. */
function hmacMatches(raw: Buffer, provided: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(raw).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ── Mapping ─────────────────────────────────────────────────────────────────

function orderGid(order: { id: number | string; admin_graphql_api_id?: string }): string {
  return order.admin_graphql_api_id ?? `gid://shopify/Order/${order.id}`;
}

function buyerEmail(order: ShopifyOrder): string | null {
  const email = order.email || order.contact_email || order.customer?.email || '';
  const trimmed = email.trim().toLowerCase();
  return trimmed.includes('@') ? trimmed : null;
}

function toShipping(order: ShopifyOrder): SwagShipping {
  const a = order.shipping_address ?? order.billing_address ?? {};
  const name = (a.name || `${a.first_name ?? ''} ${a.last_name ?? ''}`).trim();
  const region = [a.province, a.zip].filter(Boolean).join(' ').trim();
  const shipping: SwagShipping = {
    name,
    address1: a.address1?.trim() ?? '',
    city: a.city?.trim() ?? '',
    country: (a.country_code ?? '').toUpperCase(),
  };
  const phone = (a.phone ?? order.phone ?? '').trim();
  const address2 = a.address2?.trim() ?? '';
  const notes = order.note?.trim() ?? '';
  if (phone) shipping.phone = phone;
  if (address2) shipping.address2 = address2;
  if (region) shipping.region = region;
  if (notes) shipping.notes = notes.slice(0, 500);
  return shipping;
}

/** The size Shopify's variant title names, when it is one of ours. */
function sizeFromTitle(title: string | null | undefined): SwagSize | null {
  const t = (title ?? '').trim().toUpperCase();
  return (SWAG_SIZES as readonly string[]).includes(t) ? (t as SwagSize) : null;
}

// ── Handlers ────────────────────────────────────────────────────────────────

async function onOrderPaid(order: ShopifyOrder) {
  const db = getSupabaseAdmin();
  const gid = orderGid(order);
  const email = buyerEmail(order);
  const shipping = toShipping(order);
  const result = { created: 0, existing: 0, skipped: 0 };

  if (!email) {
    // The row cannot exist without an email (it is the claim identity), and
    // the parcel still has to ship. Loud, so an operator handles it in Shopify.
    logger.error(`[shopify/webhook] ${gid} has no email; not recorded`);
    return { ...result, skipped: order.line_items?.length ?? 0 };
  }

  for (const item of order.line_items ?? []) {
    const sku = item.sku ?? '';
    const resolved = sku ? await resolveVariantBySku(db, sku) : null;
    if (!resolved) {
      logger.warn(`[shopify/webhook] ${gid} line ${item.id}: SKU "${sku}" is not in the catalogue; skipped`);
      result.skipped += 1;
      continue;
    }

    const lineItemId = String(item.id);
    const size = resolved.size ?? sizeFromTitle(item.variant_title);
    const quantity = Math.max(1, Number(item.quantity ?? 1));

    try {
      await insertOrder(db, {
        channel: 'shopify',
        product_id: resolved.variant.productId,
        variant_id: resolved.variant.variantId,
        quantity,
        size: resolved.variant.sized ? size : null,
        buyer_email: email,
        shipping,
        shopify_order_id: gid,
        shopify_line_item_id: lineItemId,
        order_ref: orderRefFor(gid, lineItemId),
      });
      result.created += 1;
    } catch (e) {
      if (e instanceof OrderError && e.status === 409) {
        // Redelivered webhook: the row is already there. That is the point.
        result.existing += 1;
        continue;
      }
      throw e;
    }
  }

  return result;
}

async function onRefundCreated(refund: ShopifyRefund) {
  const db = getSupabaseAdmin();
  const gid = `gid://shopify/Order/${refund.order_id}`;
  const result = { cancelled: 0, flagged: 0, skipped: 0 };

  for (const line of refund.refund_line_items ?? []) {
    const lineItemId = String(line.line_item_id);
    const { data: row, error } = await db
      .from('swag_orders')
      .select('id, status, quantity, voucher, claim_tx_hash, notes')
      .eq('shopify_order_id', gid)
      .eq('shopify_line_item_id', lineItemId)
      .maybeSingle();
    if (error) throw new OrderError(error.message, 500);
    if (!row || row.status === 'cancelled') {
      result.skipped += 1;
      continue;
    }

    const refunded = Number(line.quantity ?? row.quantity);
    let notes: string | null = row.notes;

    if (refunded < row.quantity) {
      // Part of the line came back. The order stays live; an operator decides.
      notes = appendNote(notes, `partial_refund=${refunded}`);
      const { error: noteError } = await db.from('swag_orders').update({ notes }).eq('id', row.id);
      if (noteError) throw new OrderError(noteError.message, 500);
      result.flagged += 1;
      continue;
    }

    if (row.claim_tx_hash) {
      // The token is already in their wallet. Nothing to burn on chain; the
      // refund itself needs a human.
      notes = appendNote(notes, 'refunded_after_claim=true');
    } else if (row.voucher) {
      // A live voucher for a refunded order. cancelOrder(orderRef) from the
      // ops key closes it; until then the flag is the queue.
      notes = appendNote(notes, 'voucher_needs_cancel=true');
    }

    const { error: updateError } = await db
      .from('swag_orders')
      .update({ status: 'cancelled', notes })
      .eq('id', row.id);
    if (updateError) {
      // delivered → cancelled is refused by the transition trigger; that too
      // is a human's decision. Flag it and keep going.
      logger.warn(`[shopify/webhook] order ${row.id}: could not cancel (${updateError.message})`);
      notes = appendNote(notes, 'refund_after_delivery=true');
      await db.from('swag_orders').update({ notes }).eq('id', row.id);
      result.flagged += 1;
      continue;
    }
    result.cancelled += 1;
    if (notes !== row.notes) result.flagged += 1;
  }

  return result;
}

// ── Route ───────────────────────────────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.toLowerCase();
  if (!secret || !storeDomain) {
    logger.error('[shopify/webhook] SHOPIFY_WEBHOOK_SECRET or SHOPIFY_STORE_DOMAIN is not set');
    return res.status(401).json({ error: 'Webhook not configured' });
  }

  const raw = await readRawBody(req);

  const provided = header(req, 'x-shopify-hmac-sha256');
  if (!provided || !hmacMatches(raw, provided, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  if (header(req, 'x-shopify-shop-domain').toLowerCase() !== storeDomain) {
    return res.status(401).json({ error: 'Unknown shop' });
  }

  const topic = header(req, 'x-shopify-topic');
  const webhookId = header(req, 'x-shopify-webhook-id');

  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    logger.error(`[shopify/webhook] ${topic} ${webhookId}: body is not JSON`);
    return res.status(200).json({ ok: false, topic });
  }

  try {
    if (topic === 'orders/paid') {
      const result = await onOrderPaid(payload as ShopifyOrder);
      return res.status(200).json({ ok: true, topic, ...result });
    }
    if (topic === 'refunds/create') {
      const result = await onRefundCreated(payload as ShopifyRefund);
      return res.status(200).json({ ok: true, topic, ...result });
    }
    // Subscribed to something we do not handle. Acknowledge so Shopify does
    // not retry, and say so in the logs.
    logger.warn(`[shopify/webhook] unhandled topic ${topic}`);
    return res.status(200).json({ ok: true, topic, ignored: true });
  } catch (e) {
    // Never a 5xx: see the header comment. The order is still in Shopify.
    logger.error(`[shopify/webhook] ${topic} ${webhookId} failed`, e);
    return res.status(200).json({ ok: false, topic });
  }
}

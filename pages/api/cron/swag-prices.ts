/**
 * Daily re-price of the card channel from the day's TRM.
 *
 *   GET /api/cron/swag-prices      Vercel cron, 12:00 UTC (vercel.json)
 *
 * The same job as `scripts/shopify-sync.mjs --prices-only`, from the database
 * instead of the catalogue file: for every active design that has a Shopify
 * product, COP = round(price_usd × TRM / 1000) × 1000, pushed with one
 * productVariantsBulkUpdate per design through repriceDesign() in
 * lib/shopify.mjs — the CLI calls the same function, so the two can never
 * disagree on a price.
 *
 * What is written back: swag_shopify_variants.price_cop (what Shopify was
 * told) and price_synced_at (when this job last confirmed it, changed or not).
 * A variant whose price_synced_at falls behind is one the job could not
 * handle; the response lists why per design. Neither column is the price of
 * record — Shopify's order is.
 *
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}` when the env var
 * is set on the project. No secret configured means the route refuses every
 * call, including Vercel's; that is the safe failure.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { fetchTrm, repriceDesign } from '../../../lib/shopify.mjs';
import { logger } from '../../../utils/logger';

interface ProductRow {
  id: number;
  sku: string;
  price_usd: number | string;
  shopify_product_id: string | null;
  active: boolean;
}

interface ShopifyVariantRow {
  id: number;
  product_id: number;
  shopify_variant_id: string;
  sku: string;
  price_cop: number | string | null;
}

interface DesignOutcome {
  sku: string;
  status: 'repriced' | 'unchanged' | 'skipped' | 'failed';
  priceCop?: number;
  from?: number | null;
  reason?: string;
}

interface Reply {
  ok: boolean;
  trm?: { rate: number; validFrom: string; validTo: string };
  designs?: DesignOutcome[];
  repriced?: number;
  unchanged?: number;
  skipped?: number;
  failed?: number;
  error?: string;
}

function authorised(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.authorization ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!authorised(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const db = getSupabaseAdmin();

  let trm: Awaited<ReturnType<typeof fetchTrm>>;
  try {
    trm = await fetchTrm();
  } catch (e) {
    // No rate, no prices. Yesterday's price stays in Shopify, which is the
    // right failure: a guessed peso figure is worse than a day-old one.
    logger.error('[cron/swag-prices] TRM unavailable', e);
    return res.status(502).json({ ok: false, error: `TRM unavailable: ${(e as Error).message}` });
  }

  const [{ data: products, error: productError }, { data: variants, error: variantError }] = await Promise.all([
    db.from('swag_products').select('id, sku, price_usd, shopify_product_id, active').eq('active', true).order('sort_order'),
    db.from('swag_shopify_variants').select('id, product_id, shopify_variant_id, sku, price_cop'),
  ]);
  if (productError || variantError) {
    const message = productError?.message ?? variantError?.message ?? 'unknown';
    logger.error('[cron/swag-prices] could not read the catalogue', message);
    return res.status(500).json({ ok: false, error: message });
  }

  const byProduct = new Map<number, ShopifyVariantRow[]>();
  for (const v of (variants ?? []) as ShopifyVariantRow[]) {
    const list = byProduct.get(v.product_id) ?? [];
    list.push(v);
    byProduct.set(v.product_id, list);
  }

  const designs: DesignOutcome[] = [];
  const syncedAt = new Date().toISOString();

  for (const product of (products ?? []) as ProductRow[]) {
    const rows = byProduct.get(product.id) ?? [];
    if (!product.shopify_product_id || rows.length === 0) {
      designs.push({ sku: product.sku, status: 'skipped', reason: 'not synced to Shopify yet' });
      continue;
    }

    try {
      const result = await repriceDesign(
        {
          designSku: product.sku,
          productId: product.shopify_product_id,
          priceUsd: product.price_usd,
          variants: rows.map((r) => ({
            sku: r.sku,
            variantId: r.shopify_variant_id,
            priceCop: r.price_cop === null ? null : Number(r.price_cop),
          })),
        },
        trm.rate
      );

      const { error } = await db
        .from('swag_shopify_variants')
        .update({ price_cop: result.priceCop, price_synced_at: syncedAt })
        .eq('product_id', product.id);
      if (error) {
        // Shopify has the new price; only our cache is behind. Say so rather
        // than counting it as a failed push — the next run converges.
        designs.push({ sku: product.sku, status: 'failed', priceCop: result.priceCop, reason: `pushed, but cache write failed: ${error.message}` });
        continue;
      }

      designs.push({
        sku: product.sku,
        status: result.changed ? 'repriced' : 'unchanged',
        priceCop: result.priceCop,
        from: result.from,
      });
    } catch (e) {
      designs.push({ sku: product.sku, status: 'failed', reason: (e as Error).message });
    }
  }

  const count = (status: DesignOutcome['status']) => designs.filter((d) => d.status === status).length;
  const failed = count('failed');
  const summary: Reply = {
    ok: failed === 0,
    trm,
    designs,
    repriced: count('repriced'),
    unchanged: count('unchanged'),
    skipped: count('skipped'),
    failed,
  };
  logger.info(
    `[cron/swag-prices] TRM ${trm.rate}: ${summary.repriced} repriced, ${summary.unchanged} unchanged, ${summary.skipped} skipped, ${failed} failed`
  );
  // 200 either way: a partial run is still a run. The body says what failed.
  return res.status(200).json(summary);
}

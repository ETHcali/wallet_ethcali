#!/usr/bin/env node
/**
 * Seed the swag catalogue into Supabase from swag-catalogue.json.
 *
 *   node --env-file=.env scripts/swag-seed-supabase.mjs ../scs-ethcali/swag-catalogue.json
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (the names the
 * app uses, see .env.example). Service role, because anon has SELECT only —
 * the catalogue is written from here and from the admin routes, never from a
 * browser.
 *
 * What it writes:
 *   swag_products   one row per design, upserted by sku. sort_order is the
 *                   design's position in the catalogue.
 *   swag_variants   one row per design on the collection's chain (from
 *                   frontend/swag-collection.json), upserted by
 *                   (product_id, chain_id). token_id is the same position.
 *                   status is 'pinned' when the design has a metadata CID and
 *                   'draft' otherwise. Pass --collection 0x… (the deployed
 *                   Swag1155 clone) to set collection_address and status 'live'.
 *   swag_shopify_variants
 *                   one row per Shopify variant, from the design's `shopify`
 *                   block written by scripts/shopify-sync.mjs. Skipped for
 *                   designs not yet synced.
 *
 * Idempotent. Re-running refreshes copy, prices and CIDs from the catalogue
 * and leaves everything the catalogue does not own alone: Shopify ids, Drive
 * links, notes, and a variant that is already 'live' is never demoted.
 * Designs that are in the database but not in the catalogue are reported and
 * left as they are — deactivating is an admin decision, not a side effect.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// The chain the app sells on, from the same file the app reads. Never typed here.
const here = path.dirname(fileURLToPath(import.meta.url));
const LAUNCH_CHAIN_ID = JSON.parse(
  fs.readFileSync(path.join(here, '..', 'frontend', 'swag-collection.json'), 'utf8')
).chainId;

const args = process.argv.slice(2);
const collectionFlag = args.indexOf('--collection');
const collection = collectionFlag >= 0 ? String(args[collectionFlag + 1] ?? '').toLowerCase() : null;
if (collectionFlag >= 0) args.splice(collectionFlag, 2);
const [cataloguePath] = args;
if (!cataloguePath || (collection !== null && !/^0x[0-9a-f]{40}$/.test(collection))) {
  console.error('usage: swag-seed-supabase.mjs <catalogue.json> [--collection 0x<deployed Swag1155 clone>]');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
const designs = catalogue.products.flatMap((p) => p.variants);
if (designs.length === 0) {
  console.error('Catalogue has no variants');
  process.exit(1);
}

const isCid = (v) => typeof v === 'string' && /^[a-zA-Z0-9]+$/.test(v);

// ── products ────────────────────────────────────────────────────────────────

const productRows = designs.map((d, i) => {
  const priceUsd = Number(d.prices?.USDC);
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    console.error(`${d.designSku}: prices.USDC is not a positive number`);
    process.exit(1);
  }
  return {
    sku: d.designSku,
    category: d.category,
    name_es: d.name.es,
    name_en: d.name.en,
    description_es: d.description.es,
    description_en: d.description.en,
    image_path: d.image ? `swags/${d.image}` : null,
    // ipfs://REPLACE / PENDING placeholders are not CIDs and must not be stored
    // as one; the guard trigger would otherwise let a placeholder promote a row.
    image_cid: isCid(d.imageCid) ? d.imageCid : null,
    metadata_cid: isCid(d.metadataCid) ? d.metadataCid : null,
    price_usd: priceUsd.toFixed(2),
    sized: Boolean(d.sized),
    sizes: d.sized ? d.sizes ?? [] : [],
    sort_order: i + 1,
    active: d.active !== false,
    // Only written when the sync has run; an upsert with undefined leaves the
    // existing value alone, so a catalogue without the block never clears ids.
    ...(d.shopify?.productId ? { shopify_product_id: d.shopify.productId, shopify_handle: d.shopify.handle } : {}),
  };
});

const { data: products, error: productError } = await supabase
  .from('swag_products')
  .upsert(productRows, { onConflict: 'sku' })
  .select('id, sku, metadata_cid, sort_order');

if (productError) {
  console.error('swag_products upsert failed:', productError.message);
  process.exit(1);
}

const productBySku = new Map(products.map((p) => [p.sku, p]));

// ── variants (launch chain) ─────────────────────────────────────────────────

const { data: existing, error: existingError } = await supabase
  .from('swag_variants')
  .select('product_id, status, collection_address')
  .eq('chain_id', LAUNCH_CHAIN_ID)
  .in('product_id', products.map((p) => p.id));

if (existingError) {
  console.error('swag_variants read failed:', existingError.message);
  process.exit(1);
}
const existingByProduct = new Map(existing.map((v) => [v.product_id, v]));

const variantRows = designs.map((d, i) => {
  const product = productBySku.get(d.designSku);
  const current = existingByProduct.get(product.id);
  // 'live' is set by the deploy path and is never demoted from here.
  const status =
    collection || current?.status === 'live' ? 'live' : product.metadata_cid ? 'pinned' : 'draft';
  return {
    product_id: product.id,
    chain_id: LAUNCH_CHAIN_ID,
    token_id: i + 1,
    status,
    ...(collection ? { collection_address: collection } : {}),
  };
});

const { data: variants, error: variantError } = await supabase
  .from('swag_variants')
  .upsert(variantRows, { onConflict: 'product_id,chain_id' })
  .select('product_id, token_id, status, collection_address');

if (variantError) {
  console.error('swag_variants upsert failed:', variantError.message);
  process.exit(1);
}
const variantByProduct = new Map(variants.map((v) => [v.product_id, v]));

// ── shopify variants ────────────────────────────────────────────────────────

const shopifyRows = designs.flatMap((d) =>
  (d.shopify?.variants ?? []).map((v) => ({
    product_id: productBySku.get(d.designSku).id,
    shopify_variant_id: v.variantId,
    shopify_inventory_item_id: v.inventoryItemId ?? null,
    sku: v.sku,
    size: v.size ?? null,
    price_cop: v.priceCop ?? null,
    price_synced_at: d.shopify.syncedAt ?? null,
  }))
);
let shopifyCount = 0;
if (shopifyRows.length > 0) {
  const { data, error } = await supabase
    .from('swag_shopify_variants')
    .upsert(shopifyRows, { onConflict: 'shopify_variant_id' })
    .select('id');
  if (error) {
    console.error('swag_shopify_variants upsert failed:', error.message);
    process.exit(1);
  }
  shopifyCount = data.length;
}

// ── report ──────────────────────────────────────────────────────────────────

console.table(
  designs.map((d) => {
    const p = productBySku.get(d.designSku);
    const v = variantByProduct.get(p.id);
    return {
      sku: d.designSku,
      product_id: p.id,
      sort: p.sort_order,
      token_id: v.token_id,
      status: v.status,
      metadata_cid: p.metadata_cid ? `${p.metadata_cid.slice(0, 12)}…` : '—',
      collection: v.collection_address ?? '—',
    };
  })
);

const { data: orphans, error: orphanError } = await supabase
  .from('swag_products')
  .select('sku, active')
  .not('sku', 'in', `(${designs.map((d) => d.designSku).join(',')})`);

if (orphanError) {
  console.error('orphan check failed:', orphanError.message);
} else if (orphans.length > 0) {
  console.log(
    `${orphans.length} product(s) in the database are not in this catalogue and were left untouched:`
  );
  for (const o of orphans) console.log(`  ${o.sku}${o.active ? '' : ' (inactive)'}`);
}

const pinned = variants.filter((v) => v.status !== 'draft').length;
console.log(
  `done. ${products.length} products, ${variants.length} variants on chain ${LAUNCH_CHAIN_ID}, ${pinned} pinned or live, ${shopifyCount} shopify variants.`
);

#!/usr/bin/env node
/**
 * Sync the swag catalogue into Shopify (the fiat channel) and write the
 * resulting Shopify ids back into the catalogue.
 *
 *   node --env-file=.env scripts/shopify-sync.mjs --dry-run       # print the plan, mutate nothing
 *   node --env-file=.env scripts/shopify-sync.mjs                 # create/update every design
 *   node --env-file=.env scripts/shopify-sync.mjs --prices-only   # re-price from today's TRM (daily job)
 *   node --env-file=.env scripts/shopify-sync.mjs --catalogue <path>
 *
 * One design (catalogue variant) = ONE Shopify product, handle = designSku
 * lowercased. Sized designs get a "Talla" option with one Shopify variant per
 * size (SKU `<designSku>-<SIZE>`); unsized designs get one variant (SKU
 * `<designSku>`). Everything is created as DRAFT — the store is not launching
 * from this script.
 *
 * Price rule: COP = round(USD × TRM, nearest 1,000). The TRM is the
 * Superintendencia Financiera rate from datos.gov.co, the same dataset and the
 * same query the app serves at /api/fx/trm. Not an exchange mid-price: the TRM
 * is the rate a Colombian tax document has to use.
 *
 * Inventory is set ABSOLUTELY (on_hand = voucherCap) at the store's primary
 * location via inventorySetQuantities, never by delta, so a re-run converges
 * instead of drifting. Idempotent: re-running updates in place, matching
 * existing Shopify variants by SKU; the product image is only sent when the
 * product has no media yet, so re-runs do not stack duplicate images.
 *
 * Operations (Admin GraphQL 2026-07): location, productByIdentifier,
 * productSet, inventorySetQuantities, productVariantsBulkUpdate.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gql } from '../lib/shopify.mjs';

// ---------------------------------------------------------------- arguments

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PRICES_ONLY = args.includes('--prices-only');
const catalogueArg = args[args.indexOf('--catalogue') + 1];
const CATALOGUE =
  args.includes('--catalogue') && catalogueArg
    ? path.resolve(catalogueArg)
    : path.resolve(import.meta.dirname, '../../scs-ethcali/swag-catalogue.json');

const IMAGE_BASE = 'https://ethcali.org/swags/';
const VENDOR = 'ETH Cali';
const COLLECTION_TAG = 'swag-2026';
const OPTION_NAME = 'Talla';
const TRM_DATASET = 'https://www.datos.gov.co/resource/32sa-8pi3.json';

// ---------------------------------------------------------------- catalogue

if (!fs.existsSync(CATALOGUE)) {
  console.error(`Catalogue not found: ${CATALOGUE}`);
  process.exit(1);
}
const catalogue = JSON.parse(fs.readFileSync(CATALOGUE, 'utf8'));
const designs = catalogue.products.flatMap((p) => p.variants);

/** Same serialisation as scripts/swag-pin.mjs — 2-space JSON, trailing newline. */
function save() {
  fs.writeFileSync(CATALOGUE, JSON.stringify(catalogue, null, 2) + '\n');
}

// ---------------------------------------------------------------- TRM

/**
 * Latest published TRM. Mirrors fetchTrm() in pages/api/fx/trm.ts (no date):
 * newest row by vigenciadesde. The rate carries a validity range; we print it
 * so the number on a price can be traced to the window it came from.
 */
async function fetchTrm() {
  const res = await fetch(`${TRM_DATASET}?$limit=1&$order=vigenciadesde%20DESC`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`datos.gov.co responded ${res.status}`);
  const [row] = await res.json();
  if (!row) throw new Error('no TRM rows returned');
  const rate = Number(row.valor);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`unusable TRM value "${row.valor}"`);
  return { rate, validFrom: row.vigenciadesde.slice(0, 10), validTo: row.vigenciahasta.slice(0, 10) };
}

/** COP price = USD × TRM rounded to the nearest 1,000 COP. */
function copPrice(usd, trm) {
  const n = Number(usd);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`bad USD price "${usd}"`);
  const cop = Math.round((n * trm) / 1000) * 1000;
  if (!Number.isFinite(cop) || cop <= 0) throw new Error(`bad COP price from USD ${usd} × TRM ${trm}`);
  return cop;
}

const fmtCop = (n) => `COP ${n.toLocaleString('en-US')}`;

// ---------------------------------------------------------------- plan

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildPlan(design, trm) {
  const handle = design.designSku.toLowerCase();
  const priceCop = copPrice(design.prices.USDC, trm);
  const sizes = design.sized ? design.sizes : [];
  if (design.sized && sizes.length === 0) throw new Error(`${design.designSku}: sized but no sizes`);

  const variants = design.sized
    ? sizes.map((size) => ({
        sku: `${design.designSku}-${size}`,
        size,
        priceCop,
        optionValues: [{ optionName: OPTION_NAME, name: size }],
      }))
    : [
        {
          sku: design.designSku,
          size: null,
          priceCop,
          optionValues: [{ optionName: 'Title', name: 'Default Title' }],
        },
      ];

  const productOptions = design.sized
    ? [{ name: OPTION_NAME, values: sizes.map((s) => ({ name: s })) }]
    : [{ name: 'Title', values: [{ name: 'Default Title' }] }];

  const descriptionHtml =
    `<p>${escapeHtml(design.description.es)}</p>` +
    `<p><em>${escapeHtml(design.name.en)}</em> — ${escapeHtml(design.description.en)}</p>`;

  return {
    designSku: design.designSku,
    handle,
    title: design.name.es,
    descriptionHtml,
    productType: design.category,
    vendor: VENDOR,
    tags: [design.category, COLLECTION_TAG],
    imageSource: `${IMAGE_BASE}${design.image}`,
    imageAlt: design.name.es,
    productOptions,
    variants,
    onHand: design.voucherCap,
    priceCop,
  };
}

/**
 * ethcali.org 307s to its canonical host. Shopify's media importer is not
 * guaranteed to follow that, so hand it the final URL and confirm it is an
 * image before asking Shopify to fetch it.
 */
const resolvedImages = new Map();
async function resolveImage(url) {
  if (resolvedImages.has(url)) return resolvedImages.get(url);
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  const type = res.headers.get('content-type') ?? '';
  if (!res.ok || !type.startsWith('image/')) {
    throw new Error(`image not reachable: ${url} → HTTP ${res.status} ${type}`);
  }
  resolvedImages.set(url, res.url);
  return res.url;
}

// ---------------------------------------------------------------- GraphQL documents (validated against 2026-07)

const PRIMARY_LOCATION = /* GraphQL */ `
  query PrimaryLocation {
    location {
      id
      name
      isActive
    }
  }
`;

const PRODUCT_BY_HANDLE = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    productByIdentifier(identifier: { handle: $handle }) {
      id
      handle
      status
      mediaCount {
        count
      }
      variants(first: 20) {
        nodes {
          id
          sku
          price
          inventoryItem {
            id
          }
        }
      }
    }
  }
`;

const PRODUCT_SET = /* GraphQL */ `
  mutation SwagProductSet($input: ProductSetInput!) {
    productSet(input: $input) {
      product {
        id
        handle
        status
        variants(first: 20) {
          nodes {
            id
            sku
            price
            inventoryItem {
              id
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const ON_HAND = /* GraphQL */ `
  query SwagOnHand($ids: [ID!]!, $locationId: ID!) {
    nodes(ids: $ids) {
      ... on InventoryItem {
        id
        inventoryLevel(locationId: $locationId) {
          quantities(names: ["on_hand"]) {
            name
            quantity
          }
        }
      }
    }
  }
`;

const SET_ON_HAND = /* GraphQL */ `
  mutation SwagSetOnHand($input: InventorySetQuantitiesInput!, $key: String!) {
    inventorySetQuantities(input: $input) @idempotent(key: $key) {
      inventoryAdjustmentGroup {
        changes {
          name
          delta
          quantityAfterChange
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const UPDATE_PRICES = /* GraphQL */ `
  mutation SwagUpdatePrices($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        sku
        price
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

// ---------------------------------------------------------------- sync

/** Current on_hand per inventory item at one location; 0 when not stocked there yet. */
async function readOnHand(inventoryItemIds, locationId) {
  const { nodes } = await gql(ON_HAND, { ids: inventoryItemIds, locationId });
  return new Map(
    nodes.map((n) => [n.id, n.inventoryLevel?.quantities.find((q) => q.name === 'on_hand')?.quantity ?? 0])
  );
}

/**
 * Set on_hand = target for every item, absolutely. 2026-07 makes
 * compare-and-swap mandatory (changeFromQuantity on each item), so we read
 * the current value first and send it back; a concurrent edit in the admin
 * surfaces as CHANGE_FROM_QUANTITY_STALE and we re-read once. Items already
 * at target are skipped. Returns the number of items changed.
 */
async function setOnHand(designSku, inventoryItemIds, locationId, target, attempt = 0) {
  const current = await readOnHand(inventoryItemIds, locationId);
  const quantities = inventoryItemIds
    .filter((id) => current.get(id) !== target)
    .map((id) => ({ inventoryItemId: id, locationId, quantity: target, changeFromQuantity: current.get(id) }));
  if (quantities.length === 0) return 0;
  try {
    await gql(SET_ON_HAND, {
      input: {
        name: 'on_hand',
        reason: 'correction',
        referenceDocumentUri: `gid://ethcali-swag-sync/SwagCatalogue/${designSku}`,
        quantities,
      },
      key: crypto.randomUUID(),
    });
  } catch (e) {
    if (attempt === 0 && /CHANGE_FROM_QUANTITY_STALE/.test(e.message)) {
      return setOnHand(designSku, inventoryItemIds, locationId, target, 1);
    }
    throw e;
  }
  return quantities.length;
}

async function fullSync(design, plan, locationId) {
  const existing = (await gql(PRODUCT_BY_HANDLE, { handle: plan.handle })).productByIdentifier;
  const existingBySku = new Map((existing?.variants.nodes ?? []).map((v) => [v.sku, v]));

  const input = {
    title: plan.title,
    descriptionHtml: plan.descriptionHtml,
    productType: plan.productType,
    vendor: plan.vendor,
    tags: plan.tags,
    productOptions: plan.productOptions,
    variants: plan.variants.map((v) => ({
      ...(existingBySku.get(v.sku) ? { id: existingBySku.get(v.sku).id } : {}),
      sku: v.sku,
      price: String(v.priceCop),
      inventoryPolicy: 'DENY',
      inventoryItem: { tracked: true },
      optionValues: v.optionValues,
    })),
  };

  if (existing) {
    // Update in place. Status is left alone on purpose: if someone activates a
    // product in the admin, a re-sync must not quietly put it back to draft.
    input.id = existing.id;
  } else {
    input.handle = plan.handle;
    input.status = 'DRAFT';
  }

  // Only send the image when the product has none. productSet's `files` is
  // additive across runs, and one product should carry one image.
  const needsImage = !existing || existing.mediaCount.count === 0;
  if (needsImage) {
    input.files = [
      { originalSource: await resolveImage(plan.imageSource), contentType: 'IMAGE', alt: plan.imageAlt },
    ];
  }

  const { product } = (await gql(PRODUCT_SET, { input })).productSet;
  const bySku = new Map(product.variants.nodes.map((v) => [v.sku, v]));
  for (const v of plan.variants) {
    if (!bySku.has(v.sku)) throw new Error(`${plan.designSku}: Shopify returned no variant for SKU ${v.sku}`);
  }

  // Absolute on-hand at the primary location. Tracking was turned on above.
  const inventoryItemIds = plan.variants.map((v) => bySku.get(v.sku).inventoryItem.id);
  const onHandChanges = await setOnHand(plan.designSku, inventoryItemIds, locationId, plan.onHand);

  design.shopify = {
    productId: product.id,
    handle: product.handle,
    variants: plan.variants.map((v) => ({
      sku: v.sku,
      size: v.size,
      variantId: bySku.get(v.sku).id,
      inventoryItemId: bySku.get(v.sku).inventoryItem.id,
      priceCop: v.priceCop,
    })),
    syncedAt: new Date().toISOString(),
  };
  save();

  console.log(
    `${existing ? 'updated' : 'created'} ${product.handle} (${product.status}) — ` +
      `${plan.variants.length} variant(s) @ ${fmtCop(plan.priceCop)}, on hand ${plan.onHand} each ` +
      `(${onHandChanges} set), image ${needsImage ? 'sent' : 'kept'}`
  );
}

async function pricesOnly(design, plan) {
  const s = design.shopify;
  if (!s?.productId || !s.variants?.length) {
    console.warn(`SKIP ${plan.designSku}: no shopify block in catalogue — run a full sync first`);
    return false;
  }
  const bySku = new Map(s.variants.map((v) => [v.sku, v]));
  const missing = plan.variants.filter((v) => !bySku.has(v.sku)).map((v) => v.sku);
  if (missing.length) {
    console.warn(`SKIP ${plan.designSku}: SKUs not in catalogue shopify block: ${missing.join(', ')}`);
    return false;
  }
  const unchanged = plan.variants.every((v) => bySku.get(v.sku).priceCop === v.priceCop);
  if (unchanged) {
    console.log(`unchanged ${s.handle} @ ${fmtCop(plan.priceCop)}`);
    return true;
  }
  await gql(UPDATE_PRICES, {
    productId: s.productId,
    variants: plan.variants.map((v) => ({ id: bySku.get(v.sku).variantId, price: String(v.priceCop) })),
  });
  for (const v of plan.variants) bySku.get(v.sku).priceCop = v.priceCop;
  s.syncedAt = new Date().toISOString();
  save();
  console.log(`repriced ${s.handle}: ${fmtCop(bySku.get(plan.variants[0].sku).priceCop)} → ${fmtCop(plan.priceCop)}`);
  return true;
}

// ---------------------------------------------------------------- main

const trm = await fetchTrm();
console.log(
  `TRM ${trm.rate} COP/USD (Superfinanciera via datos.gov.co, valid ${trm.validFrom}` +
    `${trm.validTo !== trm.validFrom ? ` → ${trm.validTo}` : ''})`
);

const plans = designs.map((d) => buildPlan(d, trm.rate));

const byCategory = new Map();
for (const p of plans) {
  const key = `${p.productType} (USD ${designs.find((d) => d.designSku === p.designSku).prices.USDC})`;
  byCategory.set(key, p.priceCop);
}
console.log('Price per category:');
for (const [k, v] of byCategory) console.log(`  ${k.padEnd(22)} → ${fmtCop(v)}`);
console.log('');

if (DRY_RUN) {
  console.log(`DRY RUN — ${PRICES_ONLY ? 'prices only' : 'full sync'}, ${plans.length} design(s), catalogue ${CATALOGUE}\n`);
  for (const p of plans) {
    if (PRICES_ONLY) {
      const s = designs.find((d) => d.designSku === p.designSku).shopify;
      const from = s?.variants?.[0]?.priceCop;
      console.log(
        `${p.handle.padEnd(36)} ${s ? `${fmtCop(from)} → ${fmtCop(p.priceCop)}${from === p.priceCop ? ' (unchanged)' : ''}` : 'no shopify block — would skip'}`
      );
      continue;
    }
    let image;
    try {
      image = await resolveImage(p.imageSource);
    } catch (e) {
      image = `!! ${e.message}`;
    }
    console.log(`${p.handle}`);
    console.log(`  title      ${p.title}`);
    console.log(`  type/tags  ${p.productType} · ${p.tags.join(', ')} · vendor ${p.vendor} · DRAFT`);
    console.log(`  image      ${image}`);
    console.log(`  option     ${p.productOptions[0].name}: ${p.productOptions[0].values.map((v) => v.name).join(', ')}`);
    for (const v of p.variants) {
      console.log(`  variant    ${v.sku.padEnd(34)} ${fmtCop(v.priceCop).padEnd(14)} on hand ${p.onHand}  DENY  tracked`);
    }
  }
  console.log('\nNothing was sent to Shopify.');
  process.exit(0);
}

let failures = 0;

if (PRICES_ONLY) {
  console.log(`Repricing ${plans.length} design(s)…`);
  for (const p of plans) {
    const design = designs.find((d) => d.designSku === p.designSku);
    try {
      if (!(await pricesOnly(design, p))) failures++;
    } catch (e) {
      failures++;
      console.error(`FAIL ${p.designSku}: ${e.message}`);
    }
  }
} else {
  const location = (await gql(PRIMARY_LOCATION)).location;
  if (!location?.isActive) throw new Error(`primary location missing or inactive: ${JSON.stringify(location)}`);
  console.log(`Primary location: ${location.name} (${location.id})`);
  console.log(`Syncing ${plans.length} design(s)…`);
  for (const p of plans) {
    const design = designs.find((d) => d.designSku === p.designSku);
    try {
      await fullSync(design, p, location.id);
    } catch (e) {
      failures++;
      console.error(`FAIL ${p.designSku}: ${e.message}`);
    }
  }
}

console.log(failures ? `\nDone with ${failures} failure(s).` : '\nDone.');
process.exit(failures ? 1 : 0);

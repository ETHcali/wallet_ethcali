#!/usr/bin/env node
/**
 * Dry-run of the Shopify mirror for a USDC swag order.
 *
 * Builds the exact `orderCreate` variables POST /api/swag/orders would send
 * for a fake Purchased log, prints them, and never talks to Shopify or
 * Supabase. The variant lookup needs the service key, which is not in a local
 * .env, so the Shopify variant GID is an argument.
 *
 *   node scripts/swag-mirror-selftest.mjs --dry-run --variant gid://shopify/ProductVariant/123 \
 *        [--paid 22500000] [--qty 1] [--size M] [--trm 4100.25] [--email buyer@example.com] \
 *        [--minimal] [--validator /path/to/shopify-admin/scripts/validate.mjs]
 *
 *   --paid       total USDC in base units (6 decimals), as the Purchased log has it. Default 22500000 (= 22.50 USDC).
 *   --trm        skip the live TRM fetch and use this COP/USD rate.
 *   --minimal    build the second-attempt variables (address without phone/province).
 *   --validator  also run the shopify-admin skill's validate.mjs on the mutation document (API 2026-07).
 *
 * Loads lib/swag/shopifyMirror.ts directly: Node ≥ 22.18 strips types natively.
 * Node prints a MODULE_TYPELESS_PACKAGE_JSON warning because the app's
 * package.json has no "type": "module"; it is harmless here.
 */
import { spawnSync } from 'node:child_process';
import { ORDER_CREATE, buildOrderCreateVariables, copAmounts } from '../lib/swag/shopifyMirror.ts';
import { fetchTrm } from '../lib/shopify.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};

if (!flag('dry-run')) {
  console.error('This script only has a dry run. Pass --dry-run (nothing is ever created in Shopify).');
  process.exit(1);
}

const variant = opt('variant');
if (!variant || !variant.startsWith('gid://shopify/ProductVariant/')) {
  console.error('--variant gid://shopify/ProductVariant/<id> is required (swag_shopify_variants.shopify_variant_id).');
  process.exit(1);
}

const size = opt('size', null);
const purchase = {
  txHash: '0x' + 'ab'.repeat(32),
  tokenId: opt('token', '7'),
  buyerWallet: '0x' + '11'.repeat(20),
  paidUsdc: opt('paid', '22500000'),
  quantity: Number(opt('qty', '1')),
  shopifyVariantId: variant,
  sku: opt('sku', 'ETHCALI-TEE-DOGE-MERKLE-2026'),
  size: size ? size.toUpperCase() : null,
  shipping: {
    name: 'Ada Lovelace',
    phone: '+57 300 123 4567',
    address1: 'Calle 5 # 38-25',
    address2: 'Apto 402',
    city: 'Cali',
    region: 'Valle del Cauca',
    country: 'CO',
    notes: 'Portería, dejar con el vigilante',
  },
  email: opt('email', null),
};

let trm;
const trmArg = opt('trm');
if (trmArg) {
  trm = { rate: Number(trmArg), validFrom: 'fixed', validTo: 'fixed' };
} else {
  try {
    trm = await fetchTrm();
  } catch (e) {
    console.error(`Could not fetch the TRM (${e.message}). Pass --trm <rate> to run offline.`);
    process.exit(1);
  }
}

const pricing = copAmounts(purchase.paidUsdc, purchase.quantity, trm);
const variables = buildOrderCreateVariables(purchase, trm, { minimalAddress: flag('minimal') });

console.log('── Pricing ─────────────────────────────────────────────────────────────');
console.log(`TRM ${trm.rate} (${trm.validFrom} → ${trm.validTo})`);
console.log(`${pricing.totalUsdc} USDC for ${purchase.quantity} × ${pricing.unitUsdc} → COP ${pricing.unitCop} each, COP ${pricing.totalCop} total`);
console.log('── Mutation ────────────────────────────────────────────────────────────');
console.log(ORDER_CREATE.trim());
console.log('── Variables ───────────────────────────────────────────────────────────');
console.log(JSON.stringify(variables, null, 2));

// Sanity checks the route relies on.
const line = variables.order.lineItems[0];
const tx = variables.order.transactions[0];
const unit = BigInt(line.priceSet.shopMoney.amount.replace('.', ''));
const total = BigInt(tx.amountSet.shopMoney.amount.replace('.', ''));
const checks = [
  ['line × quantity equals transaction amount', unit * BigInt(line.quantity) === total],
  ['tag usdc-onchain present', variables.order.tags.includes('usdc-onchain')],
  ['gateway is "USDC on Base"', tx.gateway === 'USDC on Base'],
  ['inventory bypassed, no receipts', variables.options.inventoryBehaviour === 'BYPASS' && variables.options.sendReceipt === false && variables.options.sendFulfillmentReceipt === false],
  ['note carries the tx hash', variables.order.note.includes(purchase.txHash)],
  ['no email key unless given', purchase.email ? variables.order.email === purchase.email : !('email' in variables.order)],
];
let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failed += 1;
}

const validator = opt('validator');
if (validator) {
  console.log('── validate.mjs (2026-07) ──────────────────────────────────────────────');
  const r = spawnSync(process.execPath, [validator, '--code', ORDER_CREATE, '--version', '2026-07', '--client-name', 'swag-mirror-selftest', '--client-version', '1.0'], {
    encoding: 'utf8',
  });
  process.stdout.write(r.stdout ?? '');
  process.stderr.write(r.stderr ?? '');
  if (r.status !== 0) failed += 1;
}

process.exit(failed ? 1 : 0);

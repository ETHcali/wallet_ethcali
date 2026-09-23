/**
 * Shopify Admin GraphQL client for scripts (Node, ESM, no dependencies).
 *
 * The app is a Dev Dashboard custom app, so there is no static admin token:
 * client credentials are exchanged for a 24h access token on demand and cached
 * in-process. Nothing here ever logs a token or a secret.
 *
 *   import { gql, getAccessToken } from '../lib/shopify.mjs';
 *
 * `gql` throws on BOTH error channels — top-level `errors` (malformed query,
 * auth, throttling) and per-mutation `userErrors` (business rejection). A
 * mutation can come back HTTP 200 with `errors: null` and still have done
 * nothing; checking only one channel is how silent no-ops ship.
 *
 * Rate limit: Shopify's GraphQL bucket is cost-based (Basic: 1000 points,
 * refills 50/s). Every response carries `extensions.cost.throttleStatus`; when
 * the bucket runs low we sleep until it has refilled enough, and a THROTTLED
 * error is retried after the same wait rather than surfaced.
 */

const REQUIRED = ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_CLIENT_ID', 'SHOPIFY_CLIENT_SECRET', 'SHOPIFY_API_VERSION'];

function env() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
  return {
    domain: process.env.SHOPIFY_STORE_DOMAIN,
    clientId: process.env.SHOPIFY_CLIENT_ID,
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
    version: process.env.SHOPIFY_API_VERSION,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** In-process token cache: { token, expiresAt (ms epoch) }. */
let cached = null;

/**
 * Client-credentials grant → 24h access token. Cached until 60s before expiry.
 * Only works when the app is installed on the store and both belong to the
 * same Shopify organisation.
 */
export async function getAccessToken() {
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.token;
  const { domain, clientId, clientSecret } = env();
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    // Never echo the body verbatim: strip anything token-shaped before logging.
    const { access_token: _t, ...rest } = body;
    throw new Error(`Shopify token exchange failed: HTTP ${res.status} ${JSON.stringify(rest)}`);
  }
  cached = { token: body.access_token, expiresAt: Date.now() + Number(body.expires_in ?? 86_400) * 1000 };
  return cached.token;
}

/**
 * Walk a mutation's `data` and collect every non-empty `userErrors` array.
 * Root fields of a mutation are the only place Shopify puts them, but nested
 * operations (e.g. productSetOperation.userErrors) exist too, so recurse.
 */
function collectUserErrors(node, path = [], out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    node.forEach((n, i) => collectUserErrors(n, [...path, i], out));
    return out;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'userErrors' && Array.isArray(v) && v.length) {
      out.push({ path: path.join('.'), errors: v });
    } else {
      collectUserErrors(v, [...path, k], out);
    }
  }
  return out;
}

/** Keep this much headroom in the bucket before firing the next request. */
const MIN_AVAILABLE = 200;

async function throttleWait(throttleStatus) {
  if (!throttleStatus) return;
  const { currentlyAvailable, restoreRate } = throttleStatus;
  if (typeof currentlyAvailable !== 'number' || currentlyAvailable >= MIN_AVAILABLE) return;
  const rate = restoreRate > 0 ? restoreRate : 50;
  const ms = Math.ceil(((MIN_AVAILABLE - currentlyAvailable) / rate) * 1000);
  process.stderr.write(`[shopify] bucket low (${currentlyAvailable} pts), sleeping ${ms}ms\n`);
  await sleep(ms);
}

/**
 * Execute one GraphQL document. Returns `data`. Throws on HTTP failure,
 * top-level errors, or any non-empty userErrors.
 *
 * @param {string} query
 * @param {Record<string, unknown>} [variables]
 * @param {{ retries?: number }} [opts]
 */
export async function gql(query, variables = {}, opts = {}) {
  const { domain, version } = env();
  const retries = opts.retries ?? 3;
  const token = await getAccessToken();

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const body = await res.json().catch(() => ({}));
    const throttleStatus = body?.extensions?.cost?.throttleStatus;

    const throttled =
      res.status === 429 ||
      (Array.isArray(body.errors) && body.errors.some((e) => e?.extensions?.code === 'THROTTLED'));
    if (throttled && attempt < retries) {
      const cost = body?.extensions?.cost?.requestedQueryCost ?? MIN_AVAILABLE;
      const rate = throttleStatus?.restoreRate || 50;
      const ms = Math.ceil((cost / rate) * 1000) + 250;
      process.stderr.write(`[shopify] throttled, retrying in ${ms}ms\n`);
      await sleep(ms);
      continue;
    }

    if (!res.ok) throw new Error(`Shopify HTTP ${res.status}: ${JSON.stringify(body.errors ?? body)}`);
    if (body.errors?.length) throw new Error(`Shopify GraphQL errors: ${JSON.stringify(body.errors)}`);

    const userErrors = collectUserErrors(body.data);
    if (userErrors.length) throw new Error(`Shopify userErrors: ${JSON.stringify(userErrors)}`);

    await throttleWait(throttleStatus);
    return body.data;
  }
}

// ── Pricing: the TRM and the one rule ───────────────────────────────────────
//
// Shared by scripts/shopify-sync.mjs (--prices-only, from the catalogue file)
// and pages/api/cron/swag-prices.ts (daily, from swag_shopify_variants). Both
// call repriceDesign() so there is exactly one place the peso price is decided.

const TRM_DATASET = 'https://www.datos.gov.co/resource/32sa-8pi3.json';

/**
 * Latest published TRM. Mirrors fetchTrm() in pages/api/fx/trm.ts (no date):
 * newest row by vigenciadesde. The rate carries a validity range; it is
 * returned so the number on a price can be traced to the window it came from.
 *
 * @returns {Promise<{ rate: number, validFrom: string, validTo: string }>}
 */
export async function fetchTrm() {
  const res = await fetch(`${TRM_DATASET}?$limit=1&$order=vigenciadesde%20DESC`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`datos.gov.co responded ${res.status}`);
  const [row] = await res.json();
  if (!row) throw new Error('no TRM rows returned');
  const rate = Number(row.valor);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`unusable TRM value "${row.valor}"`);
  return { rate, validFrom: String(row.vigenciadesde).slice(0, 10), validTo: String(row.vigenciahasta).slice(0, 10) };
}

/**
 * COP price = USD × TRM rounded to the nearest 1,000 COP.
 *
 * @param {number | string} usd
 * @param {number} trm
 * @returns {number}
 */
export function copPrice(usd, trm) {
  const n = Number(usd);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`bad USD price "${usd}"`);
  const cop = Math.round((n * trm) / 1000) * 1000;
  if (!Number.isFinite(cop) || cop <= 0) throw new Error(`bad COP price from USD ${usd} × TRM ${trm}`);
  return cop;
}

/** @param {number} n */
export const fmtCop = (n) => `COP ${n.toLocaleString('en-US')}`;

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

/**
 * @typedef {object} RepriceDesign
 * @property {string} designSku   The design's SKU, for messages.
 * @property {string} productId   Shopify product GID.
 * @property {number | string} priceUsd  List price in USD.
 * @property {Array<{ sku: string, variantId: string, priceCop: number | null }>} variants
 *   Every Shopify variant of the design with the COP price last pushed (null if never).
 */

/**
 * @typedef {object} RepriceResult
 * @property {string} designSku
 * @property {number} priceCop    What Shopify now has.
 * @property {number | null} from What it had before (first variant), null if unknown.
 * @property {boolean} changed    False when every variant already carried priceCop.
 */

/**
 * Push one design's COP price to Shopify when it differs from what was last
 * pushed. One productVariantsBulkUpdate per design — every size of a design
 * costs the same. Throws on a Shopify error (gql surfaces both channels).
 *
 * @param {RepriceDesign} design
 * @param {number} trm
 * @returns {Promise<RepriceResult>}
 */
export async function repriceDesign(design, trm) {
  if (!design.productId) throw new Error(`${design.designSku}: no Shopify product id`);
  if (!design.variants?.length) throw new Error(`${design.designSku}: no Shopify variants`);
  const priceCop = copPrice(design.priceUsd, trm);
  const from = design.variants[0].priceCop ?? null;
  const changed = design.variants.some((v) => v.priceCop !== priceCop);
  if (!changed) return { designSku: design.designSku, priceCop, from, changed: false };
  await gql(UPDATE_PRICES, {
    productId: design.productId,
    variants: design.variants.map((v) => ({ id: v.variantId, price: String(priceCop) })),
  });
  return { designSku: design.designSku, priceCop, from, changed: true };
}

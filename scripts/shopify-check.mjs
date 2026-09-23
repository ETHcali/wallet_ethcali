#!/usr/bin/env node
/**
 * Smoke test for the Shopify credentials.
 *
 *   node --env-file=.env scripts/shopify-check.mjs
 *
 * Dev Dashboard custom apps have no static admin token. This exchanges the
 * client credentials for a 24h access token, then reads the shop. Prints the
 * shop it connected to and the granted scopes, never any secret.
 */
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
const version = process.env.SHOPIFY_API_VERSION;

const missing = [
  ['SHOPIFY_STORE_DOMAIN', domain],
  ['SHOPIFY_CLIENT_ID', clientId],
  ['SHOPIFY_CLIENT_SECRET', clientSecret],
  ['SHOPIFY_API_VERSION', version],
]
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Missing env: ${missing.join(', ')}`);
  process.exit(1);
}

// Step 1: client credentials grant. Only works when the app is installed on
// the store and both belong to the same Shopify organisation.
const grant = await fetch(`https://${domain}/admin/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  }),
});
const grantBody = await grant.json().catch(() => ({}));
if (!grant.ok || !grantBody.access_token) {
  console.error(
    `Token exchange failed: HTTP ${grant.status}`,
    JSON.stringify({ ...grantBody, access_token: undefined })
  );
  console.error(
    'Check: is the app installed on this store? Is the domain the .myshopify.com one? Are client id and secret from Settings → Credentials?'
  );
  process.exit(1);
}
console.log(`Token OK, expires in ${grantBody.expires_in}s, scopes: ${grantBody.scope}`);

// Step 2: read the shop with it.
const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
  method: 'POST',
  headers: {
    'X-Shopify-Access-Token': grantBody.access_token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query:
      '{ shop { name myshopifyDomain currencyCode primaryDomain { host } plan { displayName } } }',
  }),
});
const body = await res.json().catch(() => ({}));
if (!res.ok || body.errors) {
  console.error(`HTTP ${res.status}`, JSON.stringify(body.errors ?? body));
  process.exit(1);
}
console.log(JSON.stringify(body.data.shop, null, 2));

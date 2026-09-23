#!/usr/bin/env node
/**
 * Make the Shopify storefront checkout-only.
 *
 * The catalogue lives on ethcali.org and in the app; Shopify is the card
 * checkout and nothing else. Every storefront template of the MAIN theme is
 * replaced by one section that sends the visitor to the website, so
 * store.ethcali.org/, /products/*, /collections/*, /cart, /search, pages and
 * blog all bounce. Checkout (/checkouts/*) and cart permalinks
 * (/cart/<variant>:<qty>, which 302 straight into checkout) are untouched:
 * they never render these templates.
 *
 *   node --env-file=.env scripts/shopify-checkout-only.mjs --dry-run
 *   node --env-file=.env scripts/shopify-checkout-only.mjs
 *   node --env-file=.env scripts/shopify-checkout-only.mjs --restore   # put the original templates back
 *
 * Needs the app scopes read_themes + write_themes. The original template
 * files are saved to scripts/.shopify-theme-backup/<themeId>/ before the first
 * overwrite so --restore can undo it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { gql } from '../lib/shopify.mjs';

const DEST = 'https://www.ethcali.org/swag';
const dryRun = process.argv.includes('--dry-run');
const restore = process.argv.includes('--restore');

const TEMPLATES = [
  'index', 'product', 'collection', 'list-collections', 'cart', 'search', 'page', 'blog', 'article', '404',
];

const SECTION = `{%- comment -%}
  ETH Cali: this storefront is checkout-only. The catalogue lives on
  ethcali.org and in app.ethcali.org. Managed by
  wallet_ethcali/scripts/shopify-checkout-only.mjs — do not edit in the theme editor.
{%- endcomment -%}
<script>window.location.replace(${JSON.stringify(DEST)});</script>
<noscript><meta http-equiv="refresh" content="0;url=${DEST}"></noscript>
<div style="min-height:60vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;text-align:center;padding:24px">
  <p>La tienda de ETH Cali vive en <a href="${DEST}">ethcali.org/swag</a>.<br>The ETH Cali store lives at <a href="${DEST}">ethcali.org/swag</a>.</p>
</div>
{% schema %}
{ "name": "ETH Cali redirect", "settings": [], "presets": [{ "name": "ETH Cali redirect" }] }
{% endschema %}
`;

const TEMPLATE_JSON = JSON.stringify(
  { sections: { redirect: { type: 'ethcali-redirect', settings: {} } }, order: ['redirect'] },
  null,
  2
);

const themes = await gql(`{ themes(first: 20) { nodes { id name role } } }`);
const main = themes.themes.nodes.find((t) => t.role === 'MAIN');
if (!main) throw new Error('No MAIN theme');
console.log(`main theme: ${main.name} (${main.id})`);

const themeNum = main.id.split('/').pop();
const backupDir = path.join(path.dirname(new URL(import.meta.url).pathname), '.shopify-theme-backup', themeNum);

const filenames = TEMPLATES.flatMap((t) => [`templates/${t}.json`, `templates/${t}.liquid`]);
const existing = await gql(
  `query($id: ID!, $names: [String!]) { theme(id: $id) { files(first: 50, filenames: $names) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
  { id: main.id, names: filenames }
);
const current = new Map(existing.theme.files.nodes.map((n) => [n.filename, n.body?.content ?? '']));
console.log(`existing templates: ${[...current.keys()].join(', ') || '(none)'}`);

if (restore) {
  if (!fs.existsSync(backupDir)) throw new Error(`no backup at ${backupDir}`);
  const files = fs.readdirSync(backupDir).map((f) => ({ filename: `templates/${f}`, body: { type: 'TEXT', value: fs.readFileSync(path.join(backupDir, f), 'utf8') } }));
  const toDelete = [...current.keys()].filter((k) => !files.some((f) => f.filename === k));
  console.log(`restore: upsert ${files.length}, delete ${toDelete.length}, remove section`);
  if (!dryRun) {
    const up = await gql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { userErrors { filename message } } }`, { id: main.id, files });
    if (up.themeFilesUpsert.userErrors?.length) throw new Error(JSON.stringify(up.themeFilesUpsert.userErrors));
    const del = await gql(`mutation($id: ID!, $files: [String!]!) { themeFilesDelete(themeId: $id, files: $files) { userErrors { filename message } } }`, { id: main.id, files: [...toDelete, 'sections/ethcali-redirect.liquid'] });
    if (del.themeFilesDelete.userErrors?.length) throw new Error(JSON.stringify(del.themeFilesDelete.userErrors));
  }
  console.log('restored');
  process.exit(0);
}

// Back up once.
if (!fs.existsSync(backupDir)) {
  if (!dryRun) fs.mkdirSync(backupDir, { recursive: true });
  for (const [name, content] of current) {
    console.log(`backup ${name} (${content.length} bytes)`);
    if (!dryRun) fs.writeFileSync(path.join(backupDir, name.replace('templates/', '')), content);
  }
}

// Every template becomes the redirect. JSON templates win over .liquid ones,
// so write JSON and delete any .liquid twin.
const upserts = [
  { filename: 'sections/ethcali-redirect.liquid', body: { type: 'TEXT', value: SECTION } },
  ...TEMPLATES.map((t) => ({ filename: `templates/${t}.json`, body: { type: 'TEXT', value: TEMPLATE_JSON } })),
];
const liquidTwins = TEMPLATES.map((t) => `templates/${t}.liquid`).filter((f) => current.has(f));
console.log(`upsert ${upserts.length} files; delete ${liquidTwins.length} liquid twins`);
if (dryRun) {
  console.log('(dry run)');
  process.exit(0);
}
const up = await gql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } } }`, { id: main.id, files: upserts });
if (up.themeFilesUpsert.userErrors?.length) throw new Error(JSON.stringify(up.themeFilesUpsert.userErrors));
console.log(`upserted ${up.themeFilesUpsert.upsertedThemeFiles.length}`);
if (liquidTwins.length) {
  const del = await gql(`mutation($id: ID!, $files: [String!]!) { themeFilesDelete(themeId: $id, files: $files) { userErrors { filename message } } }`, { id: main.id, files: liquidTwins });
  if (del.themeFilesDelete.userErrors?.length) throw new Error(JSON.stringify(del.themeFilesDelete.userErrors));
}
console.log(`done. storefront pages now send visitors to ${DEST}; checkout untouched.`);

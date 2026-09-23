#!/usr/bin/env node
/**
 * Put the swag products on sale: status ACTIVE and published to the Online
 * Store channel. Draft is what shopify-sync.mjs creates; this is the one-way
 * step a human takes when the store is ready.
 *
 *   node --env-file=.env scripts/shopify-activate.mjs --dry-run
 *   node --env-file=.env scripts/shopify-activate.mjs
 *
 * Idempotent: already-active, already-published products are left alone.
 */
import { gql } from '../lib/shopify.mjs';

const dryRun = process.argv.includes('--dry-run');
const TAG = 'swag-2026';

const pubs = await gql(`{ publications(first: 20) { nodes { id name } } }`);
const onlineStore = pubs.publications.nodes.find((p) => /online store/i.test(p.name));
if (!onlineStore) throw new Error(`No Online Store publication found among: ${pubs.publications.nodes.map((p) => p.name).join(', ')}`);

const data = await gql(
  `query ($q: String!, $pub: ID!) {
    products(first: 50, query: $q) {
      nodes { id handle status publishedOnPublication(publicationId: $pub) }
    }
  }`,
  { q: `tag:${TAG}`, pub: onlineStore.id }
);
const products = data.products.nodes;
console.log(`${products.length} products tagged ${TAG}; Online Store publication ${onlineStore.id}`);

let activated = 0;
let published = 0;
for (const p of products) {
  const needsActive = p.status !== 'ACTIVE';
  const needsPublish = !p.publishedOnPublication;
  if (!needsActive && !needsPublish) {
    console.log(`${p.handle}: already active and published`);
    continue;
  }
  if (dryRun) {
    console.log(`${p.handle}: would ${needsActive ? 'activate' : ''}${needsActive && needsPublish ? ' + ' : ''}${needsPublish ? 'publish' : ''}`);
    continue;
  }
  if (needsActive) {
    const r = await gql(
      `mutation ($input: ProductInput!) { productUpdate(input: $input) { product { id status } userErrors { field message } } }`,
      { input: { id: p.id, status: 'ACTIVE' } }
    );
    if (r.productUpdate.userErrors?.length) throw new Error(`${p.handle}: ${JSON.stringify(r.productUpdate.userErrors)}`);
    activated++;
  }
  if (needsPublish) {
    const r = await gql(
      `mutation ($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
      { id: p.id, input: [{ publicationId: onlineStore.id }] }
    );
    if (r.publishablePublish.userErrors?.length) throw new Error(`${p.handle}: ${JSON.stringify(r.publishablePublish.userErrors)}`);
    published++;
  }
  console.log(`${p.handle}: ${needsActive ? 'activated' : ''}${needsActive && needsPublish ? ' + ' : ''}${needsPublish ? 'published' : ''}`);
}
console.log(`done. activated ${activated}, published ${published}${dryRun ? ' (dry run)' : ''}`);

#!/usr/bin/env node
/**
 * Register (or inspect) the app-owned Shopify webhook subscriptions that feed
 * pages/api/shopify/webhook.ts.
 *
 *   node --env-file=.env scripts/shopify-webhooks.mjs list
 *   node --env-file=.env scripts/shopify-webhooks.mjs create [https://app.ethcali.org/api/shopify/webhook]
 *   node --env-file=.env scripts/shopify-webhooks.mjs delete <gid>
 *
 * Subscriptions created here are signed with the app's CLIENT SECRET (not the
 * store's Notifications signing secret); the route accepts either. Run
 * `create` only once the URL is live: Shopify retries a failing endpoint for
 * 48 hours and then drops the subscription.
 */
import { gql } from '../lib/shopify.mjs';

const DEFAULT_URL = 'https://app.ethcali.org/api/shopify/webhook';
const TOPICS = ['ORDERS_PAID', 'REFUNDS_CREATE'];

const [cmd, arg] = process.argv.slice(2);

async function list() {
  const data = await gql(`{
    webhookSubscriptions(first: 50) {
      nodes { id topic format createdAt endpoint { __typename ... on WebhookHttpEndpoint { callbackUrl } } }
    }
  }`);
  const rows = data.webhookSubscriptions.nodes.map((n) => ({
    id: n.id,
    topic: n.topic,
    format: n.format,
    url: n.endpoint?.callbackUrl ?? n.endpoint?.__typename,
    createdAt: n.createdAt,
  }));
  console.table(rows);
  return rows;
}

async function create(url) {
  const existing = await list();
  for (const topic of TOPICS) {
    if (existing.some((r) => r.topic === topic && r.url === url)) {
      console.log(`${topic}: already subscribed at ${url}`);
      continue;
    }
    const data = await gql(
      `mutation ($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $sub) {
          webhookSubscription { id topic }
          userErrors { field message }
        }
      }`,
      { topic, sub: { callbackUrl: url, format: 'JSON' } }
    );
    const r = data.webhookSubscriptionCreate;
    if (r.userErrors?.length) throw new Error(`${topic}: ${JSON.stringify(r.userErrors)}`);
    console.log(`${topic}: created ${r.webhookSubscription.id}`);
  }
}

async function remove(id) {
  const data = await gql(
    `mutation ($id: ID!) { webhookSubscriptionDelete(id: $id) { deletedWebhookSubscriptionId userErrors { field message } } }`,
    { id }
  );
  const r = data.webhookSubscriptionDelete;
  if (r.userErrors?.length) throw new Error(JSON.stringify(r.userErrors));
  console.log(`deleted ${r.deletedWebhookSubscriptionId}`);
}

try {
  if (cmd === 'list') await list();
  else if (cmd === 'create') await create(arg || DEFAULT_URL);
  else if (cmd === 'delete' && arg) await remove(arg);
  else {
    console.error('usage: shopify-webhooks.mjs list | create [url] | delete <gid>');
    process.exit(1);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

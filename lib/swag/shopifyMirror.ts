/**
 * Mirror a USDC purchase into Shopify, so every parcel — card or crypto — is
 * packed from the same queue.
 *
 * The chain stays the receipt: `paid`, `quantity` and `tokenId` come from the
 * Purchased log the collection emitted, never from the client. What this file
 * does is translate that receipt into an `orderCreate` Shopify will accept:
 *
 *   - the line item is the Shopify variant for (design, size), priced at the
 *     COP equivalent of what was actually paid (USDC × the TRM of the day, the
 *     same rate the card channel is priced with);
 *   - the order is PAID through a SALE transaction whose gateway is
 *     "USDC on Ethereum", so the orders/paid webhook can recognise it as ours
 *     and not record it a second time;
 *   - the tags carry `usdc-onchain` for the same reason, and for filtering
 *     in the Shopify admin;
 *   - inventory is BYPASSed: the unit was minted from on-chain stock, and
 *     Shopify's counter is not the one that matters;
 *   - no receipt emails: the buyer already has the transaction.
 *
 * Only erasable TypeScript here (types, interfaces, `as const`), and the only
 * value import is `lib/shopify.mjs`: `scripts/swag-mirror-selftest.mjs` loads
 * this file directly under Node's type stripping to print the variables it
 * would send without touching Shopify. A value import of another `.ts` module
 * would break that.
 */
import { fetchTrm, getAccessToken, gql } from '../shopify.mjs';
import type { SwagShipping } from '../../types/swag-orders';

/** The tag the orders/paid webhook keys on to skip our own mirrors. */
export const MIRROR_TAG = 'usdc-onchain';
export const MIRROR_TAGS = [MIRROR_TAG, 'swag-2026'] as const;
/** The transaction gateway; the second thing the webhook keys on. */
export const MIRROR_GATEWAY = 'USDC on Ethereum';
export const MIRROR_CURRENCY = 'COP';

/**
 * Admin API 2026-07. `orderCreate` takes the order and, separately, the
 * options that decide inventory and email behaviour. Validated with the
 * shopify-admin skill's validate.mjs against 2026-07.
 */
export const ORDER_CREATE = /* GraphQL */ `
  mutation SwagMirrorOrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      order {
        id
        name
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Everything the mirror needs, already verified by the route. */
export interface MirrorPurchase {
  /** Lowercase 0x hash of the buy() transaction on the collection's chain. */
  txHash: string;
  /** The ERC-1155 token id, decimal. */
  tokenId: string;
  /** The Purchased log's buyer, lowercase. */
  buyerWallet: string;
  /** The Purchased log's `paid`: total USDC in base units, decimal string. */
  paidUsdc: string;
  quantity: number;
  /** swag_shopify_variants.shopify_variant_id for (design, size). */
  shopifyVariantId: string;
  /** Design SKU, for the note and the admin's eyes. */
  sku: string;
  size: string | null;
  shipping: SwagShipping;
  /** The buyer's verified email when Privy has one; otherwise the order has none. */
  email: string | null;
}

export interface TrmQuote {
  rate: number;
  validFrom: string;
  validTo: string;
}

export interface MirrorPricing {
  /** Per unit, USDC as a decimal string with 6 places. */
  unitUsdc: string;
  /** Total, USDC as a decimal string with 6 places. */
  totalUsdc: string;
  /** Per unit, COP with 2 places — what the line item is priced at. */
  unitCop: string;
  /** Total, COP with 2 places — what the SALE transaction records. */
  totalCop: string;
  trm: TrmQuote;
}

function fixed(cents: bigint, places: number): string {
  const scale = 10n ** BigInt(places);
  const whole = cents / scale;
  const frac = (cents % scale).toString().padStart(places, '0');
  return `${whole}.${frac}`;
}

/**
 * USDC base units → COP, in integer arithmetic. Per-unit first, so
 * unit × quantity is exactly the transaction total Shopify is told about;
 * a total rounded on its own can disagree with the line by a cent.
 *
 * unitCop = (paid / qty) / 1e6 × trm. With the TRM scaled to four decimals
 * and the answer wanted in cents, that is paid × trm₄ / (qty × 1e8), rounded
 * half up.
 */
export function copAmounts(paidUsdc: string, quantity: number, trm: TrmQuote): MirrorPricing {
  if (!/^\d+$/.test(paidUsdc)) throw new Error(`paidUsdc must be a decimal integer string, got "${paidUsdc}"`);
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error(`quantity must be a positive integer, got ${quantity}`);
  if (!Number.isFinite(trm.rate) || trm.rate <= 0) throw new Error(`unusable TRM ${trm.rate}`);

  const paid = BigInt(paidUsdc);
  const qty = BigInt(quantity);
  const trm4 = BigInt(Math.round(trm.rate * 10_000));

  const unitMicro = paid / qty;
  const divisor = 100_000_000n;
  const unitCents = (unitMicro * trm4 + divisor / 2n) / divisor;

  return {
    unitUsdc: fixed(unitMicro, 6),
    totalUsdc: fixed(paid, 6),
    unitCop: fixed(unitCents, 2),
    totalCop: fixed(unitCents * qty, 2),
    trm,
  };
}

function money(amount: string) {
  return { shopMoney: { amount, currencyCode: MIRROR_CURRENCY } };
}

/**
 * A phone Shopify will not refuse: digits with an optional leading +. Anything
 * with fewer than seven digits is not a phone number and is left off rather
 * than sent as-is — a refused address fails the whole order.
 */
function cleanPhone(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7) return null;
  return raw.trim().startsWith('+') ? `+${digits}` : digits;
}

/**
 * SwagShipping → MailingAddressInput. `minimal` drops the two fields Shopify
 * validates against its own tables (phone, province) so a second attempt can
 * get through; what was dropped goes into the order note instead.
 */
export function toMailingAddress(s: SwagShipping, minimal: boolean) {
  const [firstName = '', ...rest] = s.name.trim().split(/\s+/);
  const lastName = rest.join(' ');
  const address: Record<string, string> = {
    firstName,
    lastName: lastName || firstName,
    address1: s.address1,
    city: s.city,
    countryCode: s.country,
  };
  if (s.address2) address.address2 = s.address2;
  if (!minimal) {
    // `province` is the by-name field (deprecated in favour of provinceCode,
    // still accepted). The buyer typed a region name, not an ISO code.
    if (s.region) address.province = s.region;
    const phone = cleanPhone(s.phone);
    if (phone) address.phone = phone;
  }
  return address;
}

function buildNote(p: MirrorPurchase, pricing: MirrorPricing, minimal: boolean): string {
  const lines = [`${MIRROR_GATEWAY} · tx ${p.txHash} · token #${p.tokenId}`];
  lines.push(`Paid ${pricing.totalUsdc} USDC · TRM ${pricing.trm.rate} (${pricing.trm.validFrom}) · ${p.sku}${p.size ? ` · size ${p.size}` : ''}`);
  if (minimal) {
    // The address went in without these; keep them where the packer reads.
    if (p.shipping.region) lines.push(`Region: ${p.shipping.region}`);
    if (p.shipping.phone) lines.push(`Phone: ${p.shipping.phone}`);
  }
  if (p.shipping.notes) lines.push(`Buyer note: ${p.shipping.notes}`);
  return lines.join('\n');
}

/**
 * The variables for ORDER_CREATE. Pure: no network, no secrets, so the
 * self-test can print exactly what production would send.
 */
export function buildOrderCreateVariables(p: MirrorPurchase, trm: TrmQuote, opts: { minimalAddress?: boolean } = {}) {
  const minimal = opts.minimalAddress === true;
  const pricing = copAmounts(p.paidUsdc, p.quantity, trm);

  const order: Record<string, unknown> = {
    note: buildNote(p, pricing, minimal),
    tags: [...MIRROR_TAGS],
    financialStatus: 'PAID',
    lineItems: [
      {
        variantId: p.shopifyVariantId,
        quantity: p.quantity,
        requiresShipping: true,
        priceSet: money(pricing.unitCop),
      },
    ],
    transactions: [
      {
        kind: 'SALE',
        status: 'SUCCESS',
        gateway: MIRROR_GATEWAY,
        amountSet: money(pricing.totalCop),
      },
    ],
    shippingAddress: toMailingAddress(p.shipping, minimal),
    customAttributes: [
      { key: 'tx_hash', value: p.txHash },
      { key: 'token_id', value: p.tokenId },
      { key: 'buyer_wallet', value: p.buyerWallet },
      { key: 'paid_usdc', value: pricing.totalUsdc },
      { key: 'trm', value: `${pricing.trm.rate} (${pricing.trm.validFrom}..${pricing.trm.validTo})` },
    ],
  };
  if (p.email) order.email = p.email;

  return {
    order,
    options: {
      inventoryBehaviour: 'BYPASS',
      sendReceipt: false,
      sendFulfillmentReceipt: false,
    },
  };
}

export interface MirrorCreated {
  shopifyOrderId: string;
  /** Shopify's human order name, e.g. #1042. */
  name: string;
  pricing: MirrorPricing;
  /** True when the first attempt was refused and the address went in reduced. */
  degradedAddress: boolean;
}

/** gql() throws `Shopify userErrors: [...]` when the mutation itself said no. */
function isUserError(e: unknown): boolean {
  return e instanceof Error && e.message.startsWith('Shopify userErrors');
}

/**
 * Create the mirror. Throws on any failure; the caller decides what a failed
 * mirror means for the order (it must never mean losing it).
 *
 * Two attempts at most: the full address, then — only if Shopify refused with
 * userErrors — the minimal one with the dropped fields in the note. Anything
 * else (auth, network, throttling past gql's own retries) is thrown as-is.
 */
export async function createMirrorOrder(p: MirrorPurchase): Promise<MirrorCreated> {
  // The rate and the token are independent; the route is on the clock.
  const [trm] = await Promise.all([fetchTrm(), getAccessToken()]);

  const attempt = async (minimalAddress: boolean) => {
    const variables = buildOrderCreateVariables(p, trm, { minimalAddress });
    const data = await gql(ORDER_CREATE, variables);
    const order = data?.orderCreate?.order as { id?: string; name?: string } | undefined;
    if (!order?.id) throw new Error('orderCreate returned no order');
    return { id: order.id, name: order.name ?? '', pricing: copAmounts(p.paidUsdc, p.quantity, trm) };
  };

  try {
    const r = await attempt(false);
    return { shopifyOrderId: r.id, name: r.name, pricing: r.pricing, degradedAddress: false };
  } catch (e) {
    if (!isUserError(e)) throw e;
    const r = await attempt(true);
    return { shopifyOrderId: r.id, name: r.name, pricing: r.pricing, degradedAddress: true };
  }
}

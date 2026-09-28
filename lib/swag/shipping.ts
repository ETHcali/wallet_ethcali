/**
 * Shipping for USDC orders: which zone an address is in, what it costs, and
 * the signed quote that carries that price from checkout to payment.
 *
 * Why a signed quote. The price comes from swag_shipping_zones and can be
 * edited at any time; the buyer must pay the price they were shown, and must
 * not be able to pay less by editing a request. So the quote route signs
 * { zone, amountUnits, wallet, exp } with a server secret, the order stores
 * that signed quote, and the payment route re-verifies the signature and then
 * reads the USDC Transfer on chain. Nothing about the amount is taken from the
 * client after the quote.
 *
 * The expiry applies when the order is created (the buyer is at checkout).
 * Once stored on an order the quote is a commitment, and a shipping payment
 * made later from "My orders" is held to it.
 *
 * Secret: SWAG_QUOTE_SECRET, or derived from PRIVY_APP_SECRET when unset so a
 * deploy without the new variable still works. Rotating either invalidates
 * unpaid quotes, which the buyer fixes by asking for a new one.
 */
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const USDC_DECIMALS = 6;
/** How long a quote may be used to create an order. */
export const QUOTE_TTL_SECONDS = 30 * 60;

export class ShippingError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export interface ShippingZoneRow {
  code: string;
  label_es: string;
  label_en: string;
  countries: string[];
  cities: string[];
  price_usd: number | string;
  eta_min_days: number;
  eta_max_days: number;
  active: boolean;
  sort: number;
  updated_at: string;
}

/** What the buyer accepted. amountUnits is USDC base units as a decimal string. */
export interface ShippingQuoteFields {
  v: 1;
  zone: string;
  amountUnits: string;
  /** Lowercase buyer wallet the shipping must be paid from. */
  wallet: string;
  country: string;
  /** Unix seconds. */
  exp: number;
}

export interface SignedShippingQuote extends ShippingQuoteFields {
  sig: string;
}

/** "Santiago de Cali " → "santiago de cali"; "Bogotá D.C." → "bogota d.c.". */
export function normaliseCity(city: string): string {
  return city
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Names that should match a listed city even with a suffix ("bogota d.c.", "medellin, antioquia"). */
function cityMatches(listed: string, city: string): boolean {
  return city === listed || city.startsWith(`${listed} `) || city.startsWith(`${listed},`) || city.startsWith(`${listed}.`);
}

export async function loadZones(db: SupabaseClient, opts: { activeOnly: boolean }): Promise<ShippingZoneRow[]> {
  let query = db.from('swag_shipping_zones').select('*').order('sort', { ascending: true });
  if (opts.activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new ShippingError(error.message, 500);
  return (data ?? []) as ShippingZoneRow[];
}

/**
 * The zone for an address among active zones: a zone that lists the city
 * wins, then the country's catch-all (a zone with no cities). Null when the
 * store does not ship there.
 */
export function resolveZone(zones: ShippingZoneRow[], country: string, city: string): ShippingZoneRow | null {
  const cc = country.trim().toUpperCase();
  const c = normaliseCity(city);
  const covering = zones.filter((z) => z.active && z.countries.includes(cc));
  return (
    covering.find((z) => z.cities.length > 0 && z.cities.some((listed) => cityMatches(listed, c))) ??
    covering.find((z) => z.cities.length === 0) ??
    null
  );
}

/** USD → USDC base units, exact to the cent. */
export function usdToUnits(usd: number | string): bigint {
  const cents = Math.round(Number(usd) * 100);
  if (!Number.isFinite(cents) || cents <= 0) throw new ShippingError('Invalid shipping price', 500);
  return BigInt(cents) * 10n ** BigInt(USDC_DECIMALS - 2);
}

function secret(): Buffer {
  const explicit = process.env.SWAG_QUOTE_SECRET?.trim();
  if (explicit) return Buffer.from(explicit);
  const privy = process.env.PRIVY_APP_SECRET;
  if (!privy) throw new ShippingError('Shipping quotes are not configured on the server', 500);
  return createHash('sha256').update(`swag-shipping-quote:${privy}`).digest();
}

/** Fixed field order, so the same quote always hashes the same. */
function canonical(q: ShippingQuoteFields): string {
  return JSON.stringify([q.v, q.zone, q.amountUnits, q.wallet, q.country, q.exp]);
}

function sign(q: ShippingQuoteFields): string {
  return createHmac('sha256', secret()).update(canonical(q)).digest('hex');
}

export function signQuote(fields: Omit<ShippingQuoteFields, 'v' | 'exp'>, now = Date.now()): SignedShippingQuote {
  const q: ShippingQuoteFields = { v: 1, ...fields, wallet: fields.wallet.toLowerCase(), exp: Math.floor(now / 1000) + QUOTE_TTL_SECONDS };
  return { ...q, sig: sign(q) };
}

/**
 * Parse and authenticate a quote from untrusted JSON. `checkExpiry` is true at
 * order creation and false when paying a quote already stored on an order.
 */
export function verifyQuote(raw: unknown, opts: { checkExpiry: boolean; now?: number }): SignedShippingQuote {
  if (!raw || typeof raw !== 'object') throw new ShippingError('A shipping quote is required', 400);
  const r = raw as Record<string, unknown>;
  if (
    r.v !== 1 ||
    typeof r.zone !== 'string' ||
    typeof r.amountUnits !== 'string' ||
    !/^[1-9][0-9]{0,15}$/.test(r.amountUnits) ||
    typeof r.wallet !== 'string' ||
    !/^0x[0-9a-f]{40}$/.test(r.wallet) ||
    typeof r.country !== 'string' ||
    typeof r.exp !== 'number' ||
    typeof r.sig !== 'string' ||
    !/^[0-9a-f]{64}$/.test(r.sig)
  ) {
    throw new ShippingError('The shipping quote is malformed', 400);
  }
  const q: ShippingQuoteFields = { v: 1, zone: r.zone, amountUnits: r.amountUnits, wallet: r.wallet, country: r.country, exp: r.exp };
  const expected = Buffer.from(sign(q), 'hex');
  const given = Buffer.from(r.sig, 'hex');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    throw new ShippingError('The shipping quote is not valid. Ask for a new one.', 400);
  }
  if (opts.checkExpiry && q.exp * 1000 < (opts.now ?? Date.now())) {
    throw new ShippingError('The shipping quote expired. Ask for a new one.', 409);
  }
  return { ...q, sig: r.sig };
}

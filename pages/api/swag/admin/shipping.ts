/**
 * Shipping zones, from the operator's side. ADMIN_ROLE only: a price here is
 * what every buyer is quoted from the next request on.
 *
 *   GET   /api/swag/admin/shipping                 every zone, active or not
 *   PATCH /api/swag/admin/shipping { code, … }     price, ETA, on/off, cities
 *
 * A change affects new quotes only. A quote already stored on an order was
 * signed with the old price and is honoured as signed.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { requireSwagAdmin } from '../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { loadZones, normaliseCity, ShippingError, type ShippingZoneRow } from '../../../../lib/swag/shipping';
import { toZoneView } from '../../../../lib/swag/shippingViews';
import { logger } from '../../../../utils/logger';
import type { SwagAdminShippingResponse, SwagAdminShippingZone } from '../../../../types/swag-orders';

type Reply = SwagAdminShippingResponse | { zone: SwagAdminShippingZone } | { error: string };

function toAdminZone(z: ShippingZoneRow): SwagAdminShippingZone {
  return { ...toZoneView(z), cities: z.cities, active: z.active, updatedAt: z.updated_at };
}

function parsePatch(raw: unknown): { code: string; update: Partial<ShippingZoneRow> } {
  if (!raw || typeof raw !== 'object') throw new ShippingError('A JSON body is required', 400);
  const r = raw as Record<string, unknown>;
  if (typeof r.code !== 'string' || !/^[a-z0-9_]{2,32}$/.test(r.code)) throw new ShippingError('code is required', 400);
  const update: Partial<ShippingZoneRow> = {};
  if (r.priceUsd !== undefined) {
    const p = Number(r.priceUsd);
    if (!Number.isFinite(p) || p <= 0 || p > 1000) throw new ShippingError('priceUsd must be between 0 and 1000', 400);
    update.price_usd = Math.round(p * 100) / 100;
  }
  for (const [key, col] of [['etaMinDays', 'eta_min_days'], ['etaMaxDays', 'eta_max_days']] as const) {
    if (r[key] !== undefined) {
      const n = Number(r[key]);
      if (!Number.isInteger(n) || n < 0 || n > 60) throw new ShippingError(`${key} must be a whole number of days`, 400);
      update[col] = n;
    }
  }
  if (r.active !== undefined) {
    if (typeof r.active !== 'boolean') throw new ShippingError('active must be true or false', 400);
    update.active = r.active;
  }
  if (r.cities !== undefined) {
    if (!Array.isArray(r.cities) || r.cities.length > 200 || r.cities.some((c) => typeof c !== 'string' || c.length > 60)) {
      throw new ShippingError('cities must be a list of names', 400);
    }
    update.cities = Array.from(new Set((r.cities as string[]).map(normaliseCity).filter(Boolean)));
  }
  if (Object.keys(update).length === 0) throw new ShippingError('Nothing to update', 400);
  return { code: r.code, update };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let who: string;
  try {
    who = (await requireSwagAdmin(req)).admin;
  } catch (e) {
    return sendAuthError(res, e);
  }

  const db = getSupabaseAdmin();
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      const zones = await loadZones(db, { activeOnly: false });
      return res.status(200).json({ zones: zones.map(toAdminZone) });
    }
    const { code, update } = parsePatch(req.body);
    const { data, error } = await db.from('swag_shipping_zones').update(update).eq('code', code).select('*').maybeSingle();
    if (error) throw new ShippingError(error.code === '23514' ? 'The minimum days cannot exceed the maximum.' : error.message, error.code === '23514' ? 400 : 500);
    if (!data) return res.status(404).json({ error: 'No such zone' });
    logger.info(`[swag/admin/shipping] ${who} updated ${code}: ${Object.keys(update).join(', ')}`);
    return res.status(200).json({ zone: toAdminZone(data as ShippingZoneRow) });
  } catch (e) {
    if (e instanceof ShippingError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/shipping] failed', e);
    return res.status(500).json({ error: 'Could not update shipping' });
  }
}

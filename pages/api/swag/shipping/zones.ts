/**
 * GET /api/swag/shipping/zones — where the store ships and from what price.
 *
 * Public: these are the prices on the shop window. The table itself has no
 * client access; this route reads it through the service role and returns
 * active zones only, without the city lists.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { loadZones, ShippingError } from '../../../../lib/swag/shipping';
import { toZoneView } from '../../../../lib/swag/shippingViews';
import { logger } from '../../../../utils/logger';
import type { SwagShippingZonesResponse } from '../../../../types/swag-orders';

export default async function handler(req: NextApiRequest, res: NextApiResponse<SwagShippingZonesResponse | { error: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const zones = await loadZones(getSupabaseAdmin(), { activeOnly: true });
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ zones: zones.map(toZoneView) });
  } catch (e) {
    if (e instanceof ShippingError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/shipping/zones] failed', e);
    return res.status(500).json({ error: 'Could not load shipping zones' });
  }
}

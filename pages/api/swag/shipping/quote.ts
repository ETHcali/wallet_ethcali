/**
 * POST /api/swag/shipping/quote { country, city, wallet? } — a signed price
 * for shipping one parcel to this address, payable in USDC from `wallet`.
 *
 * Signed-in only, and `wallet` must be one of the caller's linked wallets
 * (default: their embedded wallet): the quote names the wallet the shipping
 * transfer has to come from, so it is bound to the person who will buy.
 * The quote is valid for 30 minutes of checkout; see lib/swag/shipping.ts.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { requireUser, sendAuthError, type VerifiedUser } from '../../../../lib/swag/requireUser';
import { loadZones, resolveZone, ShippingError, signQuote, usdToUnits } from '../../../../lib/swag/shipping';
import { toZoneView } from '../../../../lib/swag/shippingViews';
import { logger } from '../../../../utils/logger';
import type { SwagShippingQuoteResponse } from '../../../../types/swag-orders';

type Reply = SwagShippingQuoteResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user: VerifiedUser;
  try {
    user = await requireUser(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const country = typeof body.country === 'string' ? body.country.trim().toUpperCase() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  if (!/^[A-Z]{2}$/.test(country)) return res.status(400).json({ error: 'country must be an ISO-2 code' });
  if (!city || city.length > 80) return res.status(400).json({ error: 'city is required' });

  const requested = typeof body.wallet === 'string' ? body.wallet.trim().toLowerCase() : null;
  const wallet = requested ?? user.embeddedWallet;
  if (!wallet || !user.wallets.includes(wallet)) {
    return res.status(403).json({ error: 'That wallet is not linked to this account' });
  }

  try {
    const zones = await loadZones(getSupabaseAdmin(), { activeOnly: true });
    const zone = resolveZone(zones, country, city);
    if (!zone) {
      return res.status(422).json({
        error: country === 'CO' ? 'We cannot ship to that city yet.' : 'We only ship within Colombia for now.',
      });
    }
    const quote = signQuote({ zone: zone.code, amountUnits: usdToUnits(zone.price_usd).toString(), wallet, country });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ zone: toZoneView(zone), quote });
  } catch (e) {
    if (e instanceof ShippingError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/shipping/quote] failed', e);
    return res.status(500).json({ error: 'Could not quote shipping' });
  }
}

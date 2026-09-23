/**
 * The order desk.
 *
 *   GET /api/swag/admin/orders?status=&channel=&q=&cursor=
 *
 * Every order through every channel, newest first, 50 at a time. Unlike
 * /api/swag/orders this returns the shipping address and the buyer's email,
 * because the caller is the person putting the parcel in the post — and the
 * caller is that person because requireSwagAdmin asked the collection,
 * not because a table said so.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { requireSwagAdmin } from '../../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../../lib/swag/requireUser';
import { listAdminOrders, OrderError, parseAdminOrderFilters } from '../../../../../lib/swag/orders';
import { logger } from '../../../../../utils/logger';
import type { SwagAdminOrdersResponse } from '../../../../../types/swag-orders';

type Reply = SwagAdminOrdersResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireSwagAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  try {
    const filters = parseAdminOrderFilters(req.query);
    const page = await listAdminOrders(getSupabaseAdmin(), filters);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(page);
  } catch (e) {
    if (e instanceof OrderError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/orders] failed', e);
    return res.status(500).json({ error: 'Could not load the orders' });
  }
}

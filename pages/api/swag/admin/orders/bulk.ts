/**
 * Many orders, one move.
 *
 *   POST /api/swag/admin/orders/bulk  { ids, status, tracking? }
 *
 * The forward moves fulfilment makes in batches: in_production, shipped (with
 * tracking per order) and delivered. FULFILLMENT_ROLE may make them, as on a
 * single order. Cancelling is not here: it is the operator's half of a
 * refund and stays one order at a time, behind its own confirmation.
 *
 * Each order goes through the same update as PATCH /orders/[id], so the
 * status trigger rules every row and a refusal comes back beside its id.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { requireSwagStaff, type SwagStaff } from '../../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../../lib/swag/requireUser';
import { bulkPatchAdminOrders, OrderError, parseAdminBulk } from '../../../../../lib/swag/orders';
import { logger } from '../../../../../utils/logger';
import type { SwagAdminBulkResponse } from '../../../../../types/swag-orders';

type Reply = SwagAdminBulkResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let staff: SwagStaff;
  try {
    staff = await requireSwagStaff(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  try {
    const body = parseAdminBulk(req.body);
    const reply = await bulkPatchAdminOrders(getSupabaseAdmin(), body);
    const moved = reply.results.filter((r) => r.ok).map((r) => r.id);
    logger.info(`[swag/admin/orders/bulk] ${staff.admin} → ${body.status}: ${moved.length}/${body.ids.length} (${moved.join(', ')})`);
    return res.status(200).json(reply);
  } catch (e) {
    if (e instanceof OrderError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/orders/bulk] failed', e);
    return res.status(500).json({ error: 'Could not update the orders' });
  }
}

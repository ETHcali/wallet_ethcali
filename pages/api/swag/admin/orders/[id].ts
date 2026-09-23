/**
 * One order, from the operator's side.
 *
 *   PATCH /api/swag/admin/orders/[id]  { status?, tracking?, notes? }
 *
 * status moves the row along paid → shipped → delivered (or to cancelled).
 * The database trigger, not this route, decides which moves are legal; when
 * it refuses, its message comes back as a 409 so the UI can show the reason.
 * tracking is stored inside the shipping block. notes is replaced wholesale —
 * the admin page sends the existing text plus its new line, so the webhook's
 * flags survive.
 *
 * Nothing here touches the chain. Cancelling a voucher on chain is a
 * transaction from the admin's own wallet; this route only records its hash.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { requireSwagAdmin } from '../../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../../lib/swag/requireUser';
import {
  OrderError,
  parseAdminOrderPatch,
  patchAdminOrder,
  toAdminOrderView,
} from '../../../../../lib/swag/orders';
import { logger } from '../../../../../utils/logger';
import type { SwagAdminOrderPatchResponse } from '../../../../../types/swag-orders';

type Reply = SwagAdminOrderPatchResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let admin: string;
  try {
    admin = (await requireSwagAdmin(req)).admin;
  } catch (e) {
    return sendAuthError(res, e);
  }

  const id = Number(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  try {
    const patch = parseAdminOrderPatch(req.body);
    const row = await patchAdminOrder(getSupabaseAdmin(), id, patch);
    logger.info(`[swag/admin/orders] ${admin} patched order ${id}: ${Object.keys(patch).join(', ')}`);
    return res.status(200).json({ order: toAdminOrderView(row) });
  } catch (e) {
    if (e instanceof OrderError) return res.status(e.status).json({ error: e.message });
    logger.error(`[swag/admin/orders] patch ${id} failed`, e);
    return res.status(500).json({ error: 'Could not update the order' });
  }
}

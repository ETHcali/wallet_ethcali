/**
 * This week's print batch.
 *
 *   GET  /api/swag/admin/batch                     the window and its orders
 *   POST /api/swag/admin/batch { action: 'start' } paid → in_production for
 *                                                  every order before the cutoff
 *
 * The window (Tuesday 12:00 Bogotá cutoff, Thursday dispatch) is computed here
 * by lib/swag/batch.ts, never taken from the request, so two people at the
 * desk cannot start two different batches. Both verbs are open to
 * FULFILLMENT_ROLE: sending a batch to the press is the packer's job.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { currentBatch } from '../../../../lib/swag/batch';
import { listBatchOrders, OrderError, startBatch } from '../../../../lib/swag/orders';
import { requireSwagStaff } from '../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { logger } from '../../../../utils/logger';
import type { SwagAdminBatchResponse, SwagAdminBatchStartResponse } from '../../../../types/swag-orders';

type Reply = SwagAdminBatchResponse | SwagAdminBatchStartResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let who: string;
  try {
    who = (await requireSwagStaff(req)).admin;
  } catch (e) {
    return sendAuthError(res, e);
  }

  const batch = currentBatch();
  const db = getSupabaseAdmin();

  try {
    if (req.method === 'POST') {
      if (req.body?.action !== 'start') return res.status(400).json({ error: "action must be 'start'" });
      const moved = await startBatch(db, batch.cutoff);
      logger.info(`[swag/admin/batch] ${who} started the ${batch.dispatchDate} batch: ${moved.length} order(s) → in_production`);
      return res.status(200).json({ batch, moved });
    }

    const page = await listBatchOrders(db, batch.cutoff);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ batch, ...page });
  } catch (e) {
    if (e instanceof OrderError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/batch] failed', e);
    return res.status(500).json({ error: 'Could not load the batch' });
  }
}

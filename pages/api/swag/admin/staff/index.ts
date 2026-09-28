/**
 * The swag team.
 *
 *   GET    /api/swag/admin/staff              ADMIN_ROLE      every member, with the chain's answer
 *   POST   /api/swag/admin/staff  {address,…} DEFAULT_ADMIN   record a grant that has landed
 *   DELETE /api/swag/admin/staff?address=     DEFAULT_ADMIN   forget a member whose role is revoked
 *
 * Granting and revoking are transactions from the super admin's own wallet
 * (grantRole / revokeRole / addAdmin / removeAdmin on the collection). These
 * routes only keep the names beside them, and refuse to write a name the
 * chain does not back.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { requireSwagAdmin, requireSwagSuperAdmin } from '../../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../../lib/swag/requireUser';
import { forgetStaff, listStaff, parseAddress, parseRecordBody, recordStaff, StaffError } from '../../../../../lib/swag/staff';
import { logger } from '../../../../../utils/logger';
import type { SwagStaffListResponse, SwagStaffRecordResponse } from '../../../../../types/swag-orders';

type Reply = SwagStaffListResponse | SwagStaffRecordResponse | { ok: true } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let who: string;
  try {
    who = req.method === 'GET' ? (await requireSwagAdmin(req)).admin : (await requireSwagSuperAdmin(req)).superAdminWallet;
  } catch (e) {
    return sendAuthError(res, e);
  }

  const db = getSupabaseAdmin();
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ staff: await listStaff(db) });
    }
    if (req.method === 'POST') {
      const body = parseRecordBody(req.body);
      const member = await recordStaff(db, body, who);
      logger.info(`[swag/admin/staff] ${who} recorded ${body.address} as ${body.role}`);
      return res.status(200).json({ member });
    }
    const raw = Array.isArray(req.query.address) ? req.query.address[0] : req.query.address;
    const address = parseAddress(raw);
    await forgetStaff(db, address);
    logger.info(`[swag/admin/staff] ${who} removed ${address}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    if (e instanceof StaffError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/staff] failed', e);
    return res.status(500).json({ error: 'Could not update the team' });
  }
}

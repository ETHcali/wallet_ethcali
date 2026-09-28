/**
 * Email → the wallet a role can be granted to.
 *
 *   POST /api/swag/admin/staff/resolve { email }   DEFAULT_ADMIN only
 *
 * Finds the Privy account for the email, or creates it with an embedded
 * Ethereum wallet, and returns that wallet. Nothing is granted here: the
 * super admin's next step is the grant transaction, from their own wallet.
 * Super admin only because it creates identities in the Privy app.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSwagSuperAdmin } from '../../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../../lib/swag/requireUser';
import { PrivyUserError, resolveStaffWallet } from '../../../../../lib/swag/privyUsers';
import { parseEmail, StaffError } from '../../../../../lib/swag/staff';
import { logger } from '../../../../../utils/logger';
import type { SwagStaffResolveResponse } from '../../../../../types/swag-orders';

type Reply = SwagStaffResolveResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let who: string;
  try {
    who = (await requireSwagSuperAdmin(req)).superAdminWallet;
  } catch (e) {
    return sendAuthError(res, e);
  }

  try {
    const email = parseEmail(req.body?.email);
    const resolved = await resolveStaffWallet(email);
    logger.info(`[swag/admin/staff] ${who} resolved a staff email → ${resolved.address}${resolved.created ? ' (new Privy account)' : ''}`);
    return res.status(200).json(resolved);
  } catch (e) {
    if (e instanceof StaffError || e instanceof PrivyUserError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/staff/resolve] failed', e);
    return res.status(500).json({ error: 'Could not resolve that email' });
  }
}

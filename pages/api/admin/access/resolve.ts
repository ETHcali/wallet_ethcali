/**
 * Email → the wallet a role can be granted to.
 *
 *   POST /api/admin/access/resolve { email }   any granter
 *
 * Finds the Privy account for the email, or creates it with an embedded
 * Ethereum wallet, and returns that wallet — so a new admin never installs a
 * wallet: they sign in with a one-time code and their embedded wallet carries
 * the role. Nothing is granted here; the caller's next step is the grant
 * transaction from their own wallet. Restricted to wallets that can grant
 * somewhere (DEFAULT_ADMIN_ROLE or owner), because it creates identities.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { isGranter, readAccessMatrix } from '../../../../lib/access';
import { PrivyUserError, resolveStaffWallet } from '../../../../lib/swag/privyUsers';
import { requireUser, sendAuthError, UserAuthError } from '../../../../lib/swag/requireUser';
import { parseEmail, StaffError } from '../../../../lib/swag/staff';
import { logger } from '../../../../utils/logger';
import type { AccessResolveResponse } from '../../../../types/access';

export default async function handler(req: NextApiRequest, res: NextApiResponse<AccessResolveResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const email = parseEmail(req.body?.email);
    const user = await requireUser(req);
    const matrix = await readAccessMatrix(getSupabaseAdmin());
    if (!isGranter(matrix, user.wallets)) {
      throw new UserAuthError('Only a wallet that can grant roles (DEFAULT_ADMIN_ROLE or owner) can add people', 403);
    }
    const resolved = await resolveStaffWallet(email);
    logger.info(`[admin/access] ${user.did} resolved an email → ${resolved.address}${resolved.created ? ' (new Privy account)' : ''}`);
    return res.status(200).json(resolved);
  } catch (e) {
    if (e instanceof UserAuthError) return sendAuthError(res, e);
    if (e instanceof StaffError || e instanceof PrivyUserError) return res.status(e.status).json({ error: e.message });
    logger.error('[admin/access/resolve] failed', e);
    return res.status(500).json({ error: 'Could not resolve that email' });
  }
}

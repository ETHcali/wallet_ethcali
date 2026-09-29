/**
 * The access matrix.
 *
 *   GET /api/admin/access    any operator   every contract's live role holders,
 *                                           with names, emails and the seed check
 *
 * Operator = any linked wallet holds an admin-level role on any administered
 * contract (config/access.ts). Role holders are public on chain; the emails
 * beside them are not, which is why this is not an open route. Nothing here
 * writes: grants and revokes are transactions from the caller's own wallet.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { isOperator, readAccessMatrix } from '../../../../lib/access';
import { requireUser, sendAuthError, UserAuthError } from '../../../../lib/swag/requireUser';
import { logger } from '../../../../utils/logger';
import type { AccessMatrix } from '../../../../types/access';

export default async function handler(req: NextApiRequest, res: NextApiResponse<AccessMatrix | { error: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireUser(req);
    const matrix = await readAccessMatrix(getSupabaseAdmin());
    if (!isOperator(matrix, user.wallets)) throw new UserAuthError('None of your wallets holds an admin role', 403);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(matrix);
  } catch (e) {
    if (e instanceof UserAuthError) return sendAuthError(res, e);
    logger.error('[admin/access] failed', e);
    return res.status(500).json({ error: 'Could not read the access matrix' });
  }
}

/**
 * GET /api/certificates/admin — every participant, for operators.
 *
 * The history of who built at each event: all their emails, whether they
 * checked in on Luma, whether they claimed and to which wallet, and whether
 * the NFT is out. Unlike the owner and public views this carries emails, so it
 * sits behind requireCertAdmin: ADMIN_ROLE on BuilderCertificate, read on chain.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { ADMIN_COLUMNS, toAdminView, type AdminRow } from '../../../lib/certificates/rows';
import { logger } from '../../../utils/logger';
import type { AdminCertificatesResponse } from '../../../types/certificates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminCertificatesResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('builder_certificates')
      .select(ADMIN_COLUMNS)
      .order('event')
      .order('project_name')
      .order('member_name');
    if (error) throw new Error(error.message);
    const rows = data as unknown as AdminRow[];
    return res.status(200).json({ certificates: rows.map(toAdminView) });
  } catch (e) {
    logger.error('certificates: admin list failed', e);
    return res.status(500).json({ error: 'Could not load participants' });
  }
}

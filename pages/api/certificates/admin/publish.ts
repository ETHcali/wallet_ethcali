/**
 * POST /api/certificates/admin/publish — rebuild the site so new credential pages exist.
 *
 * /certificate/<id> is prerendered at build with every id listed (Privy
 * cannot render per request on Vercel; see CLAUDE.md, "Rendering gotcha"), so
 * a certificate added after the last deploy has no page until the next one.
 * This calls the project's Vercel deploy hook (VERCEL_DEPLOY_HOOK_URL), which
 * builds main again; pages go live in a few minutes. Without the variable it
 * says so, and the next push to main does the same job.
 *
 * Admin-only: ADMIN_ROLE on BuilderCertificate.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { logger } from '../../../../utils/logger';

export interface PublishResponse {
  triggered: boolean;
  reason?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PublishResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let operator: string;
  try {
    operator = await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
  if (!hook) return res.status(200).json({ triggered: false, reason: 'VERCEL_DEPLOY_HOOK_URL is not set: credential pages go live with the next deploy' });
  try {
    const r = await fetch(hook, { method: 'POST' });
    if (!r.ok) throw new Error(`deploy hook answered ${r.status}`);
    logger.info(`certificates: ${operator} triggered a deploy for new credential pages`);
    return res.status(200).json({ triggered: true });
  } catch (e) {
    logger.error('certificates: deploy hook failed', e);
    return res.status(502).json({ error: 'The deploy hook did not answer' });
  }
}

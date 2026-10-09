/**
 * POST /api/certificates/admin/preview — a sample diploma for an event, as a PDF.
 *
 *   { event, role, memberName?, projectName? }
 *
 * Rendered from the event's current settings and sponsors, with a sample
 * person and no token id, so an operator sees what a diploma will look like
 * before anyone is added or pinned. A real person's diploma is the public
 * /api/certificates/<id>/pdf. Nothing is stored. Admin-only.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { loadCertEvent } from '../../../../lib/certificates/eventStore';
import { renderDiploma } from '../../../../lib/certificates/diploma';
import { parseRole } from '../../../../lib/certificates/events';
import { logger } from '../../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }
  const b = (req.body ?? {}) as { event?: unknown; role?: unknown; memberName?: unknown; projectName?: unknown };
  const event = typeof b.event === 'string' ? b.event : '';
  try {
    const ev = await loadCertEvent(getSupabaseAdmin(), event);
    if (!ev) return res.status(404).json({ error: 'No such certificate event' });
    const role = parseRole(b.role);
    const memberName = typeof b.memberName === 'string' && b.memberName.trim() ? b.memberName.trim().slice(0, 80) : 'Camila Rodríguez';
    const projectName =
      role === 'builder' ? (typeof b.projectName === 'string' && b.projectName.trim() ? b.projectName.trim().slice(0, 60) : 'Sample Project') : null;
    const pdf = await renderDiploma(
      {
        event: ev.key,
        role,
        memberName,
        projectName,
        credentialId: `${ev.credentialPrefix}-PREVIEW0`.slice(0, 26),
        issueDate: new Date().toISOString().slice(0, 10),
        honors: [],
        tokenId: null,
      },
      ev
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(pdf));
  } catch (e) {
    logger.error('certificates: preview failed', e);
    return res.status(500).json({ error: 'Could not render the preview' });
  }
}

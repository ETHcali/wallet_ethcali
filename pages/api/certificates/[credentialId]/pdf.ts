/**
 * GET /api/certificates/<credentialId>/pdf — the diploma, for anyone with the id.
 *
 * Public on purpose: it is what a builder attaches to LinkedIn and what the
 * certificate email attaches (Resend fetches it by URL). It shows the name,
 * project and prizes — the same things the winners page already publishes —
 * and nothing that identifies how to reach the person.
 *
 * `?download=1` sends it as an attachment; without it, browsers open it inline.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { getPublicCertificate } from '../../../../lib/certificates/rows';
import { renderDiploma } from '../../../../lib/certificates/diploma';
import { loadCertEvent } from '../../../../lib/certificates/eventStore';
import { logger } from '../../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const raw = req.query.credentialId;
  if (typeof raw !== 'string') return res.status(404).json({ error: 'No such certificate' });

  try {
    const db = getSupabaseAdmin();
    const cert = await getPublicCertificate(db, raw);
    if (!cert) return res.status(404).json({ error: 'No such certificate' });
    const ev = await loadCertEvent(db, cert.event);
    if (!ev) throw new Error(`certificate ${cert.credentialId} names unknown event ${cert.event}`);

    const pdf = await renderDiploma({ ...cert, tokenId: cert.tokenId ?? cert.plannedTokenId }, ev);
    const filename = `ETHCali-certificado-${cert.credentialId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${req.query.download ? 'attachment' : 'inline'}; filename="${filename}"`
    );
    // The diploma only changes if the row does, which is rare and deliberate.
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
    return res.status(200).send(Buffer.from(pdf));
  } catch (e) {
    logger.error('certificates: pdf failed', e);
    return res.status(500).json({ error: 'Could not render the certificate' });
  }
}

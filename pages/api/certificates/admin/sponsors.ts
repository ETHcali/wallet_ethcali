/**
 * The sponsors an event's diploma prints — picked from ethcali.org's partners.
 *
 *   GET  /api/certificates/admin/sponsors?event=<key>
 *        the event's sponsors in order, and every partner (published or not)
 *   PUT  /api/certificates/admin/sponsors  { event, sponsors: [{ partnerId, printHeight }] }
 *        replace the list; the array order is the diploma's order
 *   POST /api/certificates/admin/sponsors  { partnerId, file }   (base64 PNG)
 *        pin a print logo — the partner's logo as it reads on white paper —
 *        and set partners.print_logo_path to ipfs://<cid>
 *
 * Partners themselves (name, site logo, link) stay in Site content.
 * Admin-only: ADMIN_ROLE on BuilderCertificate.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { logger } from '../../../../utils/logger';
import { PinError, pinFile } from '../../../../lib/ipfsPin';
import type { CertSponsorsResponse, PartnerForCerts } from '../../../../types/certificates';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const isPng = (b: Buffer) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CertSponsorsResponse | { printLogoPath: string } | { error: string }>
) {
  let operator: string;
  try {
    operator = await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }
  const db = getSupabaseAdmin();

  try {
    if (req.method === 'GET') {
      const event = typeof req.query.event === 'string' ? req.query.event : '';
      const [sponsors, partners] = await Promise.all([
        db.from('certificate_event_sponsors').select('partner_id, sort_order, print_height').eq('event_key', event).order('sort_order'),
        db.from('partners').select('id, slug, name, kind, logo_path, print_logo_path, is_published').order('name'),
      ]);
      if (sponsors.error) throw new Error(sponsors.error.message);
      if (partners.error) throw new Error(partners.error.message);
      return res.status(200).json({
        sponsors: (sponsors.data ?? []).map((s) => ({ partnerId: s.partner_id as number, printHeight: s.print_height as number })),
        partners: (partners.data ?? []).map(
          (p): PartnerForCerts => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            kind: p.kind,
            logoPath: p.logo_path,
            printLogoPath: p.print_logo_path,
            isPublished: p.is_published,
          })
        ),
      });
    }

    if (req.method === 'PUT') {
      const event = typeof req.body?.event === 'string' ? req.body.event : '';
      const list = Array.isArray(req.body?.sponsors) ? (req.body.sponsors as { partnerId: unknown; printHeight: unknown }[]) : null;
      if (!event || !list) return res.status(400).json({ error: 'event and sponsors are required' });
      const rows = list.map((s, i) => ({
        event_key: event,
        partner_id: Number(s.partnerId),
        sort_order: i + 1,
        print_height: Math.min(60, Math.max(10, Math.round(Number(s.printHeight) || 30))),
      }));
      if (rows.some((r) => !Number.isInteger(r.partner_id) || r.partner_id <= 0)) return res.status(400).json({ error: 'Each sponsor needs a partner id' });
      if (new Set(rows.map((r) => r.partner_id)).size !== rows.length) return res.status(400).json({ error: 'A partner is listed twice' });
      const { data: ev, error: evError } = await db.from('certificate_events').select('key').eq('key', event).maybeSingle();
      if (evError) throw new Error(evError.message);
      if (!ev) return res.status(404).json({ error: 'No such certificate event' });
      // Replace, not merge: the list as sent is the diploma.
      const { error: delError } = await db.from('certificate_event_sponsors').delete().eq('event_key', event);
      if (delError) throw new Error(delError.message);
      if (rows.length) {
        const { error } = await db.from('certificate_event_sponsors').insert(rows);
        if (error) throw new Error(error.message);
      }
      logger.info(`certificates: ${operator} set ${rows.length} sponsors on ${event}`);
      return res.status(200).json({ sponsors: rows.map((r) => ({ partnerId: r.partner_id, printHeight: r.print_height })), partners: [] });
    }

    if (req.method === 'POST') {
      const partnerId = Number(req.body?.partnerId);
      const file = typeof req.body?.file === 'string' ? req.body.file : '';
      if (!Number.isInteger(partnerId) || partnerId <= 0 || !file) return res.status(400).json({ error: 'partnerId and file are required' });
      const bytes = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      if (!isPng(bytes)) return res.status(400).json({ error: 'The print logo must be a PNG' });
      if (bytes.length > MAX_LOGO_BYTES) return res.status(400).json({ error: 'The print logo must be under 2 MB' });
      const { data: partner, error: pError } = await db.from('partners').select('slug').eq('id', partnerId).maybeSingle();
      if (pError) throw new Error(pError.message);
      if (!partner) return res.status(404).json({ error: 'No such partner' });
      const cid = await pinFile(bytes, `print-logo-${partner.slug}.png`, 'image/png');
      const printLogoPath = `ipfs://${cid}`;
      const { error } = await db.from('partners').update({ print_logo_path: printLogoPath }).eq('id', partnerId);
      if (error) throw new Error(error.message);
      logger.info(`certificates: ${operator} pinned print logo for partner ${partnerId} → ${printLogoPath}`);
      return res.status(200).json({ printLogoPath });
    }

    res.setHeader('Allow', 'GET, PUT, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    logger.error('certificates: sponsors route failed', e);
    return res.status(e instanceof PinError ? 502 : 500).json({ error: e instanceof PinError ? e.message : 'Could not save the sponsors' });
  }
}

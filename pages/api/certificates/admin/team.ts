/**
 * The team, as the certificates admin sees it.
 *
 *   GET /api/certificates/admin/team?event=<key>
 *     every team_members row (published or not), with the private contact
 *     (team_member_contacts) and whatever certificates that person already
 *     has for the event — so the admin can pick who still needs one.
 *
 * Read-only. Profiles and contacts are edited in one place, the team master
 * list (/admin/team, PUT /api/admin/team).
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { parseRole } from '../../../../lib/certificates/events';
import { loadCertEvent } from '../../../../lib/certificates/eventStore';
import { logger } from '../../../../utils/logger';
import type { TeamForCertsResponse, TeamMemberForCerts } from '../../../../types/certificates';


export default async function handler(req: NextApiRequest, res: NextApiResponse<TeamForCertsResponse | { error: string }>) {
  try {
    await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }
  const db = getSupabaseAdmin();

  if (req.method === 'GET') {
    const event = typeof req.query.event === 'string' ? req.query.event : '';
    if (!event || !(await loadCertEvent(db, event))) return res.status(400).json({ error: 'Unknown event' });
    try {
      const [members, contacts, certs] = await Promise.all([
        db.from('team_members').select('id, slug, name, status, linkedin_url, is_published').order('sort_order'),
        db.from('team_member_contacts').select('team_member_id, email, emails, telegram'),
        db.from('builder_certificates').select('team_member_id, role, credential_id, issued_tx, notified_at').eq('event', event).not('team_member_id', 'is', null),
      ]);
      for (const r of [members, contacts, certs]) if (r.error) throw new Error(r.error.message);
      const contactBy = new Map((contacts.data ?? []).map((c) => [c.team_member_id as number, c]));
      const certsBy = new Map<number, TeamMemberForCerts['certificates']>();
      for (const c of certs.data ?? []) {
        const list = certsBy.get(c.team_member_id as number) ?? [];
        list.push({ role: parseRole(c.role), credentialId: c.credential_id, issued: Boolean(c.issued_tx), notified: Boolean(c.notified_at) });
        certsBy.set(c.team_member_id as number, list);
      }
      const team: TeamMemberForCerts[] = (members.data ?? []).map((m) => {
        const c = contactBy.get(m.id as number);
        return {
          id: m.id as number,
          slug: m.slug,
          name: m.name,
          status: m.status ?? null,
          linkedinUrl: m.linkedin_url ?? null,
          isPublished: Boolean(m.is_published),
          contact: c ? { email: c.email ?? null, emails: (c.emails as string[]) ?? [], telegram: c.telegram ?? null } : null,
          certificates: certsBy.get(m.id as number) ?? [],
        };
      });
      return res.status(200).json({ event, team });
    } catch (e) {
      logger.error('certificates: team list failed', e);
      return res.status(500).json({ error: 'Could not load the team' });
    }
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * The team, as the certificates admin sees it.
 *
 *   GET /api/certificates/admin/team?event=<key>
 *     every team_members row (published or not), with the private contact
 *     (team_member_contacts) and whatever certificates that person already
 *     has for the event — so the admin can pick who still needs one.
 *
 *   PUT /api/certificates/admin/team  { teamMemberId, email?, emails?, telegram? }
 *     upsert the contact. The site never sees this table; the only reader is
 *     the service role behind this route's ADMIN_ROLE check.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { parseRole } from '../../../../lib/certificates/events';
import { loadCertEvent } from '../../../../lib/certificates/eventStore';
import { logger } from '../../../../utils/logger';
import type { TeamContactBody, TeamForCertsResponse, TeamMemberForCerts } from '../../../../types/certificates';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse<TeamForCertsResponse | { contact: TeamMemberForCerts['contact'] } | { error: string }>) {
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

  if (req.method === 'PUT') {
    const b = (req.body ?? {}) as Partial<TeamContactBody>;
    const id = Number(b.teamMemberId);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'teamMemberId is required' });
    const email = typeof b.email === 'string' && b.email.trim() ? b.email.trim().toLowerCase() : null;
    if (email && !EMAIL.test(email)) return res.status(400).json({ error: 'That is not an email address' });
    const extra = Array.isArray(b.emails) ? b.emails.map((e) => String(e).trim().toLowerCase()).filter(Boolean) : [];
    if (extra.some((e) => !EMAIL.test(e))) return res.status(400).json({ error: 'One of the extra emails is not valid' });
    const emails = Array.from(new Set([...(email ? [email] : []), ...extra]));
    const telegram = typeof b.telegram === 'string' && b.telegram.trim() ? b.telegram.trim().replace(/^(?!@)/, '@') : null;
    try {
      const { data, error } = await db
        .from('team_member_contacts')
        .upsert({ team_member_id: id, email, emails, telegram }, { onConflict: 'team_member_id' })
        .select('email, emails, telegram')
        .single();
      if (error) throw new Error(error.message);
      return res.status(200).json({ contact: { email: data.email ?? null, emails: (data.emails as string[]) ?? [], telegram: data.telegram ?? null } });
    } catch (e) {
      logger.error('certificates: team contact upsert failed', e);
      return res.status(500).json({ error: 'Could not save the contact' });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}

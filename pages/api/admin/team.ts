/**
 * The team master list — one place to edit a team member.
 *
 *   GET  /api/admin/team                    every member, published or not, with contact
 *   POST /api/admin/team  { profile, contact? }      a new member
 *   PUT  /api/admin/team  { id, profile?, contact? } edit either side
 *   DELETE /api/admin/team?id=<id>                  remove the person
 *
 * Two tables, one person. `team_members` is ethcali.org's about page: the site
 * reads it with `select *` and the anon key, so it holds only what may be
 * published. `team_member_contacts` holds how to reach them — emails,
 * Telegram, the wallet they gave us — and is service role only. This route is
 * the only writer of either; it accepts ADMIN_ROLE on the certificates or the
 * site contract (lib/operatorAuth.ts).
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { requireOperator, sendOperatorError } from '../../../lib/operatorAuth';
import { logger } from '../../../utils/logger';
import type { TeamContact, TeamDeleteResponse, TeamMasterMember, TeamMasterResponse, TeamProfile, TeamSaveBody, TeamSaveResponse } from '../../../types/team';

const PROFILE_COLUMNS =
  'id, slug, name, role_es, role_en, status, since, image_path, linkedin_url, twitter_url, github_url, sort_order, is_published';
const WRITABLE: (keyof Omit<TeamProfile, 'id'>)[] = [
  'slug', 'name', 'role_es', 'role_en', 'status', 'since', 'image_path',
  'linkedin_url', 'twitter_url', 'github_url', 'sort_order', 'is_published',
];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const WALLET = /^0x[0-9a-f]{40}$/;
const URL_COLS = new Set(['linkedin_url', 'twitter_url', 'github_url']);

class Invalid extends Error {}

/** Writable profile columns only; '' becomes null, as the CMS route does, so the site hides an empty link. */
function profilePatch(raw: unknown, creating: boolean): Record<string, unknown> {
  const src = (raw ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of WRITABLE) {
    if (!(k in src)) continue;
    let v = src[k];
    if (typeof v === 'string') v = v.trim() === '' ? null : v.trim();
    if (k === 'slug' && (typeof v !== 'string' || !SLUG.test(v))) throw new Invalid('Slug must be lowercase words joined by dashes');
    if (k === 'name' && (typeof v !== 'string' || v.length < 2)) throw new Invalid('Name is required');
    if (k === 'sort_order') v = Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
    if (k === 'is_published') v = v === true;
    if (k === 'since' && v !== null && !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) throw new Invalid('Since must be a date');
    if (URL_COLS.has(k) && v !== null && !/^https?:\/\//.test(String(v))) throw new Invalid(`${k.replace('_url', '')} must be a full https:// link`);
    out[k] = v;
  }
  if (creating && (!out.slug || !out.name)) throw new Invalid('A new member needs a name and a slug');
  return out;
}

function contactPatch(raw: unknown): Partial<Record<keyof TeamContact, unknown>> | null {
  if (raw == null) return null;
  const src = raw as Partial<TeamContact>;
  const out: Partial<Record<keyof TeamContact, unknown>> = {};
  if ('email' in src) {
    const e = typeof src.email === 'string' && src.email.trim() ? src.email.trim().toLowerCase() : null;
    if (e && !EMAIL.test(e)) throw new Invalid('That is not an email address');
    out.email = e;
  }
  if ('emails' in src) {
    const list = Array.isArray(src.emails) ? src.emails.map((x) => String(x).trim().toLowerCase()).filter(Boolean) : [];
    if (list.some((x) => !EMAIL.test(x))) throw new Invalid('One of the extra emails is not valid');
    out.emails = list;
  }
  if ('telegram' in src) {
    const t = typeof src.telegram === 'string' && src.telegram.trim() ? src.telegram.trim() : null;
    out.telegram = t ? (t.startsWith('@') ? t : `@${t}`) : null;
  }
  if ('wallet' in src) {
    const w = typeof src.wallet === 'string' && src.wallet.trim() ? src.wallet.trim().toLowerCase() : null;
    if (w && !WALLET.test(w)) throw new Invalid('Wallet must be a 0x address');
    out.wallet = w;
  }
  return out;
}

async function readMember(id: number): Promise<TeamMasterMember> {
  const db = getSupabaseAdmin();
  const [p, c] = await Promise.all([
    db.from('team_members').select(PROFILE_COLUMNS).eq('id', id).single(),
    db.from('team_member_contacts').select('email, emails, telegram, wallet').eq('team_member_id', id).maybeSingle(),
  ]);
  if (p.error) throw new Error(p.error.message);
  if (c.error) throw new Error(c.error.message);
  return { profile: p.data as TeamProfile, contact: (c.data as TeamContact | null) ?? null };
}

async function writeContact(id: number, patch: Partial<Record<keyof TeamContact, unknown>>): Promise<void> {
  const db = getSupabaseAdmin();
  const { data: current, error: readError } = await db
    .from('team_member_contacts')
    .select('email, emails, telegram, wallet')
    .eq('team_member_id', id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  const next = { email: null, emails: [] as string[], telegram: null, wallet: null, ...(current ?? {}), ...patch } as TeamContact;
  // The primary is always among the addresses — the table checks it, so keep it true here.
  next.emails = Array.from(new Set([...(next.email ? [next.email] : []), ...next.emails]));
  const { error } = await db.from('team_member_contacts').upsert({ team_member_id: id, ...next }, { onConflict: 'team_member_id' });
  if (error) throw new Error(error.message);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TeamMasterResponse | TeamSaveResponse | TeamDeleteResponse | { error: string }>
) {
  let operator: string;
  try {
    operator = await requireOperator(req);
  } catch (e) {
    return sendOperatorError(res, e);
  }
  const db = getSupabaseAdmin();

  try {
    if (req.method === 'GET') {
      const [members, contacts] = await Promise.all([
        db.from('team_members').select(PROFILE_COLUMNS).order('sort_order').order('name'),
        db.from('team_member_contacts').select('team_member_id, email, emails, telegram, wallet'),
      ]);
      if (members.error) throw new Error(members.error.message);
      if (contacts.error) throw new Error(contacts.error.message);
      const byId = new Map((contacts.data ?? []).map((c) => [c.team_member_id as number, c]));
      const team = (members.data as TeamProfile[]).map((profile) => {
        const c = byId.get(profile.id);
        return { profile, contact: c ? { email: c.email, emails: c.emails ?? [], telegram: c.telegram, wallet: c.wallet } : null };
      });
      return res.status(200).json({ team });
    }

    const body = (req.body ?? {}) as TeamSaveBody;

    if (req.method === 'POST') {
      const profile = profilePatch(body.profile, true);
      const contact = contactPatch(body.contact);
      const { data, error } = await db.from('team_members').insert(profile).select('id').single();
      if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'That slug is already taken' });
        throw new Error(error.message);
      }
      const id = data.id as number;
      if (contact) await writeContact(id, contact);
      logger.info(`[admin/team] ${operator} added team member ${id} (${profile.slug})`);
      return res.status(201).json({ member: await readMember(id) });
    }

    if (req.method === 'PUT') {
      const id = Number(body.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id is required' });
      const profile = body.profile ? profilePatch(body.profile, false) : {};
      // The slug is the public URL fragment; it is fixed once published.
      delete profile.slug;
      const contact = contactPatch(body.contact);
      if (Object.keys(profile).length > 0) {
        const { error } = await db.from('team_members').update(profile).eq('id', id);
        if (error) throw new Error(error.message);
      }
      if (contact && Object.keys(contact).length > 0) await writeContact(id, contact);
      logger.info(`[admin/team] ${operator} edited team member ${id}`);
      return res.status(200).json({ member: await readMember(id) });
    }

    if (req.method === 'DELETE') {
      // Gone from the about page and from the private contacts (cascade).
      // Their certificates stay — they are tokens in their wallet; the rows
      // just lose the link to a profile (team_member_id set null).
      const id = Number(req.query.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await db.from('team_members').delete().eq('id', id).select('slug, name').maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return res.status(404).json({ error: 'No such team member' });
      logger.info(`[admin/team] ${operator} deleted team member ${id} (${data.slug})`);
      return res.status(200).json({ deleted: { id, name: data.name as string } });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    if (e instanceof Invalid) return res.status(400).json({ error: e.message });
    logger.error('[admin/team] failed', e);
    return res.status(500).json({ error: 'Could not save the team member' });
  }
}

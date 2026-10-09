/**
 * Certificate events — what each event's certificates say about it.
 *
 *   GET  /api/certificates/admin/events
 *        every certificate event with its settings and the ethcali.org event
 *        behind it, plus the site events that have no settings yet
 *   POST /api/certificates/admin/events   { eventId }
 *        start certificates for a site event; settings are prefilled from the
 *        event row and edited afterwards
 *   PUT  /api/certificates/admin/events   CertEventSettings
 *        edit the settings (not the key or the event: rows and pinned
 *        diplomas point at them)
 *
 * The event's own facts — name, dates, venue, summary — stay in `events`
 * and are edited in Site content; this route only writes certificate_events.
 * Admin-only: ADMIN_ROLE on BuilderCertificate.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { logger } from '../../../../utils/logger';
import type { CertEventSettings, CertEventsResponse, SiteEventSummary } from '../../../../types/certificates';

const SITE_COLUMNS = 'id, slug, kind, name_en, name_es, starts_on, ends_on, city, summary_en, summary_es, is_published, venue:venues(name)';
const PREFIX = /^[A-Z0-9]{2,16}$/;

interface SiteRow {
  id: number;
  slug: string;
  kind: string;
  name_en: string | null;
  name_es: string | null;
  starts_on: string;
  ends_on: string | null;
  city: string | null;
  summary_en: string | null;
  summary_es: string | null;
  is_published: boolean;
  venue: { name: string } | null;
}

const toSite = (r: SiteRow): SiteEventSummary => ({
  id: r.id,
  slug: r.slug,
  name: r.name_en ?? r.name_es ?? r.slug,
  kind: r.kind,
  startsOn: r.starts_on,
  endsOn: r.ends_on,
  city: r.city,
  venue: r.venue?.name ?? null,
  summary: r.summary_en ?? r.summary_es,
  isPublished: r.is_published,
});

interface SettingsRow {
  key: string;
  event_id: number;
  credential_prefix: string;
  credential_name: string;
  title: string;
  headline: string;
  chapter: string | null;
  diploma_location: string;
  event_dates: string;
  event_name: string | null;
  event_url: string | null;
  venue_label: string | null;
  skills: string[];
}

const toSettings = (r: SettingsRow): CertEventSettings => ({
  key: r.key,
  eventId: r.event_id,
  credentialPrefix: r.credential_prefix,
  credentialName: r.credential_name,
  title: r.title,
  headline: r.headline,
  chapter: r.chapter,
  diplomaLocation: r.diploma_location,
  eventDates: r.event_dates,
  eventName: r.event_name,
  eventUrl: r.event_url,
  venueLabel: r.venue_label,
  skills: r.skills ?? [],
});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Sep 19–20, 2026", "Sep 30 – Oct 1, 2026", "Sep 19, 2026" — the diploma's footer style. */
function datesLabel(start: string, end: string | null): string {
  const [y1, m1, d1] = start.split('-').map(Number);
  if (!end || end === start) return `${MONTHS[m1 - 1]} ${d1}, ${y1}`;
  const [y2, m2, d2] = end.split('-').map(Number);
  if (y1 !== y2) return `${MONTHS[m1 - 1]} ${d1}, ${y1} – ${MONTHS[m2 - 1]} ${d2}, ${y2}`;
  if (m1 !== m2) return `${MONTHS[m1 - 1]} ${d1} – ${MONTHS[m2 - 1]} ${d2}, ${y1}`;
  return `${MONTHS[m1 - 1]} ${d1}–${d2}, ${y1}`;
}

/** A readable prefix from the slug's words and the year: "ethereum-builders-tour-cali" 2026 → EBTC26. */
function prefixFor(slug: string, startsOn: string): string {
  const letters = slug.split('-').filter(Boolean).map((w) => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${letters.slice(0, 10) || 'ETHCALI'}${startsOn.slice(2, 4)}`;
}

function settingsPatch(raw: unknown): Record<string, unknown> {
  const b = (raw ?? {}) as Partial<CertEventSettings>;
  const text = (v: unknown, name: string, required: boolean) => {
    const s = typeof v === 'string' ? v.trim() : '';
    if (required && !s) throw new Invalid(`${name} is required`);
    return s || null;
  };
  const prefix = text(b.credentialPrefix, 'Credential prefix', true)!.toUpperCase();
  if (!PREFIX.test(prefix)) throw new Invalid('Credential prefix is 2–16 capital letters or digits');
  const eventUrl = text(b.eventUrl, 'Event URL', false);
  if (eventUrl && !/^https:\/\//.test(eventUrl)) throw new Invalid('Event URL must start with https://');
  return {
    credential_prefix: prefix,
    credential_name: text(b.credentialName, 'LinkedIn name', true),
    title: text(b.title, 'Title', true),
    headline: text(b.headline, 'Headline', true),
    chapter: text(b.chapter, 'Chapter', false),
    diploma_location: text(b.diplomaLocation, 'Diploma location', true),
    event_dates: text(b.eventDates, 'Event dates', true),
    event_name: text(b.eventName, 'Event name', false),
    event_url: eventUrl,
    venue_label: text(b.venueLabel, 'Venue label', false),
    skills: Array.isArray(b.skills) ? b.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 20) : [],
  };
}

class Invalid extends Error {}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CertEventsResponse | { settings: CertEventSettings } | { error: string }>) {
  let operator: string;
  try {
    operator = await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }
  const db = getSupabaseAdmin();

  try {
    if (req.method === 'GET') {
      const [settings, site] = await Promise.all([
        db.from('certificate_events').select('*'),
        db.from('events').select(SITE_COLUMNS).order('starts_on', { ascending: false }),
      ]);
      if (settings.error) throw new Error(settings.error.message);
      if (site.error) throw new Error(site.error.message);
      const siteById = new Map((site.data as unknown as SiteRow[]).map((r) => [r.id, toSite(r)]));
      const used = new Set((settings.data as SettingsRow[]).map((s) => s.event_id));
      const events = (settings.data as SettingsRow[])
        .map((s) => ({ settings: toSettings(s), site: siteById.get(s.event_id) as SiteEventSummary }))
        .filter((e) => e.site)
        .sort((a, b) => b.site.startsOn.localeCompare(a.site.startsOn));
      const candidates = Array.from(siteById.values()).filter((e) => !used.has(e.id));
      return res.status(200).json({ events, candidates });
    }

    if (req.method === 'POST') {
      const eventId = Number((req.body ?? {}).eventId);
      if (!Number.isInteger(eventId) || eventId <= 0) return res.status(400).json({ error: 'eventId is required' });
      const { data: ev, error } = await db.from('events').select(SITE_COLUMNS).eq('id', eventId).maybeSingle();
      if (error) throw new Error(error.message);
      if (!ev) return res.status(404).json({ error: 'No such event' });
      const s = toSite(ev as unknown as SiteRow);
      const row = {
        key: s.slug,
        event_id: s.id,
        credential_prefix: prefixFor(s.slug, s.startsOn),
        credential_name: `Builder at ${s.name}`,
        title: s.name,
        headline: s.name,
        chapter: null,
        diploma_location: [s.venue, s.city].filter(Boolean).join(', ') || s.city || 'Cali, Colombia',
        event_dates: datesLabel(s.startsOn, s.endsOn),
        event_name: null,
        event_url: null,
        venue_label: null,
        skills: ['Ethereum', 'Web3', 'Blockchain'],
      };
      const { data, error: insertError } = await db.from('certificate_events').insert(row).select('*').single();
      if (insertError) {
        if (insertError.code === '23505') return res.status(409).json({ error: 'That event, key or prefix already has certificates' });
        throw new Error(insertError.message);
      }
      logger.info(`certificates: ${operator} started certificates for event ${s.id} as ${row.key}`);
      return res.status(201).json({ settings: toSettings(data as SettingsRow) });
    }

    if (req.method === 'PUT') {
      const key = typeof req.body?.key === 'string' ? req.body.key : '';
      if (!key) return res.status(400).json({ error: 'key is required' });
      const patch = settingsPatch(req.body);
      const { data, error } = await db.from('certificate_events').update(patch).eq('key', key).select('*').maybeSingle();
      if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Another event already uses that credential prefix' });
        throw new Error(error.message);
      }
      if (!data) return res.status(404).json({ error: 'No such certificate event' });
      logger.info(`certificates: ${operator} edited settings of ${key}`);
      return res.status(200).json({ settings: toSettings(data as SettingsRow) });
    }

    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    if (e instanceof Invalid) return res.status(400).json({ error: e.message });
    logger.error('certificates: events route failed', e);
    return res.status(500).json({ error: 'Could not load certificate events' });
  }
}

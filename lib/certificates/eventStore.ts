/**
 * Certificate events from the database — server-only (service role).
 *
 * certificate_events says what a certificate prints about its event; events
 * and venues are ethcali.org's own rows; certificate_event_sponsors picks the
 * partners the diploma prints, in order. Joined here into the CertEvent every
 * renderer takes, so there is one place that knows the shape of the tables.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CertEvent, CertSponsor } from './events';

/** ethcali.org serves partner artwork from its /public. */
const SITE = 'https://www.ethcali.org';

const COLUMNS = `key, event_id, credential_prefix, credential_name, title, headline, chapter, diploma_location,
  event_dates, event_name, event_url, venue_label, skills,
  event:events!inner(slug, name_en, name_es, starts_on, venue:venues(name, maps_url)),
  sponsors:certificate_event_sponsors(sort_order, print_height, partner:partners!inner(id, name, logo_path, print_logo_path))`;

export interface CertEventRow {
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
  skills: string[] | null;
  event: { slug: string; name_en: string | null; name_es: string | null; starts_on: string; venue: { name: string; maps_url: string | null } | null };
  sponsors: { sort_order: number; print_height: number; partner: { id: number; name: string; logo_path: string | null; print_logo_path: string | null } }[];
}

/** Pure: one joined row to the CertEvent renderers take. Exported for checks that run without a database. */
export function certEventFromRow(r: CertEventRow): CertEvent {
  const venueName = r.venue_label ?? r.event.venue?.name ?? null;
  const sponsors: CertSponsor[] = [...(r.sponsors ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({
      partnerId: s.partner.id,
      name: s.partner.name,
      printLogo: s.partner.print_logo_path,
      height: s.print_height,
      src: s.partner.logo_path ? (s.partner.logo_path.startsWith('http') ? s.partner.logo_path : `${SITE}${s.partner.logo_path}`) : null,
    }));
  return {
    key: r.key,
    eventId: r.event_id,
    credentialPrefix: r.credential_prefix,
    credentialName: r.credential_name,
    title: r.title,
    headline: r.headline,
    chapter: r.chapter,
    location: r.diploma_location,
    eventDates: r.event_dates,
    eventName: r.event_name ?? r.event.name_en ?? r.event.name_es ?? r.headline,
    eventUrl: r.event_url ?? `${SITE}/en/events/${r.event.slug}`,
    venueName,
    venueMapsUrl:
      r.event.venue?.maps_url ??
      (venueName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}` : null),
    startsOn: r.event.starts_on,
    skills: r.skills ?? [],
    sponsors,
  };
}

export async function loadCertEvents(db: SupabaseClient): Promise<CertEvent[]> {
  const { data, error } = await db.from('certificate_events').select(COLUMNS);
  if (error) throw new Error(error.message);
  return (data as unknown as CertEventRow[]).map(certEventFromRow).sort((a, b) => b.startsOn.localeCompare(a.startsOn));
}

export async function loadCertEvent(db: SupabaseClient, key: string): Promise<CertEvent | null> {
  const { data, error } = await db.from('certificate_events').select(COLUMNS).eq('key', key).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? certEventFromRow(data as unknown as CertEventRow) : null;
}

/** Every event a set of rows touches, keyed — what a page that lists certificates hands the browser. */
export async function loadCertEventsByKey(db: SupabaseClient, keys: Iterable<string>): Promise<Record<string, CertEvent>> {
  const want = Array.from(new Set(keys));
  if (want.length === 0) return {};
  const { data, error } = await db.from('certificate_events').select(COLUMNS).in('key', want);
  if (error) throw new Error(error.message);
  return Object.fromEntries((data as unknown as CertEventRow[]).map((r) => [r.key, certEventFromRow(r)]));
}

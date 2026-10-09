/**
 * What a certificate says, and how: roles, honors, LinkedIn, the sentences.
 *
 * Browser-safe and data-free: the event itself (title, venue, dates,
 * sponsors) comes from the database as a CertEvent — see eventStore.ts — and
 * is passed in, so the next event is rows in /admin/certificates, not code.
 */

/**
 * What a certificate certifies. `builder` is every row before 2026-10 and the
 * default; the rest are the people who made the event happen. Same contract,
 * same token: the role changes the diploma heading, the line under the name,
 * the LinkedIn name and the Role trait — all rendered from this table.
 */
export type CertRole = 'builder' | 'organizer' | 'mentor' | 'judge' | 'volunteer' | 'speaker';

export interface RoleDef {
  label: { es: string; en: string };
  /** Small-caps heading on the diploma. */
  heading: string;
  /**
   * The verb line. For a builder the object is the project ("built and
   * shipped Phycos at …"); for everyone else it is the event ("organized
   * EAG … at …" reads wrong, so these take the event name directly).
   */
  did: { en: string; es: string };
}

export const CERT_ROLES: Record<CertRole, RoleDef> = {
  builder: { label: { es: 'Builder', en: 'Builder' }, heading: 'BUILDER CERTIFICATE', did: { en: 'built and shipped', es: 'Construiste' } },
  organizer: { label: { es: 'Organizador', en: 'Organizer' }, heading: 'CONTRIBUTOR CERTIFICATE', did: { en: 'organized', es: 'Organizaste' } },
  mentor: { label: { es: 'Mentor', en: 'Mentor' }, heading: 'CONTRIBUTOR CERTIFICATE', did: { en: 'mentored the builders of', es: 'Acompañaste como mentor a los builders de' } },
  judge: { label: { es: 'Jurado', en: 'Judge' }, heading: 'CONTRIBUTOR CERTIFICATE', did: { en: 'judged the projects of', es: 'Evaluaste los proyectos de' } },
  volunteer: { label: { es: 'Voluntario', en: 'Volunteer' }, heading: 'CONTRIBUTOR CERTIFICATE', did: { en: 'made it happen as a volunteer at', es: 'Hiciste posible como voluntario' } },
  speaker: { label: { es: 'Speaker', en: 'Speaker' }, heading: 'CONTRIBUTOR CERTIFICATE', did: { en: 'spoke at', es: 'Diste una charla en' } },
};

export const parseRole = (raw: unknown): CertRole =>
  typeof raw === 'string' && raw in CERT_ROLES ? (raw as CertRole) : 'builder';

export interface Honor {
  track: 'EAG' | 'HSK Chain';
  place: number;
}

/** A sponsor as the diploma and the credential page show it. */
export interface CertSponsor {
  partnerId: number;
  name: string;
  /**
   * The logo as it reads on white paper: a path under the app's /public
   * (e.g. /certificates/logos/eag-light.png) or ipfs://<cid>. PNG — pdf-lib
   * cannot embed progressive JPEGs. Null means the diploma skips it.
   */
  printLogo: string | null;
  /** Evens out optical size: a square mark needs more height than a wide wordmark. */
  height: number;
  /** The site's own artwork, for the dark credential page. */
  src: string | null;
}

/**
 * Everything a certificate says about its event. Loaded from the database
 * (certificate_events + events + venues + partners) by
 * lib/certificates/eventStore.ts on the server, and handed to the browser as
 * plain data, so the diploma, the page and the LinkedIn entry read one source.
 */
export interface CertEvent {
  /** What builder_certificates.event holds, e.g. 'eag-cali-2026'. */
  key: string;
  /** events.id on ethcali.org. */
  eventId: number;
  /** Credential ids for this event are `<credentialPrefix>-<8 chars>`, e.g. EAGCALI26-7K3P9QXM. */
  credentialPrefix: string;
  /** On the diploma's metadata and the claim page. */
  title: string;
  /** "Name" on LinkedIn for builders. Short enough to read in a profile list. */
  credentialName: string;
  /** Diploma centre: "at <headline>", then the chapter line under it. */
  headline: string;
  chapter: string | null;
  /** Diploma footer: where and when the event ran. */
  location: string;
  eventDates: string;
  /** Short event name for the credential page, and where it lives on ethcali.org. */
  eventName: string;
  eventUrl: string;
  /** The venue as the credential page names it, and its map link. */
  venueName: string | null;
  venueMapsUrl: string | null;
  /** YYYY-MM-DD; LinkedIn's issue year and month fall back to it. */
  startsOn: string;
  /** Suggested for LinkedIn's Skills field, which the add-link cannot prefill. */
  skills: string[];
  /** Printed along the bottom of the diploma, in this order. */
  sponsors: CertSponsor[];
}

/** ETH CALI's LinkedIn page, urn:li:organization:93608244 — read off the page. */
export const LINKEDIN_ORG = {
  id: '93608244',
  url: 'https://www.linkedin.com/company/eth-cali',
  name: 'ETH Cali',
};

/** The public origin, for URLs that leave the app: LinkedIn, email, the PDF. */
export const APP_ORIGIN = 'https://app.ethcali.org';

export const credentialUrl = (credentialId: string) => `${APP_ORIGIN}/certificate/${credentialId}`;
export const credentialPdfPath = (credentialId: string) => `/api/certificates/${credentialId}/pdf`;

const ORD_EN: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };
const ORD_ES: Record<number, string> = { 1: '1er', 2: '2do', 3: '3er', 4: '4to', 5: '5to' };

export function honorLabel(h: Honor, locale: 'es' | 'en'): string {
  const track = h.track === 'EAG' ? 'EAG' : 'HashKey Chain';
  return locale === 'en'
    ? `${ORD_EN[h.place] ?? `${h.place}th`} Place · ${track} track`
    : `${ORD_ES[h.place] ?? `${h.place}º`} puesto · track ${track}`;
}

/** Only well-formed entries survive; the column is jsonb and trusts nothing. */
export function parseHonors(raw: unknown): Honor[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (h): h is Honor =>
      !!h && (h.track === 'EAG' || h.track === 'HSK Chain') && Number.isInteger(h.place) && h.place > 0
  );
}

/** LinkedIn's "Name" for this role: the event's own for builders, "<Role> at <event>" otherwise. */
export function roleCredentialName(ev: CertEvent, role: CertRole): string {
  return role === 'builder' ? ev.credentialName : `${CERT_ROLES[role].label.en} at ${ev.headline}`;
}

export interface Achievement {
  role: CertRole;
  memberName: string;
  projectName: string | null;
}

/** "Ana built and shipped Phycos at EAG Global Buildathon 2026" / "Ana organized EAG Global Buildathon 2026". */
export function achievementEn(a: Achievement, ev: CertEvent): string {
  const where = ev.headline;
  const r = CERT_ROLES[a.role];
  return a.role === 'builder' && a.projectName
    ? `${a.memberName} ${r.did.en} ${a.projectName} at ${where}`
    : `${a.memberName} ${r.did.en} ${where}`;
}

/** Second person, Spanish: "Construiste Phycos en EAG …" / "Organizaste EAG …". */
export function achievementEs(a: Achievement, ev: CertEvent): string {
  const where = ev.headline;
  const r = CERT_ROLES[a.role];
  return a.role === 'builder' && a.projectName ? `${r.did.es} ${a.projectName} en ${where}` : `${r.did.es} ${where}`;
}

/**
 * LinkedIn's "Add to profile" link, with every field it accepts filled in.
 * Skills and media are not among them; the guide on the claim page covers those.
 */
export function linkedInAddUrl(ev: CertEvent, credentialId: string, issueDate?: string, role: CertRole = 'builder'): string {
  const when = issueDate ?? ev.startsOn;
  const q = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: roleCredentialName(ev, role),
    organizationId: LINKEDIN_ORG.id,
    issueYear: String(Number(when.slice(0, 4))),
    issueMonth: String(Number(when.slice(5, 7))),
    certUrl: credentialUrl(credentialId),
    certId: credentialId,
  });
  return `https://www.linkedin.com/profile/add?${q.toString()}`;
}

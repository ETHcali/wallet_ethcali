/**
 * Everything a certificate says that is the same for every builder at an event.
 *
 * Browser-safe: the claim page, the public credential page and the PDF route
 * all read it, so the diploma, the page and the LinkedIn entry cannot drift.
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

export interface CertEvent {
  /** On the diploma, under the project. */
  title: string;
  /** "Name" on LinkedIn. Short enough to read in a profile list. */
  credentialName: string;
  venue: string;
  /** Diploma centre: "at <headline>", then the chapter line under it. */
  headline: string;
  chapter: string;
  /** Diploma footer: where and when the event ran (the issue date is per token). */
  location: string;
  eventDates: string;
  /** Short event name for the credential page, and where it lives on ethcali.org. */
  eventName: string;
  eventUrl: string;
  /** The venue as the credential page names it, and its Google Maps link. */
  venueName: string;
  venueMapsUrl: string;
  dates: { es: string; en: string };
  /** For LinkedIn's issueYear / issueMonth. */
  issueYear: number;
  issueMonth: number;
  /** Suggested for LinkedIn's Skills field, which the add-link cannot prefill. */
  skills: string[];
  /**
   * Printed along the bottom of the diploma, in this order. `file` is in
   * lib/certificates/logos and must read on white paper: the *-light files
   * are ethcali.org's sponsor artwork with its white parts recoloured to ink
   * (colour and transparency untouched). `src` is the original, for the dark
   * credential page. `height` evens out optical size: a square
   * mark needs more height than a wide wordmark to read the same.
   */
  sponsors: { name: string; file: string; height: number; /** Same artwork on ethcali.org, for the web page. */ src: string }[];
}

/**
 * One entry per hackathon. Adding the next one:
 *   1. an entry here, keyed by the `event` value its rows will carry
 *      (e.g. 'eag-medellin-2027'), with its title, venue, dates and sponsors;
 *   2. each sponsor's logo in lib/certificates/logos — PNG (pdf-lib cannot
 *      embed progressive JPEGs), legible on white; white-on-transparent
 *      artwork needs its white recoloured to ink first;
 *   3. its participants loaded into builder_certificates with that `event`.
 * The diploma, the credential page, LinkedIn and the admin list follow.
 */
export const CERT_EVENTS: Record<string, CertEvent> = {
  'eag-cali-2026': {
    title: 'EAG Global Buildathon · Ethereum Builders Tour',
    credentialName: 'Builder at EAG Global Buildathon 2026',
    venue: 'Universidad Icesi · Cali, Colombia',
    headline: 'EAG Global Buildathon 2026',
    chapter: 'Ethereum Builders Tour · Colombia chapter',
    location: 'Universidad Icesi, Cali',
    eventDates: 'Sep 19–20, 2026',
    eventName: 'EAG Global Buildathon · Colombia',
    eventUrl: 'https://www.ethcali.org/builders-tour',
    venueName: 'Auditorio SIDOC — Universidad Icesi, Cali',
    // The same query ethcali.org's Builders Tour page uses (TOUR.venue.query).
    venueMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      'ICESI University Cl. 18 #122-135, Barrio Pance, Cali, Valle del Cauca, Colombia'
    )}`,
    dates: { es: '19–20 de septiembre de 2026', en: '19–20 September 2026' },
    issueYear: 2026,
    issueMonth: 9,
    skills: ['Ethereum', 'Smart Contracts', 'Web3', 'Blockchain', 'Hackathon'],
    // The tour's sponsor wall (ethcaliorg/content/builders-tour.ts), title
    // sponsor first. ETH Cali is not repeated: it is the issuer, and its mark
    // already heads the diploma.
    sponsors: [
      { name: 'HashKey Chain', file: 'hashkey-chain.png', src: 'https://www.ethcali.org/tour/hashkey-chain.jpg', height: 30 },
      { name: 'Ethereum Applications Guild', file: 'eag-light.png', src: 'https://www.ethcali.org/tour/eag.png', height: 26 },
      { name: 'Devcon VIII India', file: 'devcon-viii.png', src: 'https://www.ethcali.org/tour/devcon-viii.webp', height: 36 },
      { name: 'Universidad Icesi', file: 'universidad_icesi.png', src: 'https://www.ethcali.org/universities/universidad_icesi.png', height: 26 },
      { name: 'Ekinoxis Labs', file: 'ekinoxis-light.png', src: 'https://www.ethcali.org/tour/ekinoxis.png', height: 34 },
    ],
  },
};

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
  event: string;
}

/** "Ana built and shipped Phycos at EAG Global Buildathon 2026" / "Ana organized EAG Global Buildathon 2026". */
export function achievementEn(a: Achievement): string {
  const ev = CERT_EVENTS[a.event];
  const where = ev?.headline ?? a.event;
  const r = CERT_ROLES[a.role];
  return a.role === 'builder' && a.projectName
    ? `${a.memberName} ${r.did.en} ${a.projectName} at ${where}`
    : `${a.memberName} ${r.did.en} ${where}`;
}

/** Second person, Spanish: "Construiste Phycos en EAG …" / "Organizaste EAG …". */
export function achievementEs(a: Achievement): string {
  const ev = CERT_EVENTS[a.event];
  const where = ev?.headline ?? a.event;
  const r = CERT_ROLES[a.role];
  return a.role === 'builder' && a.projectName ? `${r.did.es} ${a.projectName} en ${where}` : `${r.did.es} ${where}`;
}

/**
 * LinkedIn's "Add to profile" link, with every field it accepts filled in.
 * Skills and media are not among them; the guide on the claim page covers those.
 */
export function linkedInAddUrl(eventKey: string, credentialId: string, issueDate?: string, role: CertRole = 'builder'): string | null {
  const ev = CERT_EVENTS[eventKey];
  if (!ev) return null;
  const q = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: roleCredentialName(ev, role),
    organizationId: LINKEDIN_ORG.id,
    issueYear: issueDate ? String(Number(issueDate.slice(0, 4))) : String(ev.issueYear),
    issueMonth: issueDate ? String(Number(issueDate.slice(5, 7))) : String(ev.issueMonth),
    certUrl: credentialUrl(credentialId),
    certId: credentialId,
  });
  return `https://www.linkedin.com/profile/add?${q.toString()}`;
}

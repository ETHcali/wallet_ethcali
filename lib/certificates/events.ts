/**
 * Everything a certificate says that is the same for every builder at an event.
 *
 * Browser-safe: the claim page, the public credential page and the PDF route
 * all read it, so the diploma, the page and the LinkedIn entry cannot drift.
 */

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
  dates: { es: string; en: string };
  /** For LinkedIn's issueYear / issueMonth. */
  issueYear: number;
  issueMonth: number;
  /** Suggested for LinkedIn's Skills field, which the add-link cannot prefill. */
  skills: string[];
  /**
   * Printed along the bottom of the diploma, in this order. Files live in
   * lib/certificates/logos (the same artwork as ethcali.org's sponsor wall,
   * all drawn for a dark ground). `height` evens out optical size: a square
   * mark needs more height than a wide wordmark to read the same.
   */
  sponsors: { name: string; file: string; height: number; /** Same artwork on ethcali.org, for the web page. */ src: string }[];
}

/**
 * One entry per hackathon. Adding the next one:
 *   1. an entry here, keyed by the `event` value its rows will carry
 *      (e.g. 'eag-medellin-2027'), with its title, venue, dates and sponsors;
 *   2. each sponsor's logo in lib/certificates/logos — artwork for a dark
 *      ground, PNG (pdf-lib cannot embed progressive JPEGs);
 *   3. its participants loaded into builder_certificates with that `event`.
 * The diploma, the credential page, LinkedIn and the admin list follow.
 */
export const CERT_EVENTS: Record<string, CertEvent> = {
  'eag-cali-2026': {
    title: 'EAG Global Buildathon · Ethereum Builders Tour',
    credentialName: 'Builder — EAG Global Buildathon, Cali 2026',
    venue: 'Universidad Icesi · Cali, Colombia',
    dates: { es: '19–20 de septiembre de 2026', en: '19–20 September 2026' },
    issueYear: 2026,
    issueMonth: 9,
    skills: ['Ethereum', 'Smart Contracts', 'Web3', 'Blockchain', 'Hackathon'],
    // The tour's sponsor wall (ethcaliorg/content/builders-tour.ts), title
    // sponsor first. ETH Cali is not repeated: it is the issuer, and its mark
    // already heads the diploma.
    sponsors: [
      { name: 'HashKey Chain', file: 'hashkey-chain.png', src: 'https://www.ethcali.org/tour/hashkey-chain.jpg', height: 30 },
      { name: 'Ethereum Applications Guild', file: 'eag.png', src: 'https://www.ethcali.org/tour/eag.png', height: 26 },
      { name: 'Ethereum Foundation', file: 'ef-logo.png', src: 'https://www.ethcali.org/tour/ef-logo.png', height: 26 },
      { name: 'Universidad Icesi', file: 'universidad_icesi.png', src: 'https://www.ethcali.org/universities/universidad_icesi.png', height: 26 },
      { name: 'Ekinoxis Labs', file: 'ekinoxis.png', src: 'https://www.ethcali.org/tour/ekinoxis.png', height: 34 },
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

/**
 * LinkedIn's "Add to profile" link, with every field it accepts filled in.
 * Skills and media are not among them; the guide on the claim page covers those.
 */
export function linkedInAddUrl(eventKey: string, credentialId: string): string | null {
  const ev = CERT_EVENTS[eventKey];
  if (!ev) return null;
  const q = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: ev.credentialName,
    organizationId: LINKEDIN_ORG.id,
    issueYear: String(ev.issueYear),
    issueMonth: String(ev.issueMonth),
    certUrl: credentialUrl(credentialId),
    certId: credentialId,
  });
  return `https://www.linkedin.com/profile/add?${q.toString()}`;
}

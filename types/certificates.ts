import type { CertEvent, CertRole, Honor } from '../lib/certificates/events';

/** One builder certificate, as the signed-in builder sees it. */
export interface CertificateView {
  id: number;
  event: string;
  /** What it certifies; builder rows carry a project, contributor rows do not. */
  role: CertRole;
  projectSlug: string | null;
  projectName: string | null;
  memberName: string;
  /** Public id: LinkedIn's "Credential ID" and the credential URL's last segment. */
  credentialId: string;
  /** YYYY-MM-DD. */
  issueDate: string;
  honors: Honor[];
  /** Lowercase address, or null until claimed. */
  wallet: string | null;
  claimedAt: string | null;
  /** Set once the certificate is issued on chain; the wallet is then fixed. */
  issuedTx: string | null;
  /** The NFT, once minted (arrives with issuedTx). */
  tokenId: string | null;
  /** The diploma PNG on IPFS (the NFT's image), once pinned. */
  imageCid: string | null;
}

/** What anyone holding the credential URL may see. No email, ever. */
export interface PublicCertificate {
  event: string;
  role: CertRole;
  projectSlug: string | null;
  projectName: string | null;
  memberName: string;
  credentialId: string;
  issueDate: string;
  honors: Honor[];
  issuedTx: string | null;
  /** Only once issued: the address the NFT went to. */
  wallet: string | null;
  tokenId: string | null;
  /** The id this certificate mints as (reserved before minting; equals tokenId after). */
  plannedTokenId: string | null;
  imageCid: string | null;
  metadataCid: string | null;
  /** ISO time of the mint's block, read from the chain (status route only). */
  issuedAt?: string | null;
}

export interface CertificatesResponse {
  certificates: CertificateView[];
  /** Every event those certificates belong to, keyed by builder_certificates.event. */
  events: Record<string, CertEvent>;
}

export interface CertificateClaimResponse {
  certificate: CertificateView;
}

/** A participant as operators see them: every address, and the Luma check-in. */
export interface AdminCertificate extends CertificateView {
  email: string;
  emails: string[];
  checkedInAt: string | null;
  /** The ERC-721 JSON on IPFS; what issue() mints against. */
  metadataCid: string | null;
  /** The token id reserved for it; issue() must land it exactly there. */
  plannedTokenId: string | null;
  /** When the certificate email went out (after the mint), or null. */
  notifiedAt: string | null;
}

/** POST /api/certificates/admin/notify — what happened to each selected certificate. */
export interface NotifyResponse {
  /** Nothing was sent: what each email would say, and to whom. */
  dryRun: boolean;
  sent: { credentialId: string; to: string[]; subject: string }[];
  /** Not sent, with the reason: not issued, already notified, Resend refused. */
  skipped: { credentialId: string; reason: string }[];
}

export interface IssueConfirmResponse {
  /** Credential ids whose mint this transaction proved, with their token ids. */
  issued: { credentialId: string; tokenId: string }[];
}

/** POST /api/certificates/admin/participants — one person added from the admin page. */
export interface AddParticipantBody {
  event: string;
  role: CertRole;
  memberName: string;
  /** Primary email; `emails` may add the others they used. */
  email: string;
  emails?: string[];
  /** Builders only. */
  projectName?: string;
  projectSlug?: string;
  /** Create (or find) their ETH Cali wallet from the email now, so the certificate can be issued without waiting for a claim. */
  createWallet?: boolean;
  /** When the person is on the team: ties the certificate to their public profile. */
  teamMemberId?: number;
}

/** A team member as the certificates admin sees them: public profile + private contact + certificates for one event. */
export interface TeamMemberForCerts {
  id: number;
  slug: string;
  name: string;
  status: string | null;
  linkedinUrl: string | null;
  isPublished: boolean;
  /** Private (team_member_contacts); null when nobody has filled it in yet. */
  contact: { email: string | null; emails: string[]; telegram: string | null } | null;
  certificates: { role: CertRole; credentialId: string; issued: boolean; notified: boolean }[];
}

export interface TeamForCertsResponse {
  event: string;
  team: TeamMemberForCerts[];
}

export interface AddParticipantResponse {
  certificate: AdminCertificate;
  /** True when the wallet was created by this call (a new Privy account or a new embedded wallet). */
  walletCreated: boolean;
}

export interface AdminCertificatesResponse {
  certificates: AdminCertificate[];
  events: Record<string, CertEvent>;
}

/** The certificate settings an operator edits for one event (certificate_events, minus the joins). */
export interface CertEventSettings {
  key: string;
  eventId: number;
  credentialPrefix: string;
  credentialName: string;
  title: string;
  headline: string;
  chapter: string | null;
  diplomaLocation: string;
  eventDates: string;
  eventName: string | null;
  eventUrl: string | null;
  venueLabel: string | null;
  skills: string[];
}

/** An ethcali.org event, as the certificates admin shows it next to the settings. */
export interface SiteEventSummary {
  id: number;
  slug: string;
  name: string;
  kind: string;
  startsOn: string;
  endsOn: string | null;
  city: string | null;
  venue: string | null;
  summary: string | null;
  isPublished: boolean;
}

export interface CertEventsResponse {
  /** Events that issue certificates, newest first, with their settings and the site event behind them. */
  events: { settings: CertEventSettings; site: SiteEventSummary }[];
  /** Site events with no certificate settings yet — what "New certificate event" offers. */
  candidates: SiteEventSummary[];
}

export interface PartnerForCerts {
  id: number;
  slug: string;
  name: string;
  kind: string;
  logoPath: string | null;
  printLogoPath: string | null;
  isPublished: boolean;
}

export interface CertSponsorsResponse {
  sponsors: { partnerId: number; printHeight: number }[];
  partners: PartnerForCerts[];
}

import type { CertRole, Honor } from '../lib/certificates/events';

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
}

export interface AddParticipantResponse {
  certificate: AdminCertificate;
  /** True when the wallet was created by this call (a new Privy account or a new embedded wallet). */
  walletCreated: boolean;
}

export interface AdminCertificatesResponse {
  certificates: AdminCertificate[];
}

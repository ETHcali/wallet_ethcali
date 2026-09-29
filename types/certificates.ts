import type { Honor } from '../lib/certificates/events';

/** One builder certificate, as the signed-in builder sees it. */
export interface CertificateView {
  id: number;
  event: string;
  projectSlug: string;
  projectName: string;
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
  projectSlug: string;
  projectName: string;
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
}

export interface IssueConfirmResponse {
  /** Credential ids whose mint this transaction proved, with their token ids. */
  issued: { credentialId: string; tokenId: string }[];
}

export interface AdminCertificatesResponse {
  certificates: AdminCertificate[];
}

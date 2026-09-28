/** One builder certificate, as the signed-in builder sees it. */
export interface CertificateView {
  id: number;
  event: string;
  projectSlug: string;
  projectName: string;
  memberName: string;
  /** Lowercase address, or null until claimed. */
  wallet: string | null;
  claimedAt: string | null;
  /** Set once the certificate is issued on chain; the wallet is then fixed. */
  issuedTx: string | null;
}

export interface CertificatesResponse {
  certificates: CertificateView[];
}

export interface CertificateClaimResponse {
  certificate: CertificateView;
}

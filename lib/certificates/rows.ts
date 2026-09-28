/**
 * Reading builder_certificates — server-only (service role).
 *
 * Two shapes leave the server: the owner's view (their own rows, after the
 * Privy check) and the public view (by credential id, for the credential page
 * and the PDF). The public one never carries the email, and carries the wallet
 * only once the certificate is issued to it.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseHonors } from './events';
import type { AdminCertificate, CertificateView, PublicCertificate } from '../../types/certificates';

export const OWNER_COLUMNS =
  'id, event, project_slug, project_name, member_name, email, credential_id, issue_date, honors, wallet, claimed_at, issued_tx';

export const ADMIN_COLUMNS = `${OWNER_COLUMNS}, emails, checked_in_at`;

export interface CertificateRow {
  id: number;
  event: string;
  project_slug: string;
  project_name: string;
  member_name: string;
  email: string;
  credential_id: string;
  issue_date: string;
  honors: unknown;
  wallet: string | null;
  claimed_at: string | null;
  issued_tx: string | null;
}

export const toOwnerView = (r: CertificateRow): CertificateView => ({
  id: r.id,
  event: r.event,
  projectSlug: r.project_slug,
  projectName: r.project_name,
  memberName: r.member_name,
  credentialId: r.credential_id,
  issueDate: r.issue_date,
  honors: parseHonors(r.honors),
  wallet: r.wallet,
  claimedAt: r.claimed_at,
  issuedTx: r.issued_tx,
});

export const toAdminView = (r: CertificateRow & { emails: string[]; checked_in_at: string | null }): AdminCertificate => ({
  ...toOwnerView(r),
  email: r.email,
  emails: r.emails,
  checkedInAt: r.checked_in_at,
});

/** Credential ids are uppercase letters, digits and one dash — anything else is not one. */
export const CREDENTIAL_RE = /^[A-Z0-9]{2,16}-[A-Z0-9]{6,16}$/;

export async function getPublicCertificate(
  db: SupabaseClient,
  credentialId: string
): Promise<PublicCertificate | null> {
  const id = credentialId.toUpperCase();
  if (!CREDENTIAL_RE.test(id)) return null;
  const { data, error } = await db
    .from('builder_certificates')
    .select('event, project_slug, project_name, member_name, credential_id, issue_date, honors, wallet, issued_tx')
    .eq('credential_id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    event: data.event,
    projectSlug: data.project_slug,
    projectName: data.project_name,
    memberName: data.member_name,
    credentialId: data.credential_id,
    issueDate: data.issue_date,
    honors: parseHonors(data.honors),
    issuedTx: data.issued_tx,
    wallet: data.issued_tx ? data.wallet : null,
  };
}

/**
 * POST /api/certificates/admin/notify
 *   { credentialIds: string[], dryRun?: boolean, testTo?: string }
 *
 * Tell builders their certificate NFT is out: one email per certificate, with
 * the diploma attached and links to the credential page and the token
 * (lib/certificates/email.ts). Only issued, not-yet-notified certificates are
 * sent; the rest are reported as skipped with the reason, and a send that
 * Resend accepts stamps notified_at so a second click sends nothing.
 *
 *   dryRun   render only: who would get what, nothing leaves
 *   testTo   send each selected email to this one address instead of the
 *            builder, flagged "[Prueba]"; nothing is stamped. Must be one of
 *            the caller's own verified emails.
 *
 * Admin-only: ADMIN_ROLE on BuilderCertificate. Sends run one at a time with
 * a pause between them, under Resend's 2 req/s.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { requireUser, sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { CREDENTIAL_RE } from '../../../../lib/certificates/rows';
import { parseHonors, parseRole } from '../../../../lib/certificates/events';
import {
  renderCertificateEmail,
  sendCertificateEmail,
  sendCertificateEmailTest,
  type CertificateEmailInput,
} from '../../../../lib/certificates/email';
import { emailConfigError } from '../../../../lib/email/resend';
import { logger } from '../../../../utils/logger';
import type { NotifyResponse } from '../../../../types/certificates';

const MAX_BATCH = 100;
const PAUSE_MS = 600;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req: NextApiRequest, res: NextApiResponse<NotifyResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let caller;
  try {
    await requireCertAdmin(req);
    caller = await requireUser(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  const body = (req.body ?? {}) as { credentialIds?: unknown; dryRun?: unknown; testTo?: unknown };
  const ids = Array.isArray(body.credentialIds)
    ? Array.from(new Set(body.credentialIds.filter((v): v is string => typeof v === 'string').map((v) => v.toUpperCase())))
    : [];
  if (ids.length === 0 || ids.length > MAX_BATCH || ids.some((id) => !CREDENTIAL_RE.test(id))) {
    return res.status(400).json({ error: `credentialIds must be 1–${MAX_BATCH} credential ids` });
  }
  const dryRun = body.dryRun === true;
  const testTo = typeof body.testTo === 'string' ? body.testTo.trim().toLowerCase() : null;
  if (testTo && !caller.emails.includes(testTo)) {
    return res.status(400).json({ error: 'testTo must be one of your own verified emails' });
  }
  const missing = emailConfigError();
  if (!dryRun && missing) return res.status(503).json({ error: `Email is off: ${missing}` });

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('builder_certificates')
      .select('event, role, member_name, project_name, credential_id, issue_date, honors, email, emails, wallet, issued_tx, token_id, notified_at')
      .in('credential_id', ids);
    if (error) throw new Error(error.message);
    const byId = new Map((data ?? []).map((r) => [r.credential_id as string, r]));

    const out: NotifyResponse = { dryRun, sent: [], skipped: [] };
    for (const id of ids) {
      const r = byId.get(id);
      if (!r) {
        out.skipped.push({ credentialId: id, reason: 'no such certificate' });
        continue;
      }
      if (!r.issued_tx || r.token_id == null || !r.wallet) {
        out.skipped.push({ credentialId: id, reason: 'not issued yet' });
        continue;
      }
      if (r.notified_at && !testTo) {
        out.skipped.push({ credentialId: id, reason: `already sent ${String(r.notified_at).slice(0, 10)}` });
        continue;
      }
      const input: CertificateEmailInput = {
        event: r.event,
        role: parseRole(r.role),
        memberName: r.member_name,
        projectName: r.project_name,
        credentialId: r.credential_id,
        issueDate: r.issue_date,
        honors: parseHonors(r.honors),
        tokenId: String(r.token_id),
        wallet: r.wallet,
        emails: Array.isArray(r.emails) && r.emails.length ? r.emails : [r.email],
      };
      const to = testTo ? [testTo] : input.emails;

      if (dryRun) {
        out.sent.push({ credentialId: id, to, subject: renderCertificateEmail(input).subject });
        continue;
      }

      if (out.sent.length) await sleep(PAUSE_MS);
      const result = testTo ? await sendCertificateEmailTest(input, testTo) : await sendCertificateEmail(input);
      if (!result.sent) {
        logger.warn(`certificates: email for ${id} not sent: ${result.reason}`);
        out.skipped.push({ credentialId: id, reason: result.reason ?? 'not sent' });
        continue;
      }
      if (!testTo) {
        const { error: stampError } = await db
          .from('builder_certificates')
          .update({ notified_at: new Date().toISOString() })
          .eq('credential_id', id)
          .is('notified_at', null);
        // The email is out either way; the idempotency key protects the next 24h.
        if (stampError) logger.error(`certificates: sent ${id} (${result.id}) but could not stamp notified_at`, stampError);
      }
      out.sent.push({ credentialId: id, to, subject: renderCertificateEmail(input).subject });
    }
    return res.status(200).json(out);
  } catch (e) {
    logger.error('certificates: notify failed', e);
    return res.status(500).json({ error: 'Could not send certificate emails' });
  }
}

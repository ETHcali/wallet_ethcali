/**
 * POST /api/certificates/admin/participants — add one person from the admin page.
 *
 *   { event, role, memberName, email, emails?, projectName?, projectSlug?, createWallet? }
 *
 * Step 1 of the runbook without SQL: the row, a fresh credential id
 * (<event prefix>-<8 chars>, unambiguous alphabet), and — by default — their
 * ETH Cali wallet, found or created from the email through Privy, written as
 * the claim. The person can still sign in with that email and change the
 * wallet until the certificate is issued; what this removes is the wait.
 *
 * A builder needs a project; a contributor must not have one (the database
 * says the same). One certificate per (event, project-or-role, email): a
 * second add for the same person is a 409, not a duplicate.
 *
 * Admin-only: ADMIN_ROLE on BuilderCertificate.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomInt } from 'node:crypto';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { CERT_EVENTS, CERT_ROLES, parseRole } from '../../../../lib/certificates/events';
import { ADMIN_COLUMNS, toAdminView, type AdminRow } from '../../../../lib/certificates/rows';
import { PrivyUserError, resolveStaffWallet } from '../../../../lib/swag/privyUsers';
import { logger } from '../../../../utils/logger';
import type { AddParticipantBody, AddParticipantResponse } from '../../../../types/certificates';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,80}$/;
/** No 0/O/1/I: these ids get read aloud and typed into LinkedIn. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCredentialId = (prefix: string) =>
  `${prefix}-${Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')}`;

class BadRequest extends Error {}

function parse(raw: unknown): Required<Omit<AddParticipantBody, 'projectName' | 'projectSlug'>> & {
  projectName: string | null;
  projectSlug: string | null;
} {
  const b = (raw ?? {}) as Partial<AddParticipantBody>;
  if (typeof b.event !== 'string' || !CERT_EVENTS[b.event]) throw new BadRequest('Unknown event');
  const role = parseRole(b.role);
  if (b.role !== role) throw new BadRequest('Unknown role');
  const memberName = typeof b.memberName === 'string' ? b.memberName.trim().replace(/\s+/g, ' ') : '';
  if (memberName.length < 2 || memberName.length > 120) throw new BadRequest('Name is required');
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email)) throw new BadRequest('A valid email is required');
  const extra = Array.isArray(b.emails) ? b.emails : [];
  const emails = Array.from(new Set([email, ...extra.map((e) => String(e).trim().toLowerCase())].filter(Boolean)));
  if (emails.some((e) => !EMAIL.test(e))) throw new BadRequest('One of the extra emails is not valid');

  let projectName: string | null = null;
  let projectSlug: string | null = null;
  if (role === 'builder') {
    projectName = typeof b.projectName === 'string' ? b.projectName.trim() : '';
    projectSlug = typeof b.projectSlug === 'string' ? b.projectSlug.trim().toLowerCase() : '';
    if (!projectName) throw new BadRequest('A builder needs a project name');
    if (!SLUG.test(projectSlug)) throw new BadRequest('A builder needs the Devfolio project slug (lowercase, dashes)');
  } else if (b.projectName || b.projectSlug) {
    throw new BadRequest(`A ${CERT_ROLES[role].label.en.toLowerCase()} certificate has no project`);
  }
  return { event: b.event, role, memberName, email, emails, projectName, projectSlug, createWallet: b.createWallet !== false };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AddParticipantResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let operator: string;
  try {
    operator = await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  let input: ReturnType<typeof parse>;
  try {
    input = parse(req.body);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid request' });
  }

  try {
    // The wallet first: if Privy fails, no half-row is left behind.
    let wallet: string | null = null;
    let walletCreated = false;
    if (input.createWallet) {
      const resolved = await resolveStaffWallet(input.email);
      wallet = resolved.address;
      walletCreated = resolved.created;
    }

    const db = getSupabaseAdmin();
    const prefix = CERT_EVENTS[input.event].credentialPrefix;
    const now = new Date().toISOString();
    for (let attempt = 0; attempt < 5; attempt++) {
      const credentialId = newCredentialId(prefix);
      const { data, error } = await db
        .from('builder_certificates')
        .insert({
          event: input.event,
          role: input.role,
          project_slug: input.projectSlug,
          project_name: input.projectName,
          member_name: input.memberName,
          email: input.email,
          emails: input.emails,
          credential_id: credentialId,
          issue_date: now.slice(0, 10),
          wallet,
          claimed_at: wallet ? now : null,
        })
        .select(ADMIN_COLUMNS)
        .single();
      if (!error) {
        logger.info(`certificates: ${operator} added ${input.role} ${credentialId} for ${input.email}${wallet ? ` → ${wallet}` : ''}`);
        return res.status(201).json({ certificate: toAdminView(data as unknown as AdminRow), walletCreated });
      }
      if (error.code !== '23505') throw new Error(error.message);
      // Unique violation: a credential id collision (retry) or the same person twice (stop).
      if (!/credential/.test(error.message)) {
        return res.status(409).json({ error: 'This person already has that certificate for this event' });
      }
    }
    throw new Error('Could not find a free credential id');
  } catch (e) {
    if (e instanceof PrivyUserError) return res.status(e.status).json({ error: e.message });
    logger.error('certificates: add participant failed', e);
    return res.status(500).json({ error: 'Could not add this person' });
  }
}

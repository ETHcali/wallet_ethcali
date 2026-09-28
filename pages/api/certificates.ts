/**
 * Builder certificates for the signed-in builder.
 *
 *   GET  /api/certificates                 → the caller's rows
 *   POST /api/certificates  { id, to? }    → record the wallet it goes to
 *
 * Ownership is the same rule as /api/swag/claim: a row is yours when its email
 * is one of the emails Privy verified for this session. The caller never names
 * an email. `to` must be one of the caller's own linked wallets and defaults to
 * the embedded one, so a builder who signed up with only an email still ends
 * up with an address — the one the app made for them.
 *
 * A claim can be changed until the certificate is issued (`issued_tx`); after
 * that the proof already went to that address, and moving it is an operator's
 * decision, not a button.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';
import { getSupabaseAdmin } from '../../lib/supabase';
import { requireUser, sendAuthError } from '../../lib/swag/requireUser';
import { logger } from '../../utils/logger';
import { OWNER_COLUMNS, toOwnerView, type CertificateRow } from '../../lib/certificates/rows';
import type { CertificateClaimResponse, CertificatesResponse } from '../../types/certificates';

type Reply = CertificatesResponse | CertificateClaimResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user;
  try {
    user = await requireUser(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  // No verified email, no rows — and no query that could match on nothing.
  if (user.emails.length === 0) {
    return req.method === 'GET'
      ? res.status(200).json({ certificates: [] })
      : res.status(404).json({ error: 'No such certificate' });
  }

  const db = getSupabaseAdmin();

  try {
    if (req.method === 'GET') {
      const { data, error } = await db
        .from('builder_certificates')
        .select(OWNER_COLUMNS)
        .in('email', user.emails)
        .order('id');
      if (error) throw new Error(error.message);
      return res.status(200).json({ certificates: (data as CertificateRow[]).map(toOwnerView) });
    }

    const body = (req.body ?? {}) as { id?: unknown; to?: unknown };
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id is required' });
    }

    let to: string | null;
    if (body.to !== undefined) {
      if (typeof body.to !== 'string' || !isAddress(body.to)) {
        return res.status(400).json({ error: 'to must be an address' });
      }
      to = body.to.toLowerCase();
      if (!user.wallets.includes(to)) {
        return res.status(403).json({ error: 'That wallet is not linked to this account' });
      }
    } else {
      to = user.embeddedWallet ?? user.wallets[0] ?? null;
    }
    if (!to) {
      return res.status(400).json({ error: 'Link a wallet to this account first' });
    }

    // Ownership and "not issued yet" are part of the WHERE, not a read-then-
    // write, so two tabs cannot race a claim past either check.
    const { data, error } = await db
      .from('builder_certificates')
      .update({ wallet: to, claimed_at: new Date().toISOString() })
      .eq('id', id)
      .in('email', user.emails)
      .is('issued_tx', null)
      .select(OWNER_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!data) {
      // Either not yours, not there, or already issued. Say which only when
      // the row is provably the caller's.
      const { data: own } = await db
        .from('builder_certificates')
        .select('issued_tx')
        .eq('id', id)
        .in('email', user.emails)
        .maybeSingle();
      if (own?.issued_tx) {
        return res.status(409).json({ error: 'This certificate was already issued' });
      }
      return res.status(404).json({ error: 'No such certificate' });
    }

    return res.status(200).json({ certificate: toOwnerView(data as CertificateRow) });
  } catch (e) {
    logger.error('certificates: request failed', e);
    return res.status(500).json({ error: 'Could not reach the certificate list' });
  }
}

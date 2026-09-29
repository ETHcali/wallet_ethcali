/**
 * POST /api/certificates/admin/confirm  { txHash }
 *
 * After an operator's issue() lands, record which certificates it minted.
 * The chain decides, the row remembers: the server reads the receipt itself,
 * keeps only CertificateIssued logs emitted by BuilderCertificate, and for
 * each one records token_id + issued_tx on the row whose credential id and
 * wallet match the log. A log that matches no row, or a row whose wallet is
 * not the log's recipient, is reported and not written.
 *
 * Admin-only: ADMIN_ROLE on BuilderCertificate (lib/certificates/requireCertAdmin.ts). Idempotent: confirming
 * the same transaction twice changes nothing.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { decodeEventLog, type Hex } from 'viem';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { publicClientFor } from '../../../../config/chains';
import { CERT_ABI, CERT_ADDRESS, CERT_CHAIN_ID, bytes32ToCredential } from '../../../../lib/certificates/nft';
import { logger } from '../../../../utils/logger';
import type { IssueConfirmResponse } from '../../../../types/certificates';

const isTxHash = (v: unknown): v is Hex => typeof v === 'string' && /^0x[0-9a-fA-F]{64}$/.test(v);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IssueConfirmResponse | { error: string; skipped?: string[] }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    await requireCertAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  const txHash = (req.body ?? {}).txHash;
  if (!isTxHash(txHash)) return res.status(400).json({ error: 'txHash must be a 32-byte hex hash' });

  try {
    const client = publicClientFor(CERT_CHAIN_ID);
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') return res.status(422).json({ error: 'That transaction reverted' });

    const issued: { credentialId: string; tokenId: bigint; to: string }[] = [];
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== CERT_ADDRESS.toLowerCase()) continue;
      try {
        const d = decodeEventLog({ abi: CERT_ABI, data: log.data, topics: log.topics });
        if (d.eventName !== 'CertificateIssued') continue;
        const a = d.args as unknown as { tokenId: bigint; to: string; credentialId: Hex };
        issued.push({ credentialId: bytes32ToCredential(a.credentialId), tokenId: a.tokenId, to: a.to.toLowerCase() });
      } catch {
        // Transfer, Locked, MetadataUpdate — not ours to record.
      }
    }
    if (issued.length === 0) {
      return res.status(422).json({ error: 'That transaction issued no certificate on BuilderCertificate' });
    }

    const db = getSupabaseAdmin();
    const recorded: IssueConfirmResponse['issued'] = [];
    const skipped: string[] = [];
    for (const it of issued) {
      const { data, error } = await db
        .from('builder_certificates')
        .update({ token_id: it.tokenId.toString(), issued_tx: txHash.toLowerCase() })
        .eq('credential_id', it.credentialId)
        .eq('wallet', it.to)
        .is('issued_tx', null)
        .select('credential_id')
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (data) {
        recorded.push({ credentialId: it.credentialId, tokenId: it.tokenId.toString() });
        continue;
      }
      // Already recorded by an earlier confirm of this same tx is fine.
      const { data: existing } = await db
        .from('builder_certificates')
        .select('issued_tx, token_id')
        .eq('credential_id', it.credentialId)
        .maybeSingle();
      if (existing?.issued_tx === txHash.toLowerCase() && String(existing.token_id) === it.tokenId.toString()) {
        recorded.push({ credentialId: it.credentialId, tokenId: it.tokenId.toString() });
      } else {
        skipped.push(`${it.credentialId} → ${it.to}`);
      }
    }
    if (skipped.length) logger.warn('certificates: minted logs that match no row', skipped);
    return res.status(200).json({ issued: recorded, ...(skipped.length ? { skipped } : {}) } as IssueConfirmResponse);
  } catch (e) {
    logger.error('certificates: confirm failed', e);
    return res.status(500).json({ error: 'Could not read that transaction' });
  }
}

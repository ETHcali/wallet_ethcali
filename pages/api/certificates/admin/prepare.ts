/**
 * POST /api/certificates/admin/prepare  { credentialId }
 *
 * Step 3 of the runbook, one certificate per call: reserve its token id,
 * render its diploma, and pin what the mint will point at.
 *
 *   1. planned_token_id — kept if set; otherwise the next free id after both
 *      BuilderCertificate.totalIssued() and every id already reserved. The
 *      diploma prints it, and Emitir refuses a batch that would land elsewhere.
 *   2. the diploma PDF (the same file /api/certificates/<id>/pdf serves) and its
 *      2924×2066 PNG (lib/certificates/rasterize.ts), both pinned
 *   3. the ERC-721 JSON (lib/certificates/metadata.ts), pinned; the row gets
 *      image_cid, pdf_cid, metadata_cid
 *
 * The client calls it once per selected row, in order, so ids come out
 * consecutive and each call stays well inside a function's time limit.
 * A minted certificate can be re-prepared (a corrected diploma): its token id
 * is fixed, and the Mint tab's "Actualizar metadata" re-points the token.
 *
 * Admin-only: ADMIN_ROLE on BuilderCertificate.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from '../../../../lib/certificates/requireCertAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { publicClientFor } from '../../../../config/chains';
import { CERT_ABI, CERT_ADDRESS, CERT_CHAIN_ID } from '../../../../lib/certificates/nft';
import { CREDENTIAL_RE } from '../../../../lib/certificates/rows';
import { parseHonors, parseRole } from '../../../../lib/certificates/events';
import { loadCertEvent } from '../../../../lib/certificates/eventStore';
import { renderDiploma } from '../../../../lib/certificates/diploma';
import { diplomaPng } from '../../../../lib/certificates/rasterize';
import { certificateMetadata } from '../../../../lib/certificates/metadata';
import { PinError, pinFile, pinJson } from '../../../../lib/ipfsPin';
import { logger } from '../../../../utils/logger';

export const config = { maxDuration: 60 };

export interface PrepareResponse {
  credentialId: string;
  plannedTokenId: string;
  metadataCid: string;
  imageCid: string;
}

async function nextTokenId(): Promise<bigint> {
  const db = getSupabaseAdmin();
  const [onChain, reserved] = await Promise.all([
    publicClientFor(CERT_CHAIN_ID).readContract({ address: CERT_ADDRESS, abi: CERT_ABI, functionName: 'totalIssued' }) as Promise<bigint>,
    db.from('builder_certificates').select('planned_token_id').not('planned_token_id', 'is', null).order('planned_token_id', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (reserved.error) throw new Error(reserved.error.message);
  const top = reserved.data ? BigInt(reserved.data.planned_token_id as number) : 0n;
  return (onChain > top ? onChain : top) + 1n;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PrepareResponse | { error: string }>) {
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
  const credentialId = typeof req.body?.credentialId === 'string' ? req.body.credentialId.toUpperCase() : '';
  if (!CREDENTIAL_RE.test(credentialId)) return res.status(400).json({ error: 'credentialId is required' });

  const db = getSupabaseAdmin();
  try {
    const { data: row, error } = await db
      .from('builder_certificates')
      .select('event, role, member_name, project_name, credential_id, issue_date, honors, wallet, issued_tx, token_id, planned_token_id')
      .eq('credential_id', credentialId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return res.status(404).json({ error: 'No such certificate' });
    if (!row.wallet) return res.status(400).json({ error: 'No wallet yet: add it or let them claim first' });

    // 1. The token id the diploma will print.
    let planned: bigint | null = row.planned_token_id == null ? null : BigInt(row.planned_token_id as number);
    for (let attempt = 0; planned === null && attempt < 3; attempt++) {
      const candidate = await nextTokenId();
      const { data: won, error: reserveError } = await db
        .from('builder_certificates')
        .update({ planned_token_id: candidate.toString() })
        .eq('credential_id', credentialId)
        .is('planned_token_id', null)
        .select('planned_token_id')
        .maybeSingle();
      // 23505: another call took that id at the same moment; read again and retry.
      if (reserveError && reserveError.code !== '23505') throw new Error(reserveError.message);
      if (won) planned = BigInt(won.planned_token_id as number);
    }
    if (planned === null) throw new Error('Could not reserve a token id');

    const ev = await loadCertEvent(db, row.event);
    if (!ev) throw new Error(`Unknown event ${row.event}`);
    const role = parseRole(row.role);
    const honors = parseHonors(row.honors);

    // 2. Diploma, as PDF and as the NFT image.
    const pdf = await renderDiploma(
      {
        event: row.event,
        role,
        memberName: row.member_name,
        projectName: row.project_name,
        credentialId,
        issueDate: row.issue_date,
        honors,
        tokenId: planned.toString(),
      },
      ev
    );
    const png = await diplomaPng(pdf);
    const [pdfCid, imageCid] = await Promise.all([
      pinFile(pdf, `${credentialId}.pdf`, 'application/pdf'),
      pinFile(png, `${credentialId}.png`, 'image/png'),
    ]);

    // 3. What tokenURI points at.
    const metadata = certificateMetadata({ role, memberName: row.member_name, projectName: row.project_name, credentialId, honors, imageCid, pdfCid }, ev);
    const metadataCid = await pinJson(metadata, `${credentialId}.json`);

    const { error: saveError } = await db
      .from('builder_certificates')
      .update({ image_cid: imageCid, pdf_cid: pdfCid, metadata_cid: metadataCid })
      .eq('credential_id', credentialId);
    if (saveError) throw new Error(saveError.message);

    logger.info(`certificates: ${operator} prepared ${credentialId} as token #${planned} → ${metadataCid}`);
    return res.status(200).json({ credentialId, plannedTokenId: planned.toString(), metadataCid, imageCid });
  } catch (e) {
    if (e instanceof PinError) return res.status(502).json({ error: e.message });
    logger.error(`certificates: prepare ${credentialId} failed`, e);
    return res.status(500).json({ error: 'Could not prepare this certificate' });
  }
}

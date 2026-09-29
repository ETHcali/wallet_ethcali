/**
 * GET /api/certificates/<credentialId>/status — the public view, live.
 *
 * The credential page is prerendered, and re-rendering it on the server loads
 * _app → @privy-io/react-auth, which fails in a Vercel function (see the note
 * on pages/certificate/[credentialId].tsx). So the page ships the certificate
 * as built and asks here for what can change after the build: whether the NFT
 * is minted, its token and the wallet holding it. API routes never load _app.
 *
 * Same public fields as the page itself — no email, the wallet only once issued.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { getPublicCertificate } from '../../../../lib/certificates/rows';
import { logger } from '../../../../utils/logger';
import { publicClientFor } from '../../../../config/chains';
import { CERT_CHAIN_ID } from '../../../../lib/certificates/nft';

/** The mint's block time, from the chain. A certificate's issue moment is the block's, not a row's. */
async function blockTime(txHash: string): Promise<string | null> {
  try {
    const client = publicClientFor(CERT_CHAIN_ID);
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
    const block = await client.getBlock({ blockNumber: receipt.blockNumber });
    return new Date(Number(block.timestamp) * 1000).toISOString();
  } catch {
    return null;
  }
}
import type { PublicCertificate } from '../../../../types/certificates';

export default async function handler(req: NextApiRequest, res: NextApiResponse<PublicCertificate | { error: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const raw = req.query.credentialId;
  if (typeof raw !== 'string') return res.status(404).json({ error: 'No such certificate' });
  try {
    const cert = await getPublicCertificate(getSupabaseAdmin(), raw);
    if (!cert) return res.status(404).json({ error: 'No such certificate' });
    const issuedAt = cert.issuedTx ? await blockTime(cert.issuedTx) : null;
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    return res.status(200).json({ ...cert, issuedAt });
  } catch (e) {
    logger.error('certificates: status failed', e);
    return res.status(500).json({ error: 'Could not load the certificate' });
  }
}

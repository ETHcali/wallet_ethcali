/**
 * Either kind of ETH Cali operator — server-side gate for data both admin
 * areas share (the team master list).
 *
 * The team list feeds two places: ethcali.org's about page, edited by site
 * operators (ADMIN_ROLE on DonationVault, lib/adminAuth.ts), and the
 * certificates, issued by certificate operators (ADMIN_ROLE on
 * BuilderCertificate, lib/certificates/requireCertAdmin.ts). Holding either
 * role on chain is enough; holding neither is a 403. Tries the certificate
 * gate first because it returns the reason most operators here would expect.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireCertAdmin } from './certificates/requireCertAdmin';
import { requireAdmin } from './adminAuth';

export class OperatorAuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const statusOf = (e: unknown): number => {
  const s = (e as { status?: unknown })?.status;
  return typeof s === 'number' ? s : 500;
};

export async function requireOperator(req: NextApiRequest): Promise<string> {
  try {
    return await requireCertAdmin(req);
  } catch (first) {
    // Not signed in / bad token: the second gate would say the same.
    if (statusOf(first) !== 403) throw new OperatorAuthError((first as Error).message, statusOf(first));
  }
  try {
    return await requireAdmin(req);
  } catch (second) {
    const status = statusOf(second);
    throw new OperatorAuthError(
      status === 403 ? 'This account holds ADMIN_ROLE on neither the certificates nor the site contract' : (second as Error).message,
      status
    );
  }
}

export function sendOperatorError(res: NextApiResponse, e: unknown): void {
  const status = statusOf(e);
  res.status(status).json({ error: status >= 500 ? 'Auth check failed' : (e as Error).message });
}

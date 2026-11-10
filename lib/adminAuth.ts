/**
 * Server-side gate for the site-operator routes: site content, the team list
 * and the donation bank details.
 *
 * Two steps, because each alone is insufficient:
 *
 *   1. requireUser: a Privy token verified against Privy's JWKS, then the
 *      linked wallets from Privy's REST API with the app secret. A
 *      client-supplied address would be an unverified claim.
 *   2. ADMIN_ROLE on chain, through lib/roles.ts. A Privy login proves
 *      identity, never permission.
 *
 * The authority is the DonationVault on Ethereum. Its ADMIN_ROLE is the ETH
 * Cali operator set for donations and site content (owner decision
 * 2026-10-10: kept there deliberately, not moved to BuilderCertificate).
 * Swag routes ask the collection (lib/swag/requireSwagAdmin.ts), certificate
 * routes ask BuilderCertificate (lib/certificates/requireCertAdmin.ts).
 */
import type { NextApiRequest } from 'next';
import { firstHolder } from './roles';
import { requireUser, UserAuthError } from './swag/requireUser';

export class AdminAuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

/**
 * Throws AdminAuthError unless the caller is a logged-in ETH Cali operator.
 * Returns the wallet address that satisfied the check, for audit logging.
 */
export async function requireAdmin(req: NextApiRequest): Promise<string> {
  let wallets: string[];
  try {
    wallets = (await requireUser(req)).wallets;
  } catch (e) {
    if (e instanceof UserAuthError) throw new AdminAuthError(e.message, e.status);
    throw e;
  }

  const admin = await firstHolder('donations', 'admin', wallets);
  if (!admin) throw new AdminAuthError('Not an ETH Cali operator', 403);
  return admin;
}

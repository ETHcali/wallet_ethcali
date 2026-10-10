/**
 * Server-side gate for the certificate admin routes.
 *
 * The same shape as lib/swag/requireSwagAdmin.ts: a verified Privy session
 * (requireUser), then the chain decides. Certificates have their own contract,
 * so the authority is ADMIN_ROLE on BuilderCertificate — not the DonationVault
 * gate in lib/adminAuth.ts. An operator who can mint certificates must be able
 * to see the list they mint from, and nobody else can.
 *
 * Every linked wallet is checked, embedded ones included: an operator added by
 * email signs in with a code, and their Privy wallet carries the role.
 */
import type { NextApiRequest } from 'next';
import { firstHolder } from '../roles';
import { requireUser, UserAuthError } from '../swag/requireUser';

/** Returns the first linked wallet holding ADMIN_ROLE, or throws UserAuthError. */
export async function requireCertAdmin(req: NextApiRequest): Promise<string> {
  const user = await requireUser(req);
  // firstHolder skips a wallet whose read fails, so one RPC error cannot 500 the route.
  const admin = await firstHolder('certificates', 'admin', user.wallets);
  if (!admin) throw new UserAuthError('This account holds no ADMIN_ROLE on BuilderCertificate', 403);
  return admin;
}

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
import { publicClientFor } from '../../config/chains';
import { requireUser, UserAuthError } from '../swag/requireUser';
import { CERT_ABI, CERT_ADDRESS, CERT_ADMIN_ROLE, CERT_CHAIN_ID } from './nft';

/** Returns the first linked wallet holding ADMIN_ROLE, or throws UserAuthError. */
export async function requireCertAdmin(req: NextApiRequest): Promise<string> {
  const user = await requireUser(req);
  const client = publicClientFor(CERT_CHAIN_ID);
  for (const wallet of user.wallets) {
    const ok = (await client.readContract({
      address: CERT_ADDRESS,
      abi: CERT_ABI,
      functionName: 'hasRole',
      args: [CERT_ADMIN_ROLE, wallet as `0x${string}`],
    })) as boolean;
    if (ok) return wallet;
  }
  throw new UserAuthError('This account holds no ADMIN_ROLE on BuilderCertificate', 403);
}

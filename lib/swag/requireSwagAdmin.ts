/**
 * Server-side admin gate for the swag routes.
 *
 * The same three steps as lib/adminAuth.ts — Privy token, linked wallets,
 * role on chain — with a different authority. lib/adminAuth.ts asks the
 * DonationVault, because that is the operator set for donations and site
 * content. Swag has its own contract with its own ADMIN_ROLE, held by the
 * people who ship parcels and set caps, so swag routes ask the collection and
 * nothing else. Steps 1 and 2 are requireUser; this file adds step 3.
 *
 * The contract is the authority. A wallet that isAdmin() says no for is not an
 * operator whatever any table says, and a route behind this gate holds the
 * service-role key, so there is no second line of defence to lean on.
 */
import type { NextApiRequest } from 'next';
import { swag1155Abi } from '../../frontend/abis/swag';
import { getSwagClient, getSwagCollection } from './onchain';
import { requireUser, UserAuthError, type VerifiedUser } from './requireUser';

export interface SwagAdmin extends VerifiedUser {
  /** The linked wallet that holds ADMIN_ROLE, lowercase, for audit logs. */
  admin: string;
}

/** Step 3: which of these wallets does the collection recognise as an admin? */
async function adminWalletOf(wallets: string[]): Promise<string | null> {
  if (wallets.length === 0) return null;
  const client = getSwagClient();
  const collection = getSwagCollection();

  for (const wallet of wallets) {
    try {
      const isAdmin = await client.readContract({
        address: collection,
        abi: swag1155Abi,
        functionName: 'isAdmin',
        args: [wallet as `0x${string}`],
      });
      if (isAdmin) return wallet;
    } catch {
      // An RPC hiccup must never read as "authorised". Try the next wallet and
      // fall through to the deny below.
    }
  }
  return null;
}

/**
 * Throws UserAuthError (401 no session, 403 not an admin) unless the caller
 * holds ADMIN_ROLE on the swag collection through one of their linked wallets.
 */
export async function requireSwagAdmin(req: NextApiRequest): Promise<SwagAdmin> {
  const user = await requireUser(req);
  const admin = await adminWalletOf(user.wallets);
  if (!admin) throw new UserAuthError('Not an admin of the swag collection', 403);
  return { ...user, admin };
}

/**
 * Server-side staff gate for the swag routes.
 *
 * The same three steps as lib/adminAuth.ts — Privy token, linked wallets,
 * role on chain — with a different authority. lib/adminAuth.ts asks the
 * DonationVault, because that is the operator set for donations and site
 * content. Swag has its own contract, so swag routes ask the collection and
 * nothing else. Steps 1 and 2 are requireUser; this file adds step 3.
 *
 * Three levels, all read from the collection's AccessControl:
 *
 *   super       DEFAULT_ADMIN_ROLE  grants and revokes the two below
 *   admin       ADMIN_ROLE          prices, caps, pause, vouchers, cancelling
 *                                   orders — and everything fulfilment can do
 *   fulfilment  FULFILLMENT_ROLE    the order desk: addresses, batch, print
 *                                   sheet, in production / shipped / delivered
 *
 * FULFILLMENT_ROLE is not named in Swag1155 and gates no function there. It
 * is an ordinary AccessControl role whose admin is DEFAULT_ADMIN_ROLE (read
 * on chain: getRoleAdmin returns 0x00), so grantRole/hasRole work on the
 * deployed clone without a redeploy, and the chain stays the one place that
 * says who may see a buyer's address.
 *
 * Every linked wallet is checked, embedded ones included: someone added by
 * email signs in with a code and their Privy wallet carries the role. A
 * wallet the collection says no for is not staff whatever swag_staff says,
 * and a route behind this gate holds the service-role key, so there is no
 * second line of defence to lean on.
 */
import type { NextApiRequest } from 'next';
import type { Address } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { getSwagClient, getSwagCollection } from './onchain';
import { DEFAULT_ADMIN_ROLE, FULFILLMENT_ROLE } from './roles';
import { requireUser, UserAuthError, type VerifiedUser } from './requireUser';

export type SwagStaffRole = 'admin' | 'fulfilment';

export interface SwagWalletRoles {
  superAdmin: boolean;
  admin: boolean;
  fulfilment: boolean;
}

export interface SwagStaff extends VerifiedUser {
  /** The linked wallet that carries the role, lowercase, for audit logs. */
  admin: string;
  /** The strongest level any linked wallet holds. */
  role: SwagStaffRole;
  /** Whether any linked wallet holds DEFAULT_ADMIN_ROLE. */
  superAdmin: boolean;
}

/**
 * The three roles for one wallet, straight from the collection. Throws on an
 * RPC failure; callers treat a throw as "no", never as "yes".
 */
export async function readSwagRoles(wallet: Address): Promise<SwagWalletRoles> {
  const client = getSwagClient();
  const target = { address: getSwagCollection(), abi: swag1155Abi } as const;
  const [superAdmin, admin, fulfilment] = await Promise.all([
    client.readContract({ ...target, functionName: 'hasRole', args: [DEFAULT_ADMIN_ROLE, wallet] }),
    client.readContract({ ...target, functionName: 'isAdmin', args: [wallet] }),
    client.readContract({ ...target, functionName: 'hasRole', args: [FULFILLMENT_ROLE, wallet] }),
  ]);
  return { superAdmin, admin, fulfilment };
}

/** Step 3: the strongest role across the caller's wallets, and which wallet holds it. */
async function staffOf(user: VerifiedUser): Promise<Omit<SwagStaff, keyof VerifiedUser> | null> {
  let best: Omit<SwagStaff, keyof VerifiedUser> | null = null;
  let superAdmin = false;

  for (const wallet of user.wallets) {
    let roles: SwagWalletRoles;
    try {
      roles = await readSwagRoles(wallet as Address);
    } catch {
      // An RPC hiccup must never read as "authorised". Try the next wallet and
      // fall through to the deny below.
      continue;
    }
    superAdmin ||= roles.superAdmin;
    if (roles.admin && best?.role !== 'admin') best = { admin: wallet, role: 'admin', superAdmin: false };
    else if (roles.fulfilment && !best) best = { admin: wallet, role: 'fulfilment', superAdmin: false };
  }

  return best ? { ...best, superAdmin } : null;
}

/**
 * Throws UserAuthError (401 no session, 403 no role) unless the caller holds
 * ADMIN_ROLE or FULFILLMENT_ROLE on the collection through a linked wallet.
 */
export async function requireSwagStaff(req: NextApiRequest): Promise<SwagStaff> {
  const user = await requireUser(req);
  const staff = await staffOf(user);
  if (!staff) throw new UserAuthError('Not on the swag team', 403);
  return { ...user, ...staff };
}

/** As requireSwagStaff, but only ADMIN_ROLE passes. */
export async function requireSwagAdmin(req: NextApiRequest): Promise<SwagStaff> {
  const staff = await requireSwagStaff(req);
  if (staff.role !== 'admin') throw new UserAuthError('Needs ADMIN_ROLE on the swag collection', 403);
  return staff;
}

/**
 * DEFAULT_ADMIN_ROLE only: the caller who can grant and revoke. Returns the
 * wallet that holds it, which is the one the grant transaction must come from.
 */
export async function requireSwagSuperAdmin(req: NextApiRequest): Promise<VerifiedUser & { superAdminWallet: string }> {
  const user = await requireUser(req);
  for (const wallet of user.wallets) {
    try {
      if ((await readSwagRoles(wallet as Address)).superAdmin) return { ...user, superAdminWallet: wallet };
    } catch {
      continue;
    }
  }
  throw new UserAuthError('Needs DEFAULT_ADMIN_ROLE on the swag collection', 403);
}

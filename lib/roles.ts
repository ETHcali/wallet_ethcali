/**
 * The one reader for "does this wallet hold that role", browser and server.
 *
 * Every administered contract's isAdmin / isSuperAdmin is plain
 * hasRole(ADMIN_ROLE | DEFAULT_ADMIN_ROLE), so a generic hasRole / owner()
 * driven by config/access.ts answers for all of them. The admin menu
 * (useAdminRoles) and the server gates (lib/adminAuth.ts,
 * lib/certificates/requireCertAdmin.ts) both ask here, so the menu cannot
 * drift from the gate it advertises.
 *
 * Callers always pass every linked wallet, as the server does: a role on the
 * embedded wallet counts while an external wallet is active.
 */
import type { Address } from 'viem';
import { accessContract, type AccessContractKey, type AccessRoleKey } from '../config/access';
import { DEFAULT_CHAIN, publicClientFor } from '../config/chains';
import { ACCESS_ABI } from './accessAbi';

/** Whether `wallet` holds `role` on `contract`. Throws on an RPC failure; callers treat that as "no". */
export async function holdsRole(contract: AccessContractKey, role: AccessRoleKey, wallet: string): Promise<boolean> {
  const def = accessContract(contract);
  if (!def?.address) return false;
  const client = publicClientFor(DEFAULT_CHAIN.id);

  if (role === 'owner') {
    const owner = await client.readContract({ address: def.address, abi: ACCESS_ABI, functionName: 'owner' });
    return owner.toLowerCase() === wallet.toLowerCase();
  }
  const id = def.roles.find((r) => r.key === role)?.id;
  if (!id) return false;
  return client.readContract({
    address: def.address,
    abi: ACCESS_ABI,
    functionName: 'hasRole',
    args: [id, wallet as Address],
  });
}

/**
 * The first of `wallets` that holds `role`, lowercase, or null. An RPC
 * failure on one wallet moves on to the next; it never reads as "yes".
 */
export async function firstHolder(
  contract: AccessContractKey,
  role: AccessRoleKey,
  wallets: readonly string[]
): Promise<string | null> {
  for (const wallet of wallets) {
    try {
      if (await holdsRole(contract, role, wallet)) return wallet.toLowerCase();
    } catch {
      continue;
    }
  }
  return null;
}

export interface AdminRoles {
  isSwagAdmin: boolean;
  /** FULFILLMENT_ROLE on the collection: the order desk, nothing else. */
  isSwagFulfilment: boolean;
  isFaucetAdmin: boolean;
  isFaucetSuperAdmin: boolean;
  isZKPassportOwner: boolean;
  /** ADMIN_ROLE on DonationVault: donations, plus site content and the team list. */
  isDonationAdmin: boolean;
  isDonationSuperAdmin: boolean;
  /** ADMIN_ROLE on BuilderCertificate: issuing certificates and the team list. */
  isCertAdmin: boolean;
  /** An admin-level role anywhere: what /admin/access requires. Fulfilment alone is not one. */
  isOperator: boolean;
  /** Any role at all, fulfilment included: whether to show the way into the admin. */
  hasAnyAdmin: boolean;
}

export const NO_ROLES: AdminRoles = {
  isSwagAdmin: false,
  isSwagFulfilment: false,
  isFaucetAdmin: false,
  isFaucetSuperAdmin: false,
  isZKPassportOwner: false,
  isDonationAdmin: false,
  isDonationSuperAdmin: false,
  isCertAdmin: false,
  isOperator: false,
  hasAnyAdmin: false,
};

/** The roles the admin menu needs, held by any of `wallets`. */
export async function readAdminRoles(wallets: readonly string[]): Promise<AdminRoles> {
  if (wallets.length === 0) return NO_ROLES;
  const has = (contract: AccessContractKey, role: AccessRoleKey) =>
    firstHolder(contract, role, wallets).then(Boolean);

  const [
    isSwagSuperAdmin,
    isSwagAdmin,
    isSwagFulfilment,
    isFaucetAdmin,
    isFaucetSuperAdmin,
    isZKPassportOwner,
    isDonationAdmin,
    isDonationSuperAdmin,
    isCertSuperAdmin,
    isCertAdmin,
  ] = await Promise.all([
    has('swag', 'super'),
    has('swag', 'admin'),
    has('swag', 'fulfilment'),
    has('faucet', 'admin'),
    has('faucet', 'super'),
    has('identity', 'owner'),
    has('donations', 'admin'),
    has('donations', 'super'),
    has('certificates', 'super'),
    has('certificates', 'admin'),
  ]);

  const isOperator =
    isSwagSuperAdmin ||
    isSwagAdmin ||
    isFaucetAdmin ||
    isFaucetSuperAdmin ||
    isZKPassportOwner ||
    isDonationAdmin ||
    isDonationSuperAdmin ||
    isCertSuperAdmin ||
    isCertAdmin;

  return {
    isSwagAdmin,
    isSwagFulfilment,
    isFaucetAdmin,
    isFaucetSuperAdmin,
    isZKPassportOwner,
    isDonationAdmin,
    isDonationSuperAdmin,
    isCertAdmin,
    isOperator,
    hasAnyAdmin: isOperator || isSwagFulfilment,
  };
}

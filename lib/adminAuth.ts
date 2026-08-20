/**
 * Server-side admin gate for internal API routes.
 *
 * Three steps, in order, because each one alone is insufficient:
 *
 *   1. Verify the Privy access token against Privy's JWKS. Proves the caller
 *      is a logged-in user of THIS app and not merely someone holding a
 *      plausible-looking JWT.
 *   2. Resolve that DID to its linked wallets via Privy's REST API, using the
 *      app secret. The access token carries the DID but no addresses, and a
 *      client-supplied address would be an unverified claim.
 *   3. Check ADMIN_ROLE on chain. The contract is the authority — a Privy
 *      login proves identity, never permission.
 *
 * Note the authority contract is DonationVault. Swag collections are not
 * deployed yet, so there is no swag-specific role to check; the vault's
 * ADMIN_ROLE is the ETH Cali operator set today. Once a swag collection
 * exists, point AUTHORITY at it instead.
 */
import type { NextApiRequest } from 'next';
import * as jose from 'jose';
import { createPublicClient, http } from 'viem';
import DonationVaultABI from '../frontend/abis/DonationVault.json';
import addresses from '../frontend/addresses.json';
import { CHAIN_IDS, getRpcUrl } from '../config/constants';

export class AdminAuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

/** The contract whose ADMIN_ROLE defines "an ETH Cali operator". */
const AUTHORITY = {
  chainId: CHAIN_IDS.CELO,
  address: (addresses as Record<string, { addresses?: Record<string, string> }>).celo
    ?.addresses?.DonationVault,
};

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

function getJwks(appId: string) {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(
      new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`)
    );
  }
  return jwks;
}

/** Step 1: the token is real, unexpired, and issued to this app. */
async function verifyPrivyToken(token: string, appId: string): Promise<string> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwks(appId), {
      issuer: 'privy.io',
      audience: appId,
    });
    if (!payload.sub) throw new Error('no subject');
    return payload.sub;
  } catch {
    // Deliberately vague: distinguishing "expired" from "forged" helps an
    // attacker more than it helps a legitimate caller.
    throw new AdminAuthError('Invalid or expired session', 401);
  }
}

/** Step 2: which wallets has this DID actually linked? */
async function walletsForDid(did: string, appId: string, appSecret: string): Promise<string[]> {
  const res = await fetch(`https://auth.privy.io/api/v1/users/${encodeURIComponent(did)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      'privy-app-id': appId,
    },
  });

  if (!res.ok) throw new AdminAuthError('Could not resolve the account', 502);

  const user = (await res.json()) as {
    linked_accounts?: Array<{ type?: string; address?: string }>;
  };

  return (user.linked_accounts ?? [])
    .filter((a) => a.type === 'wallet' && a.address)
    .map((a) => (a.address as string).toLowerCase());
}

/** Step 3: the chain decides. */
async function holdsAdminRole(wallets: string[]): Promise<string | null> {
  if (!AUTHORITY.address || wallets.length === 0) return null;

  const client = createPublicClient({ transport: http(getRpcUrl(AUTHORITY.chainId)) });

  for (const wallet of wallets) {
    try {
      const isAdmin = (await client.readContract({
        address: AUTHORITY.address as `0x${string}`,
        abi: DonationVaultABI,
        functionName: 'isAdmin',
        args: [wallet as `0x${string}`],
      })) as boolean;
      if (isAdmin) return wallet;
    } catch {
      // A single RPC hiccup must not read as "authorised"; try the next wallet
      // and fall through to the deny below.
    }
  }
  return null;
}

/**
 * Throws AdminAuthError unless the caller is a logged-in ETH Cali operator.
 * Returns the wallet address that satisfied the check, for audit logging.
 */
export async function requireAdmin(req: NextApiRequest): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new AdminAuthError('Admin auth is not configured on the server', 500);
  }

  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AdminAuthError('Missing session token', 401);

  const did = await verifyPrivyToken(token, appId);
  const wallets = await walletsForDid(did, appId, appSecret);
  const admin = await holdsAdminRole(wallets);

  if (!admin) throw new AdminAuthError('Not an ETH Cali operator', 403);
  return admin;
}

/**
 * Server-side "who is calling" for the swag order routes.
 *
 * The same first two steps as lib/adminAuth.ts, without the third: these
 * routes are for any signed-in buyer, not for operators, so there is no role
 * to check on chain. What they need instead is the set of identities Privy has
 * verified for the caller, because that set is the whole authorization model:
 *
 *   - an onchain order belongs to you if its buyer_wallet is one of your
 *     linked wallets;
 *   - a Shopify order belongs to you if its buyer_email is one of your
 *     verified emails.
 *
 * Nothing about the caller is ever read from the request body. The DID comes
 * from a JWT checked against Privy's JWKS; the wallets and emails come from
 * Privy's REST API with the app secret. A client-supplied address or email
 * would be an unverified claim, and "I am the person this shirt was sold to"
 * is exactly the claim an attacker would make.
 *
 * Which emails count: the `email` account (verified by OTP at login) and the
 * `google_oauth` account (verified by Google). Apple and other OAuth emails
 * are not included until someone has checked what Privy guarantees for them.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import * as jose from 'jose';

export class UserAuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export interface VerifiedUser {
  /** Privy DID, `did:privy:…`. */
  did: string;
  /** Every linked Ethereum wallet, lowercase. */
  wallets: string[];
  /** The Privy embedded wallet, lowercase, when the user has one. */
  embeddedWallet: string | null;
  /** Every verified email, lowercase. */
  emails: string[];
}

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

function getJwks(appId: string) {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(
      new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`)
    );
  }
  return jwks;
}

/** The token is real, unexpired, and issued to this app. */
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
    throw new UserAuthError('Invalid or expired session', 401);
  }
}

interface PrivyLinkedAccount {
  type?: string;
  address?: string;
  email?: string;
  chain_type?: string;
  wallet_client_type?: string;
  connector_type?: string;
}

/** Which wallets and emails has this DID actually linked? */
async function identitiesForDid(
  did: string,
  appId: string,
  appSecret: string
): Promise<Omit<VerifiedUser, 'did'>> {
  const res = await fetch(`https://auth.privy.io/api/v1/users/${encodeURIComponent(did)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      'privy-app-id': appId,
    },
  });

  if (!res.ok) throw new UserAuthError('Could not resolve the account', 502);

  const user = (await res.json()) as { linked_accounts?: PrivyLinkedAccount[] };
  const accounts = user.linked_accounts ?? [];

  const walletAccounts = accounts.filter(
    (a) => a.type === 'wallet' && a.address && (a.chain_type ?? 'ethereum') === 'ethereum'
  );
  const wallets = walletAccounts.map((a) => (a.address as string).toLowerCase());
  const embedded = walletAccounts.find(
    (a) => a.wallet_client_type === 'privy' || a.connector_type === 'embedded'
  );

  const emails = accounts
    .map((a) => {
      if (a.type === 'email') return a.address;
      if (a.type === 'google_oauth') return a.email;
      return undefined;
    })
    .filter((e): e is string => Boolean(e))
    .map((e) => e.trim().toLowerCase());

  return {
    wallets: Array.from(new Set(wallets)),
    embeddedWallet: embedded ? (embedded.address as string).toLowerCase() : null,
    emails: Array.from(new Set(emails)),
  };
}

/**
 * Throws UserAuthError unless the request carries a valid Privy session.
 * Returns the caller's verified identities; never anything the client sent.
 */
export async function requireUser(req: NextApiRequest): Promise<VerifiedUser> {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new UserAuthError('Sign-in is not configured on the server', 500);
  }

  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new UserAuthError('Missing session token', 401);

  const did = await verifyPrivyToken(token, appId);
  const identities = await identitiesForDid(did, appId, appSecret);
  return { did, ...identities };
}

/**
 * The one way an auth failure leaves a route. Anything that is not a
 * UserAuthError is a bug or an outage, and is reported as such rather than as
 * "not signed in".
 */
export function sendAuthError(res: NextApiResponse, e: unknown): void {
  if (e instanceof UserAuthError) {
    res.status(e.status).json({ error: e.message });
    return;
  }
  res.status(500).json({ error: 'Could not verify the session' });
}

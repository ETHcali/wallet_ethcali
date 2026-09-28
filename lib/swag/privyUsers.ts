/**
 * Turning an email into the wallet a role can be granted to.
 *
 * Someone added to the swag team by email should never have to install a
 * wallet: they sign in to app.ethcali.org with a one-time code, and Privy
 * gives them an embedded wallet. That wallet has to exist *before* the grant,
 * so this file finds the Privy user for the email — or creates one, with an
 * Ethereum wallet pregenerated — and returns the wallet's address.
 *
 * Server-only: it uses the app secret. It creates identities, so the only
 * caller is the staff route behind requireSwagSuperAdmin.
 *
 * Endpoints (Privy REST, Basic auth with app id + secret):
 *   POST /v1/users/email/address      find by email
 *   POST /v1/users                    create, with linked_accounts + wallets
 *   POST /v1/users/{did}/wallets      pregenerate a wallet for an existing user
 */

interface PrivyAccount {
  type?: string;
  address?: string;
  chain_type?: string;
  wallet_client_type?: string;
  connector_type?: string;
}

interface PrivyUser {
  id: string;
  linked_accounts?: PrivyAccount[];
}

export class PrivyUserError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export interface ResolvedStaffWallet {
  did: string;
  /** Lowercase embedded Ethereum wallet. */
  address: string;
  /** True when this call created the Privy account. */
  created: boolean;
}

function credentials(): { appId: string; headers: Record<string, string> } {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) throw new PrivyUserError('Privy is not configured on the server', 500);
  return {
    appId,
    headers: {
      Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      'privy-app-id': appId,
      'Content-Type': 'application/json',
    },
  };
}

async function privy(path: string, body: unknown): Promise<Response> {
  const { headers } = credentials();
  return fetch(`https://auth.privy.io/api/v1${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
}

/** The Privy-managed Ethereum wallet on a user, lowercase, or null. */
function embeddedWalletOf(user: PrivyUser): string | null {
  const wallet = (user.linked_accounts ?? []).find(
    (a) =>
      a.type === 'wallet' &&
      (a.chain_type ?? 'ethereum') === 'ethereum' &&
      (a.wallet_client_type === 'privy' || a.connector_type === 'embedded') &&
      typeof a.address === 'string'
  );
  return wallet ? (wallet.address as string).toLowerCase() : null;
}

async function findByEmail(email: string): Promise<PrivyUser | null> {
  const res = await privy('/users/email/address', { address: email });
  if (res.status === 404) return null;
  if (!res.ok) throw new PrivyUserError(`Privy lookup failed (${res.status})`, 502);
  return (await res.json()) as PrivyUser;
}

async function createWithWallet(email: string): Promise<PrivyUser> {
  const res = await privy('/users', {
    linked_accounts: [{ type: 'email', address: email }],
    wallets: [{ chain_type: 'ethereum' }],
  });
  if (!res.ok) throw new PrivyUserError(`Privy could not create the account (${res.status})`, 502);
  return (await res.json()) as PrivyUser;
}

async function addWallet(did: string): Promise<void> {
  const res = await privy(`/users/${encodeURIComponent(did)}/wallets`, { wallets: [{ chain_type: 'ethereum' }] });
  if (!res.ok) throw new PrivyUserError(`Privy could not create a wallet for this account (${res.status})`, 502);
}

/**
 * The embedded wallet for this email, creating the account and/or the
 * wallet when either is missing. Idempotent: a second call for the same
 * email returns the same address.
 */
export async function resolveStaffWallet(rawEmail: string): Promise<ResolvedStaffWallet> {
  const email = rawEmail.trim().toLowerCase();
  let user = await findByEmail(email);
  let created = false;

  if (!user) {
    user = await createWithWallet(email);
    created = true;
  }

  let address = embeddedWalletOf(user);
  if (!address) {
    // Re-read rather than trust the pregenerate response's shape.
    await addWallet(user.id);
    user = (await findByEmail(email)) ?? user;
    address = embeddedWalletOf(user);
  }
  if (!address) throw new PrivyUserError('Privy returned no Ethereum wallet for this account', 502);

  return { did: user.id, address, created };
}

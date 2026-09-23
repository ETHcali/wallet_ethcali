import type {
  LinkedAccountWithMetadata,
  PasskeyWithMetadata,
  WalletWithMetadata,
} from '@privy-io/react-auth';

/**
 * Reading `user.linkedAccounts` — the one list Privy keeps of everything
 * attached to an account. Nothing here infers: a method is linked when the
 * list says so, and the Settings page shows exactly that.
 *
 * Shapes per docs.privy.io/user-management/users/the-user-object.
 */

/** Privy's own embedded wallets. `privy-v2` is the newer client type name. */
const EMBEDDED_CLIENT_TYPES = new Set(['privy', 'privy-v2']);

/** For code that already holds a wallet account and only needs the yes/no. */
export function isEmbeddedClientType(walletClientType: string | undefined): boolean {
  return EMBEDDED_CLIENT_TYPES.has(walletClientType ?? '');
}

export function isEmbeddedWallet(a: LinkedAccountWithMetadata): a is WalletWithMetadata {
  return a.type === 'wallet' && isEmbeddedClientType(a.walletClientType);
}

export function isPasskey(a: LinkedAccountWithMetadata): a is PasskeyWithMetadata {
  return a.type === 'passkey';
}

/**
 * The accounts a person can start a session with.
 *
 * An embedded wallet and a smart wallet are held for the user and cannot sign
 * them in, so removing the last email or passkey would leave them with a
 * wallet and no door to it. Privy refuses to unlink the last linked account of
 * any kind; this is stricter on purpose.
 */
export function signInMethods(accounts: readonly LinkedAccountWithMetadata[]): LinkedAccountWithMetadata[] {
  return accounts.filter((a) => a.type !== 'smart_wallet' && !isEmbeddedWallet(a));
}

/** "iCloud Keychain · Safari · macOS", from whatever Privy recorded; never invented. */
export function describePasskey(p: PasskeyWithMetadata): string {
  const parts = [p.authenticatorName, p.createdWithBrowser, p.createdWithOs, p.createdWithDevice].filter(
    (s): s is string => typeof s === 'string' && s.length > 0
  );
  return parts.length > 0 ? parts.join(' · ') : 'Passkey';
}

/** Real ellipsis, per BRAND.md: `0x55C9…711d`. */
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

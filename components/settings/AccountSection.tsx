import React, { useState } from 'react';
import type { LinkedAccountWithMetadata, User } from '@privy-io/react-auth';
import { DEFAULT_CHAIN, explorerAddress } from '../../config/chains';
import { CheckIcon, CopyIcon, ExternalIcon, GoogleIcon, KeyIcon, LinkIcon, MailIcon, WalletIcon } from '../shared/icons';
import { isEmbeddedClientType, isPasskey, truncateAddress } from '../../utils/linkedAccounts';

interface AccountSectionProps {
  user: User;
}

interface Row {
  key: string;
  icon: React.ReactNode;
  label: string;
  /** Short muted detail under the label, when it adds something. */
  detail?: string;
  /** Wallet rows show the address with copy and explorer instead of a check. */
  address?: string;
  rank: number;
}

const ICON = 'h-[18px] w-[18px]';

/** Copy and explorer, 44px each, for a truncated address. */
const AddressActions: React.FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable; the full address stays in the title attribute.
    }
  };

  return (
    <span className="flex shrink-0 items-center">
      <span className="mr-1 font-mono text-sm text-content-primary" title={address}>
        {truncateAddress(address)}
      </span>
      <button
        type="button"
        onClick={copy}
        className={`flex h-11 w-9 items-center justify-center rounded-chip transition-colors hover:text-content-primary ${
          copied ? 'text-signal-confirmed' : 'text-content-faint'
        }`}
        aria-label={copied ? 'Copied' : 'Copy address'}
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      </button>
      <a
        href={explorerAddress(DEFAULT_CHAIN.id, address)}
        target="_blank"
        rel="noopener noreferrer"
        className="-mr-2 flex h-11 w-9 items-center justify-center rounded-chip text-content-faint transition-colors hover:text-eth-blue-text"
        aria-label={`View on ${DEFAULT_CHAIN.explorerName}`}
      >
        <ExternalIcon className="h-4 w-4" />
      </a>
    </span>
  );
};

/** `twitter_oauth` → "Twitter", `cross_app` → "Cross app". For types without a row of their own. */
function labelFor(type: LinkedAccountWithMetadata['type']): string {
  const plain = type.replace(/_oauth$/, '').replace(/_/g, ' ');
  return plain.charAt(0).toUpperCase() + plain.slice(1);
}

/**
 * One row per linked method, straight from `user.linkedAccounts`. The email is
 * the card's headline, so rows do not repeat it; passkeys are one row with a
 * count, since the Passkeys card lists them one by one.
 */
function rowsFor(accounts: readonly LinkedAccountWithMetadata[], headline: string | null): Row[] {
  const rows: Row[] = [];

  for (const a of accounts) {
    switch (a.type) {
      case 'email':
        rows.push({
          key: `email:${a.address}`,
          icon: <MailIcon className={ICON} />,
          label: 'Email code',
          detail: a.address === headline ? undefined : a.address,
          rank: 0,
        });
        break;
      case 'google_oauth':
        rows.push({
          key: `google:${a.subject}`,
          icon: <GoogleIcon className={ICON} />,
          label: 'Google',
          detail: a.email === headline ? undefined : a.email,
          rank: 1,
        });
        break;
      case 'passkey':
        break;
      case 'wallet':
        rows.push({
          key: `wallet:${a.address}`,
          icon: <WalletIcon className={ICON} />,
          label: isEmbeddedClientType(a.walletClientType) ? 'Embedded wallet' : 'Wallet',
          address: a.address,
          rank: isEmbeddedClientType(a.walletClientType) ? 4 : 3,
        });
        break;
      case 'smart_wallet':
        rows.push({ key: `smart:${a.address}`, icon: <WalletIcon className={ICON} />, label: 'Smart wallet', address: a.address, rank: 5 });
        break;
      default:
        rows.push({ key: `${a.type}:${rows.length}`, icon: <LinkIcon className={ICON} />, label: labelFor(a.type), rank: 6 });
    }
  }

  const passkeys = accounts.filter(isPasskey).length;
  if (passkeys > 0) {
    rows.push({
      key: 'passkeys',
      icon: <KeyIcon className={ICON} />,
      label: 'Passkey',
      detail: passkeys === 1 ? undefined : `${passkeys} on this account`,
      rank: 2,
    });
  }

  return rows.sort((x, y) => x.rank - y.rank);
}

const AccountSection: React.FC<AccountSectionProps> = ({ user }) => {
  // Email first, then the Google account's email, then say plainly that there
  // is none — a wallet-only login has no email and we do not invent one.
  const email = user.email?.address ?? user.google?.email ?? null;
  const rows = rowsFor(user.linkedAccounts ?? [], email);

  return (
    <section className="rounded-card border border-line-hairline bg-surface-slab p-5" aria-labelledby="settings-account">
      <h2 id="settings-account" className="text-lg font-bold text-content-primary">
        Account
      </h2>
      <p className="mb-0 mt-1 truncate text-[15px] text-content-secondary" title={email ?? undefined}>
        {email ?? 'No email on this account'}
      </p>

      <h3 className="mb-0 mt-4 text-sm font-medium text-content-muted">How you sign in</h3>
      {rows.length === 0 ? (
        <p className="mb-0 mt-2 text-sm text-content-muted">Nothing linked yet.</p>
      ) : (
        <ul className="mt-1 divide-y divide-line-hairline">
          {rows.map((row) => (
            <li key={row.key} className="flex min-h-[56px] items-center gap-3 py-1.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-inset text-content-secondary">
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-tight text-content-primary">{row.label}</span>
                {row.detail && <span className="block truncate text-xs text-content-muted">{row.detail}</span>}
              </span>
              {row.address ? (
                <AddressActions address={row.address} />
              ) : (
                <CheckIcon className="h-5 w-5 shrink-0 text-signal-confirmed" strokeWidth={2} />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AccountSection;

import React, { useState } from 'react';
import type { LinkedAccountWithMetadata, User } from '@privy-io/react-auth';
import { DEFAULT_CHAIN, explorerAddress } from '../../config/chains';
import { ClipboardIcon } from '../shared/icons';
import { describePasskey, isEmbeddedClientType, isPasskey, truncateAddress } from '../../utils/linkedAccounts';

interface AccountSectionProps {
  user: User;
}

interface Row {
  key: string;
  label: string;
  /** Human text, or an address rendered with copy and explorer. */
  value: string;
  address?: string;
  note?: string;
  rank: number;
}

const smallControl =
  'inline-flex min-h-[32px] items-center gap-1.5 rounded-chip border border-line-hairline bg-surface-inset px-2.5 font-mono text-[11px] text-content-secondary transition-colors hover:border-line-brand hover:text-eth-blue-text';

/** An address the way the brand wants one: mono, truncated, copyable, linked. */
const AddressValue: React.FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable over plain http or when denied; the full
      // address stays in the title attribute.
    }
  };

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-sm text-content-primary" title={address}>
        {truncateAddress(address)}
      </span>
      <button type="button" onClick={copy} className={smallControl} aria-label="Copy address">
        <ClipboardIcon className="h-3 w-3" />
        {copied ? 'Copied' : 'Copy'}
      </button>
      <a
        href={explorerAddress(DEFAULT_CHAIN.id, address)}
        target="_blank"
        rel="noopener noreferrer"
        className={smallControl}
      >
        Explorer ↗
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
 * One row per linked method, straight from `user.linkedAccounts`. Passkeys are
 * folded into a single row with a count, since the Passkeys section below
 * lists them one by one.
 */
function rowsFor(accounts: readonly LinkedAccountWithMetadata[]): Row[] {
  const rows: Row[] = [];

  for (const a of accounts) {
    switch (a.type) {
      case 'email':
        rows.push({ key: `email:${a.address}`, label: 'Email', value: a.address, rank: 0 });
        break;
      case 'google_oauth':
        rows.push({ key: `google:${a.subject}`, label: 'Google', value: a.email, rank: 1 });
        break;
      case 'passkey':
        // Summarised once, below the loop.
        break;
      case 'wallet':
        if (isEmbeddedClientType(a.walletClientType)) {
          rows.push({ key: `embedded:${a.address}`, label: 'Embedded wallet', value: a.address, address: a.address, rank: 4 });
        } else {
          rows.push({
            key: `wallet:${a.address}`,
            label: 'Wallet',
            value: a.address,
            address: a.address,
            note: a.walletClientType,
            rank: 3,
          });
        }
        break;
      case 'smart_wallet':
        rows.push({ key: `smart:${a.address}`, label: 'Smart wallet', value: a.address, address: a.address, rank: 5 });
        break;
      default:
        rows.push({ key: `${a.type}:${rows.length}`, label: labelFor(a.type), value: 'Linked', rank: 6 });
    }
  }

  const passkeys = accounts.filter(isPasskey);
  if (passkeys.length > 0) {
    rows.push({
      key: 'passkeys',
      label: passkeys.length === 1 ? 'Passkey' : `Passkeys · ${passkeys.length}`,
      value: passkeys.map(describePasskey).join(', '),
      rank: 2,
    });
  }

  return rows.sort((x, y) => x.rank - y.rank);
}

const AccountSection: React.FC<AccountSectionProps> = ({ user }) => {
  // Email first, then the Google account's email, then say plainly that there
  // is none — a wallet-only login has no email and we do not invent one.
  const email = user.email?.address ?? user.google?.email ?? null;
  const rows = rowsFor(user.linkedAccounts ?? []);

  return (
    <section className="rounded-card border border-line-hairline bg-surface-slab p-4 sm:p-5" aria-labelledby="settings-account">
      <h2 id="settings-account" className="font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">
        Account
      </h2>

      <p className="mt-2 truncate text-base text-content-primary" title={email ?? undefined}>
        {email ?? 'No email on this account'}
      </p>

      <h3 className="mt-5 text-sm font-medium text-content-secondary">Sign-in methods</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-content-muted">Nothing linked yet.</p>
      ) : (
        <ul className="mt-1 divide-y divide-line-hairline">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <span className="shrink-0 text-sm text-content-muted sm:w-40">{row.label}</span>
              <span className="min-w-0 flex-1 sm:text-right">
                {row.address ? (
                  <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <AddressValue address={row.address} />
                    {row.note && <span className="font-mono text-[11px] text-content-faint">{row.note}</span>}
                  </span>
                ) : (
                  <span className="break-words text-sm text-content-primary">{row.value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AccountSection;

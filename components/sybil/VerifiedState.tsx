import React from 'react';
import Link from 'next/link';
import { CheckIcon } from '../shared/icons';

interface VerifiedStateProps {
  /** From the mint's block; null when the RPC refused the log range. */
  mintedAt: Date | null;
}

/**
 * What a ZKPassport NFT is checked against today. Only gates that exist in
 * code are marked live:
 *   - FaucetManager.claim() reverts with "must own ZKPassport NFT" on a vault
 *     whose `zkPassportRequired` flag is set (canClaim mirrors it).
 *   - HackathonStaking carries the same `zkPassportRequired` gate, but is not
 *     deployed on any chain in frontend/addresses.json and has no UI yet.
 *   - Event vouchers (Swag1155 claim vouchers) are not gated by the NFT.
 */
const UNLOCKS: ReadonlyArray<{ title: string; detail: string; live: boolean; href?: string }> = [
  {
    title: 'Faucet claims on verified-only vaults',
    detail: 'Vaults with the ZKPassport gate turned on accept your claim; unverified wallets are refused.',
    live: true,
    href: '/faucet',
  },
  {
    title: 'Priority for hackathon staking',
    detail: 'The staking contract checks this NFT for gated hackathons. Not deployed yet.',
    live: false,
  },
  {
    title: 'Event vouchers',
    detail: 'Verified-only vouchers for events and swag drops.',
    live: false,
  },
];

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

/**
 * The Identity page for a wallet that already holds the NFT. There is no
 * "start verification" here: the proof was made once and the token is
 * soulbound, so asking again would only produce a `duplicate` revert.
 */
const VerifiedState: React.FC<VerifiedStateProps> = ({ mintedAt }) => (
  <section className="rounded-card border border-line-hairline bg-surface-slab p-5" aria-label="Verified">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-content-primary">You are verified</h2>
        <p className="mt-1 text-sm text-content-muted">
          {mintedAt
            ? `Verified on ${dateFormat.format(mintedAt)}. Nothing else to do.`
            : 'This wallet holds its ZKPassport NFT. Nothing else to do.'}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-signal-confirmed/35 bg-signal-confirmed/10 px-3 py-1.5 text-xs font-semibold text-signal-confirmed">
        <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
        Verified
      </span>
    </div>

    <h3 className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">
      What this unlocks
    </h3>
    <ul className="mt-2 divide-y divide-line-hairline">
      {UNLOCKS.map((item) => (
        <li key={item.title} className="flex items-start gap-3 py-3">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.live ? 'bg-signal-confirmed' : 'bg-surface-ridge'}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            {item.href ? (
              <Link
                href={item.href}
                className="text-sm text-eth-blue-text hover:underline"
              >
                {item.title} →
              </Link>
            ) : (
              <p className="text-sm text-content-primary">{item.title}</p>
            )}
            <p className="mt-0.5 text-xs text-content-muted">{item.detail}</p>
          </div>
          <span
            className={`shrink-0 rounded-chip px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
              item.live ? 'bg-eth-blue-wash text-eth-blue-text' : 'bg-surface-inset text-content-faint'
            }`}
          >
            {item.live ? 'Live' : 'Coming'}
          </span>
        </li>
      ))}
    </ul>
  </section>
);

export default VerifiedState;

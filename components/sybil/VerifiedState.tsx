import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckIcon, RefreshIcon } from '../shared/icons';

interface VerifiedStateProps {
  /** From the mint's block; null when the RPC refused the log range. */
  mintedAt: Date | null;
  tokenId: bigint | null;
  tokenData: {
    uniqueIdentifier: `0x${string}`;
    personhoodVerified: boolean;
    isOver18: boolean;
    nationality: string;
  } | null;
  nftMetadata: {
    name?: string;
    image?: string;
  } | null;
  refreshing: boolean;
  onRefresh: () => void;
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
const UNLOCKS: ReadonlyArray<{ title: string; detail: string; live: boolean }> = [
  {
    title: 'Faucet claims on verified-only vaults',
    detail: 'Vaults with the passport gate accept your claim; unverified wallets are refused.',
    live: true,
  },
  {
    title: 'Hackathon staking',
    detail: 'Gated hackathons will check this NFT. Not deployed yet.',
    live: false,
  },
  {
    title: 'Event vouchers',
    detail: 'Verified-only vouchers for events and swag drops.',
    live: false,
  },
];

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

/** ipfs:// and any gateway URL, served through the gateway the metadata was pinned to. */
function ipfsImage(url: string): string {
  if (url.startsWith('ipfs://')) return `https://gateway.pinata.cloud/ipfs/${url.slice(7)}`;
  if (url.includes('/ipfs/')) return `https://gateway.pinata.cloud/ipfs/${url.split('/ipfs/').pop()}`;
  return url;
}

/**
 * The one card for a verified wallet: the NFT, the badge, what it proves and
 * what it unlocks. There is no "start verification" here: the proof was made
 * once and the token is soulbound, so asking again would only produce a
 * `duplicate` revert.
 */
const VerifiedState: React.FC<VerifiedStateProps> = ({ mintedAt, tokenId, tokenData, nftMetadata, refreshing, onRefresh }) => {
  const image = nftMetadata?.image ? ipfsImage(nftMetadata.image) : null;

  return (
    <section className="rounded-card border border-line-hairline bg-surface-slab p-5" aria-labelledby="verified-title">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-inset">
          {image && <Image src={image} alt="" fill className="object-cover" sizes="64px" unoptimized />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="verified-title" className="truncate text-lg font-bold leading-tight text-content-primary">
            {nftMetadata?.name ?? 'ZKPassport identity'}
          </h2>
          <p className="mb-0 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-content-muted">
            <span className="inline-flex items-center gap-1 rounded-full bg-signal-confirmed/10 px-2 py-0.5 text-xs font-semibold text-signal-confirmed">
              <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
              Verified
            </span>
            {mintedAt && <span>{dateFormat.format(mintedAt)}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-content-faint transition-colors hover:bg-surface-inset hover:text-content-primary disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshIcon className={`h-[18px] w-[18px] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Token', value: tokenId !== null ? `#${tokenId.toString()}` : '—' },
          { label: 'Age', value: tokenData ? (tokenData.isOver18 ? '18+' : '—') : '—' },
          { label: 'Nationality', value: tokenData?.nationality || '—' },
        ].map((item) => (
          <div key={item.label} className="min-w-0 rounded-chip bg-surface-inset px-3 py-2">
            <dt className="text-xs text-content-muted">{item.label}</dt>
            <dd className="truncate font-mono text-sm text-content-primary">{item.value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-0 mt-5 text-sm font-semibold text-content-secondary">What this unlocks</h3>
      <ul className="mt-1 divide-y divide-line-hairline">
        {UNLOCKS.map((item) => (
          <li key={item.title} className="flex items-start gap-3 py-3">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.live ? 'bg-signal-confirmed' : 'bg-surface-ridge'}`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="mb-0 text-sm text-content-primary">{item.title}</p>
              <p className="mb-0 mt-0.5 text-xs text-content-muted">{item.detail}</p>
            </div>
            <span
              className={`shrink-0 rounded-chip px-2 py-0.5 text-xs ${
                item.live ? 'bg-eth-blue-wash text-eth-blue-text' : 'bg-surface-inset text-content-faint'
              }`}
            >
              {item.live ? 'Live' : 'Soon'}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/faucet"
        className="mt-2 flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
      >
        Go to faucet
      </Link>
    </section>
  );
};

export default VerifiedState;

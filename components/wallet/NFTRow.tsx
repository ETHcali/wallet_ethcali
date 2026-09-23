import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserNFT } from '../../hooks/useUserNFTs';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { ChevronDownIcon } from '../shared/icons';

interface NFTRowProps {
  nft: UserNFT;
}

/**
 * One swag NFT in the wallet's collectibles list — the same 60px row as a
 * token, opening in place to the description, the attributes and the orders.
 *
 * The NFT proves the design; shipping and size live on the order, which is
 * why this links to /swag/orders instead of carrying a redeem button —
 * redemption is no longer an on-chain action.
 */
export function NFTRow({ nft }: NFTRowProps) {
  const [open, setOpen] = useState(false);
  const imageUrl = nft.image ? getIPFSGatewayUrl(nft.image) || nft.image : '';

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-[60px] w-full items-center gap-3 px-4 text-left transition-colors duration-base hover:bg-surface-inset active:bg-surface-inset"
      >
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-chip bg-surface-inset">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="36px"
              unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
            />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-medium leading-tight text-content-primary">{nft.name}</span>
          <span className="mt-0.5 font-mono text-xs leading-tight text-content-faint">#{nft.tokenId.toString()}</span>
        </span>
        <span className="font-mono text-[15px] tabular-nums text-content-primary">×{nft.balance}</span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-content-faint transition-transform duration-base ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4">
          {nft.description && <p className="mb-0 text-sm leading-relaxed text-content-muted">{nft.description}</p>}
          {nft.attributes.length > 0 && (
            <dl className="grid grid-cols-2 gap-2">
              {nft.attributes.map((attr, idx) => (
                <div key={`${attr.trait_type}-${idx}`} className="min-w-0 rounded-chip bg-surface-inset px-3 py-2">
                  <dt className="truncate text-xs text-content-faint">{attr.trait_type}</dt>
                  <dd className="truncate text-sm text-content-primary">{attr.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <Link
            href="/swag/orders"
            className="flex min-h-tap w-full items-center justify-center rounded-control border border-line-strong text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
          >
            Shipping and orders
          </Link>
        </div>
      )}
    </li>
  );
}

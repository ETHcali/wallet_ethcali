import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserNFT } from '../../hooks/useUserNFTs';
import { getIPFSGatewayUrl } from '../../lib/pinata';

interface NFTCardProps {
  nft: UserNFT;
}

/**
 * One swag NFT in the wallet's collectibles tab.
 *
 * The NFT proves the design; shipping and size live on the order, which is
 * why this card links to /swag/orders instead of carrying a redeem button —
 * redemption is no longer an on-chain action.
 */
export function NFTCard({ nft }: NFTCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const imageUrl = nft.image ? getIPFSGatewayUrl(nft.image) || nft.image : '';

  return (
    <div className="rounded-card border border-line-hairline bg-surface-slab p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-chip border border-line-hairline bg-surface-inset sm:h-[120px] sm:w-[120px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={nft.name}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 120px, 100vw"
              unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="truncate text-lg font-semibold text-content-primary">{nft.name}</h3>
          <p className="text-sm text-content-muted">
            Balance <span className="font-mono text-eth-blue-text">{nft.balance}</span>
          </p>
          {nft.description && (
            <p className="text-sm leading-relaxed text-content-muted">{nft.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/swag/orders"
          className="inline-flex min-h-[36px] items-center rounded-control border border-line-strong px-4 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
        >
          Shipping and orders
        </Link>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="inline-flex min-h-[36px] items-center rounded-control border border-line-hairline px-4 text-sm text-content-muted transition-colors hover:text-content-primary"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-line-hairline pt-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-content-muted">Token id</span>
            <span className="font-mono text-content-secondary">#{nft.tokenId.toString()}</span>
          </div>

          {nft.attributes.length > 0 && (
            <div className="mt-2">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-content-faint">
                Attributes
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {nft.attributes.map((attr, idx) => (
                  <div
                    key={`${attr.trait_type}-${idx}`}
                    className="flex flex-col gap-1 rounded-chip border border-line-hairline bg-surface-inset p-2"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wide text-content-muted">
                      {attr.trait_type}
                    </span>
                    <span className="text-sm text-eth-blue-text">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

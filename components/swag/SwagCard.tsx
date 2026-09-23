import { useState } from 'react';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { SWAG_COLLECTION_BASE } from '../../config/constants';
import type { SwagProduct, SwagSize } from '../../types/swag';
import type { SwagTokenState } from '../../hooks/swag';
import {
  describeBlockedReason,
  formatCop,
  formatUsd,
  formatUsdc,
  productAltName,
  productDescription,
  productImageUrl,
  productName,
  shopifyCartUrl,
  shopifyVariantFor,
  type SwagLocale,
} from '../../hooks/swag';

interface SwagCardProps {
  product: SwagProduct;
  /** Live state for this design's token, or undefined while loading / not on chain. */
  onchain?: SwagTokenState;
  paused: boolean;
  /** COP per USD, or null when the TRM is unavailable. */
  trm: number | null;
  locale: SwagLocale;
  onPayWithUsdc: (product: SwagProduct, tokenId: number, size: SwagSize | null) => void;
}

const SECONDARY =
  'flex min-h-tap w-full items-center justify-center rounded-control border border-line-strong px-4 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text disabled:cursor-not-allowed disabled:border-line-hairline disabled:text-content-faint';
const PRIMARY =
  'flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint';

/**
 * One design. Two channels with split stock: the chain says what is left for
 * USDC, Shopify says whether card checkout is open (its live count is not
 * readable anonymously, so no number is shown for it).
 */
export function SwagCard({ product, onchain, paused, trm, locale, onPayWithUsdc }: SwagCardProps) {
  const [size, setSize] = useState<SwagSize | null>(null);
  const [needsSize, setNeedsSize] = useState(false);

  const image = productImageUrl(product);
  const name = productName(product, locale);
  const tokenId = product.variant?.token_id ?? null;

  const remaining = onchain ? Number(onchain.remaining) : null;
  const soldOutOnchain = remaining !== null && remaining <= 0;
  const usdcBlocked: string | null = !tokenId
    ? locale === 'es' ? 'Aún no está en la cadena.' : 'Not on chain yet.'
    : paused
      ? describeBlockedReason('paused', locale)
      : onchain && !onchain.canBuy
        ? describeBlockedReason(onchain.reason, locale)
        : null;

  const cardVariant = shopifyVariantFor(product, product.sized ? size : null);
  const cardOpen = product.shopify.length > 0;

  const requireSize = (): boolean => {
    if (product.sized && !size) {
      setNeedsSize(true);
      return false;
    }
    return true;
  };

  const payWithCard = () => {
    if (!requireSize() || !cardVariant) return;
    window.open(shopifyCartUrl(cardVariant, 1), '_blank', 'noopener,noreferrer');
  };

  const payWithUsdc = () => {
    if (!requireSize() || tokenId === null) return;
    onPayWithUsdc(product, tokenId, product.sized ? size : null);
  };

  // The contract's USDC price is the one a crypto buyer pays; the list price
  // is the fallback until the chain answers. Formatted with USDC's 6 decimals.
  const usd = onchain && onchain.price > 0n
    ? Number(formatUnits(onchain.price, SWAG_COLLECTION_BASE.usdcDecimals))
    : product.price_usd;
  const cop = trm ? formatCop(usd * trm) : null;

  return (
    <article
      id={product.sku}
      className="flex flex-col overflow-hidden rounded-card border border-line-hairline bg-surface-slab"
    >
      <div className="relative aspect-square w-full bg-surface-inset">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-wide text-content-faint">
            {product.category}
          </div>
        )}
        {tokenId !== null && (
          <span className="absolute left-3 top-3 rounded-chip bg-surface-void/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-content-secondary backdrop-blur-sm">
            #{tokenId}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-content-faint">{product.category}</p>
          <h2
            className="mt-1 text-base font-semibold leading-snug text-content-primary"
            title={productAltName(product, locale)}
            lang={locale}
          >
            {name}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-content-muted">{productDescription(product, locale)}</p>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-lg text-content-primary">{formatUsd(usd)}</span>
          <span className="font-mono text-sm text-content-muted">{cop ?? 'COP unavailable'}</span>
          {onchain && onchain.price > 0n && (
            <span className="w-full font-mono text-[11px] text-content-faint">{formatUsdc(onchain.price)} on Base</span>
          )}
        </div>

        <ul className="space-y-1 text-xs">
          <li className="flex items-center justify-between">
            <span className="text-content-muted">USDC on Base</span>
            <span className={`font-mono ${soldOutOnchain ? 'text-content-faint' : 'text-content-secondary'}`}>
              {remaining === null
                ? tokenId === null ? '—' : '…'
                : soldOutOnchain
                  ? locale === 'es' ? 'Agotado' : 'Sold out'
                  : locale === 'es' ? `${remaining} disponible${remaining === 1 ? '' : 's'}` : `${remaining} left`}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-content-muted">{locale === 'es' ? 'Con tarjeta' : 'Card checkout'}</span>
            <span className={`font-mono ${cardOpen ? 'text-content-secondary' : 'text-content-faint'}`}>
              {cardOpen ? (locale === 'es' ? 'Abierto' : 'Open') : locale === 'es' ? 'No disponible' : 'Unavailable'}
            </span>
          </li>
        </ul>

        {product.sized && product.sizes.length > 0 && (
          <div>
            <p className={`mb-1.5 text-xs font-semibold ${needsSize && !size ? 'text-signal-reverted' : 'text-content-secondary'}`}>
              {locale === 'es' ? 'Talla' : 'Size'}
              {needsSize && !size && (locale === 'es' ? ' — elige una' : ' — pick one')}
            </p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Size">
              {product.sizes.map((s) => {
                const active = size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setSize(s);
                      setNeedsSize(false);
                    }}
                    className={`min-h-[36px] min-w-[44px] rounded-chip border px-2 font-mono text-xs transition-colors ${
                      active
                        ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                        : 'border-line-strong text-content-secondary hover:border-line-brand'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onClick={payWithCard}
            disabled={!cardOpen}
            className={SECONDARY}
            title={cardOpen ? undefined : locale === 'es' ? 'Sin variante en la tienda' : 'No store variant yet'}
          >
            {locale === 'es' ? 'Pagar con tarjeta' : 'Pay with card'}
          </button>
          <button
            type="button"
            onClick={payWithUsdc}
            disabled={Boolean(usdcBlocked)}
            className={PRIMARY}
            title={usdcBlocked ?? undefined}
          >
            {locale === 'es' ? 'Pagar con USDC' : 'Pay with USDC'}
          </button>
          {usdcBlocked && tokenId !== null && (
            <p className="text-center text-xs text-content-faint">{usdcBlocked}</p>
          )}
        </div>
      </div>
    </article>
  );
}

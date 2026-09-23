import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { SWAG_COLLECTION } from '../../config/constants';
import type { SwagProduct, SwagSize } from '../../types/swag';
import type { SwagTokenState, UtmParams } from '../../hooks/swag';
import {
  appProductPath,
  describeBlockedReason,
  formatCop,
  productAltName,
  productDescription,
  productImageUrl,
  productName,
  shopifyCartUrl,
  shopifyVariantFor,
  usdcDiscountPct,
  withUtm,
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
  /** Campaign parameters from the page URL, forwarded onto the card checkout link. */
  utm?: UtmParams;
  /** The product page: large photo, full copy, an h1. The grid renders the compact card. */
  expanded?: boolean;
  /** Size to start with (from `?size=`); ignored for unsized designs. */
  initialSize?: SwagSize | null;
  /** Ask for a size straight away — the page was opened to pay but no valid size came with it. */
  promptSize?: boolean;
}

const SECONDARY =
  'flex min-h-tap w-full items-center justify-center rounded-control border border-line-strong px-4 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text disabled:cursor-not-allowed disabled:border-line-hairline disabled:text-content-faint';
const PRIMARY =
  'flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint';

/** `US$ 12.00` — the currency spelled out because the page shows pesos beside it. */
function usdLabel(value: number): string {
  return `US$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** `−10 %` with a real minus and a non-breaking space, the way a price tag prints it. */
function discountLabel(pct: number): string {
  return `−${pct} %`;
}

/**
 * One design, one purchase module, two surfaces: the compact grid card and the
 * expanded product page render the same thing. Two channels with split stock:
 * the chain says what is left for USDC, Shopify says whether card checkout is
 * open (its live count is not readable anonymously, so no number is shown).
 *
 * Two prices. The list price is what the card charges; the USDC price is what
 * the contract charges (`getTokenPrice`), with the catalogue's `price_usdc`
 * standing in until the chain answers. The discount is computed from the two,
 * never assumed.
 */
export function SwagCard({
  product,
  onchain,
  paused,
  trm,
  locale,
  onPayWithUsdc,
  utm = {},
  expanded = false,
  initialSize = null,
  promptSize = false,
}: SwagCardProps) {
  const [size, setSize] = useState<SwagSize | null>(
    product.sized && initialSize && product.sizes.includes(initialSize) ? initialSize : null
  );
  const [needsSize, setNeedsSize] = useState(promptSize && product.sized);

  const es = locale === 'es';
  const image = productImageUrl(product);
  const name = productName(product, locale);
  const tokenId = product.variant?.token_id ?? null;

  const remaining = onchain ? Number(onchain.remaining) : null;
  const soldOutOnchain = remaining !== null && remaining <= 0;
  const usdcBlocked: string | null = !tokenId
    ? es ? 'Aún no está en la cadena.' : 'Not on chain yet.'
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
    // Straight into Shopify checkout (the cart permalink 302s there), with the
    // campaign that brought the buyer still attached.
    window.open(withUtm(shopifyCartUrl(cardVariant, 1), utm), '_blank', 'noopener,noreferrer');
  };

  const payWithUsdc = () => {
    if (!requireSize() || tokenId === null) return;
    onPayWithUsdc(product, tokenId, product.sized ? size : null);
  };

  // List price from the catalogue; USDC price from the contract, formatted
  // with USDC's 6 decimals, falling back to the mirrored column until it loads.
  const listUsd = product.price_usd;
  const chainUsd =
    onchain && onchain.price > 0n ? Number(formatUnits(onchain.price, SWAG_COLLECTION.usdcDecimals)) : null;
  const usdcUsd = chainUsd ?? product.price_usdc;
  const discount = usdcDiscountPct(listUsd, usdcUsd);
  const cop = trm ? formatCop(listUsd * trm) : null;

  const usdcCta = `${es ? 'Pagar con USDC' : 'Pay with USDC'}${discount ? ` ${discountLabel(discount)}` : ''}`;

  const title = (
    <span title={productAltName(product, locale)} lang={locale}>
      {name}
    </span>
  );

  const photo = (
    <div className={`relative w-full bg-surface-inset ${expanded ? 'aspect-square md:min-h-[420px]' : 'aspect-square'}`}>
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          priority={expanded}
          className="object-cover"
          sizes={expanded ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
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
  );

  return (
    <article
      id={product.sku}
      className={`flex flex-col overflow-hidden rounded-card border border-line-hairline bg-surface-slab ${
        expanded ? 'md:grid md:grid-cols-2' : ''
      }`}
    >
      {photo}

      <div className={`flex flex-1 flex-col ${expanded ? 'gap-5 p-5 md:p-8' : 'gap-3 p-4'}`}>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-content-faint">{product.category}</p>
          {expanded ? (
            <h1 className="mt-1 text-2xl font-bold leading-tight text-content-primary sm:text-3xl">{title}</h1>
          ) : (
            <h2 className="mt-1 text-base font-semibold leading-snug text-content-primary">
              <Link
                href={appProductPath(product)}
                className="transition-colors hover:text-eth-blue-text focus-visible:text-eth-blue-text"
              >
                {title}
              </Link>
            </h2>
          )}
          <p className={`mt-1 text-content-muted ${expanded ? 'text-base leading-relaxed' : 'line-clamp-2 text-sm'}`}>
            {productDescription(product, locale)}
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={`font-mono text-content-primary ${expanded ? 'text-2xl' : 'text-lg'}`}>{usdLabel(listUsd)}</span>
            <span className="font-mono text-sm text-content-muted">{cop ?? 'COP unavailable'}</span>
          </div>
          {usdcUsd !== null && (
            <p className={`font-mono text-eth-blue-text ${expanded ? 'text-base' : 'text-sm'}`}>
              {usdLabel(usdcUsd)} {es ? 'con USDC' : 'with USDC'}
              {discount && <span className="text-content-secondary"> ({discountLabel(discount)})</span>}
            </p>
          )}
        </div>

        <ul className="space-y-1 text-xs">
          <li className="flex items-center justify-between">
            <span className="text-content-muted">{es ? 'Con USDC' : 'USDC'}</span>
            <span className={`font-mono ${soldOutOnchain ? 'text-content-faint' : 'text-content-secondary'}`}>
              {remaining === null
                ? tokenId === null ? '—' : '…'
                : soldOutOnchain
                  ? es ? 'Agotado' : 'Sold out'
                  : es ? `${remaining} disponible${remaining === 1 ? '' : 's'}` : `${remaining} left`}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-content-muted">{es ? 'Con tarjeta' : 'Card'}</span>
            <span className={`font-mono ${cardOpen ? 'text-content-secondary' : 'text-content-faint'}`}>
              {cardOpen ? (es ? 'Abierto' : 'Open') : es ? 'No disponible' : 'Unavailable'}
            </span>
          </li>
        </ul>

        {product.sized && product.sizes.length > 0 && (
          <div>
            <p className={`mb-1.5 text-xs font-semibold ${needsSize && !size ? 'text-signal-reverted' : 'text-content-secondary'}`}>
              {es ? 'Talla' : 'Size'}
              {needsSize && !size && (es ? ' — elige una' : ' — pick one')}
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
          <div>
            <button
              type="button"
              onClick={payWithCard}
              disabled={!cardOpen}
              className={SECONDARY}
              title={cardOpen ? undefined : es ? 'Sin variante en la tienda' : 'No store variant yet'}
            >
              {es ? 'Pagar con tarjeta' : 'Pay with card'}
            </button>
            <p className="mt-1 text-center text-[11px] text-content-faint">
              {es ? 'Envío gestionado por la tienda · Stripe' : 'Shipping handled by the store · Stripe'}
            </p>
          </div>
          <button
            type="button"
            onClick={payWithUsdc}
            disabled={Boolean(usdcBlocked)}
            className={PRIMARY}
            title={usdcBlocked ?? undefined}
          >
            {usdcCta}
          </button>
          {usdcBlocked && tokenId !== null && (
            <p className="text-center text-xs text-content-faint">{usdcBlocked}</p>
          )}
        </div>
      </div>
    </article>
  );
}

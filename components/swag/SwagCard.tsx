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
  formatUsd,
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

/** `−10 %` with a real minus and a non-breaking space, the way a price tag prints it. */
function discountLabel(pct: number): string {
  return `−${pct} %`;
}

/**
 * The two prices. The list price is what the card charges; the USDC price is
 * what the contract charges (`getTokenPrice`, USDC's 6 decimals), with the
 * catalogue's `price_usdc` standing in until the chain answers. The discount is
 * computed from the two, never assumed.
 */
function pricesFor(product: SwagProduct, onchain: SwagTokenState | undefined, trm: number | null) {
  const listUsd = product.price_usd;
  const chainUsd =
    onchain && onchain.price > 0n ? Number(formatUnits(onchain.price, SWAG_COLLECTION.usdcDecimals)) : null;
  const usdcUsd = chainUsd ?? product.price_usdc;
  return {
    listUsd,
    usdcUsd,
    discount: usdcDiscountPct(listUsd, usdcUsd),
    cop: trm ? formatCop(listUsd * trm) : null,
  };
}

/** What is left for USDC: the chain's count, never the card channel's. */
function stockFor(product: SwagProduct, onchain: SwagTokenState | undefined, es: boolean) {
  const tokenId = product.variant?.token_id ?? null;
  const remaining = onchain ? Number(onchain.remaining) : null;
  const soldOut = remaining !== null && remaining <= 0;
  const label =
    remaining === null
      ? tokenId === null ? null : '…'
      : soldOut
        ? es ? 'Agotado' : 'Sold out'
        : es ? `Quedan ${remaining}` : `${remaining} left`;
  return { tokenId, remaining, soldOut, label };
}

// ── Grid tile ───────────────────────────────────────────────────────────────

interface SwagCardProps {
  product: SwagProduct;
  /** Live state for this design's token, or undefined while loading / not on chain. */
  onchain?: SwagTokenState;
  /** COP per USD, or null when the TRM is unavailable. */
  trm: number | null;
  locale: SwagLocale;
  /** Campaign parameters from the page URL, carried onto the product page. */
  utm?: UtmParams;
  /** The first row of the grid loads eagerly. */
  priority?: boolean;
}

/**
 * One design in the grid: square photo, name, the two prices, and what is left
 * on chain. The whole tile is the link — size and the two pay buttons live on
 * the product page, where there is room for them.
 */
export function SwagCard({ product, onchain, trm, locale, utm = {}, priority = false }: SwagCardProps) {
  const es = locale === 'es';
  const image = productImageUrl(product);
  const name = productName(product, locale);
  const { listUsd, usdcUsd, discount, cop } = pricesFor(product, onchain, trm);
  const stock = stockFor(product, onchain, es);

  return (
    <Link
      id={product.sku}
      href={{ pathname: appProductPath(product), query: utm }}
      className="group flex scroll-mt-28 flex-col overflow-hidden rounded-card border border-line-hairline bg-surface-slab transition-colors duration-base hover:border-line-strong focus-visible:border-line-brand"
    >
      <div className="relative aspect-square w-full bg-surface-inset">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            priority={priority}
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-wide text-content-faint">
            {product.category}
          </div>
        )}
        {stock.label && (
          <span
            className={`absolute left-2 top-2 rounded-chip bg-surface-void/80 px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm ${
              stock.soldOut ? 'text-content-faint' : 'text-content-secondary'
            }`}
          >
            {stock.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        <h2
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-content-primary transition-colors group-hover:text-eth-blue-text md:text-base md:leading-6 md:min-h-[3rem]"
          title={productAltName(product, locale)}
          lang={locale}
        >
          {name}
        </h2>
        <div className="mt-auto space-y-0.5 font-mono tabular-nums">
          <p className="mb-0 flex items-baseline gap-1.5 text-[15px] leading-5 text-content-primary">
            {formatUsd(listUsd)}
            <span className="font-sans text-[11px] text-content-faint">{es ? 'tarjeta' : 'card'}</span>
          </p>
          {usdcUsd !== null && (
            <p className="mb-0 flex flex-wrap items-baseline gap-x-1.5 text-[13px] leading-5 text-eth-blue-text">
              {formatUsd(usdcUsd)} USDC
              {discount && <span className="text-[11px] text-content-secondary">{discountLabel(discount)}</span>}
            </p>
          )}
          {cop && <p className="mb-0 truncate text-[11px] leading-4 text-content-faint">{cop}</p>}
        </div>
      </div>
    </Link>
  );
}

// ── Product page ────────────────────────────────────────────────────────────

const SECONDARY =
  'flex min-h-tap w-full items-center justify-center rounded-control border border-line-strong bg-surface-slab px-3 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text disabled:cursor-not-allowed disabled:border-line-hairline disabled:text-content-faint';
const PRIMARY =
  'flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue px-3 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint';

interface SwagProductViewProps extends SwagCardProps {
  paused: boolean;
  onPayWithUsdc: (product: SwagProduct, tokenId: number, size: SwagSize | null) => void;
  /** Size to start with (from `?size=`); ignored for unsized designs. */
  initialSize?: SwagSize | null;
  /** Ask for a size straight away — the page was opened to pay but no valid size came with it. */
  promptSize?: boolean;
}

/**
 * One design, expanded: the photo full-bleed on a phone, the prices, the size,
 * the copy, and the two ways to pay. Two channels with split stock: the chain
 * says what is left for USDC, Shopify says whether card checkout is open (its
 * live count is not readable anonymously, so no number is shown).
 *
 * On a phone the two pay buttons ride in a bar pinned above the tab bar; from
 * md up they sit in the column under the size.
 */
export function SwagProductView({
  product,
  onchain,
  paused,
  trm,
  locale,
  onPayWithUsdc,
  utm = {},
  initialSize = null,
  promptSize = false,
}: SwagProductViewProps) {
  const [size, setSize] = useState<SwagSize | null>(
    product.sized && initialSize && product.sizes.includes(initialSize) ? initialSize : null
  );
  const [needsSize, setNeedsSize] = useState(promptSize && product.sized);

  const es = locale === 'es';
  const image = productImageUrl(product);
  const name = productName(product, locale);
  const { listUsd, usdcUsd, discount, cop } = pricesFor(product, onchain, trm);
  const stock = stockFor(product, onchain, es);
  const tokenId = stock.tokenId;

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
      document.getElementById('size-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const buttons = (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={payWithCard}
        disabled={!cardOpen}
        className={SECONDARY}
        title={cardOpen ? undefined : es ? 'Sin variante en la tienda' : 'No store variant yet'}
      >
        {es ? 'Tarjeta' : 'Card'}
      </button>
      <button type="button" onClick={payWithUsdc} disabled={Boolean(usdcBlocked)} className={PRIMARY} title={usdcBlocked ?? undefined}>
        USDC{discount ? ` ${discountLabel(discount)}` : ''}
      </button>
    </div>
  );

  return (
    <article id={product.sku} className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
      {/* Full-bleed on a phone: the page gutter is 16px, so -mx-4 reaches the edges. */}
      <div className="relative -mx-4 aspect-square bg-surface-inset md:mx-0 md:overflow-hidden md:rounded-card md:border md:border-line-hairline">
        {image ? (
          <Image src={image} alt={name} fill priority className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
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

      <div className="flex flex-col gap-5 pt-5 md:pt-0">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-content-faint">{product.category}</p>
          <h1 className="text-2xl font-bold leading-tight text-content-primary md:text-3xl" title={productAltName(product, locale)} lang={locale}>
            {name}
          </h1>
        </div>

        {/* Prices */}
        <div className="space-y-1 font-mono tabular-nums">
          <p className="mb-0 flex flex-wrap items-baseline gap-x-2 text-content-primary">
            <span className="text-2xl">{formatUsd(listUsd)}</span>
            <span className="font-sans text-sm text-content-muted">{es ? 'con tarjeta' : 'by card'}</span>
          </p>
          {usdcUsd !== null && (
            <p className="mb-0 flex flex-wrap items-baseline gap-x-2 text-lg text-eth-blue-text">
              {formatUsd(usdcUsd)} USDC
              {discount && (
                <span className="rounded-chip bg-eth-blue-wash px-1.5 py-0.5 text-xs text-eth-blue-text">{discountLabel(discount)}</span>
              )}
            </p>
          )}
          <p className="mb-0 text-sm text-content-faint">{cop ?? (es ? 'COP no disponible' : 'COP unavailable')}</p>
        </div>

        {/* Stock, per channel */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-chip border border-line-hairline px-2.5 py-1 text-content-muted">
            USDC · <span className={`font-mono ${stock.soldOut ? 'text-content-faint' : 'text-content-primary'}`}>{stock.label ?? '—'}</span>
          </span>
          <span className="rounded-chip border border-line-hairline px-2.5 py-1 text-content-muted">
            {es ? 'Tarjeta' : 'Card'} ·{' '}
            <span className={cardOpen ? 'text-content-primary' : 'text-content-faint'}>
              {cardOpen ? (es ? 'Abierto' : 'Open') : es ? 'No disponible' : 'Unavailable'}
            </span>
          </span>
        </div>

        {product.sized && product.sizes.length > 0 && (
          <div id="size-picker">
            <p className={`mb-2 text-sm font-semibold ${needsSize && !size ? 'text-signal-reverted' : 'text-content-secondary'}`}>
              {es ? 'Talla' : 'Size'}
              {needsSize && !size && (es ? ' — elige una' : ' — pick one')}
            </p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={es ? 'Talla' : 'Size'}>
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
                    className={`min-h-[44px] min-w-[52px] rounded-control border px-3 font-mono text-sm transition-colors ${
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

        {/* md+: the actions in the column */}
        <div className="hidden md:block">{buttons}</div>

        <div className="space-y-1 text-xs text-content-faint">
          {usdcBlocked && tokenId !== null && <p className="mb-0 text-content-muted">{usdcBlocked}</p>}
          <p className="mb-0">
            {es
              ? 'Tarjeta: envío gestionado por la tienda (Stripe). USDC: el diseño se acuña como NFT y el envío va en el pedido.'
              : 'Card: shipping handled by the store (Stripe). USDC: the design mints as an NFT and shipping goes on the order.'}
          </p>
        </div>

        <p className="mb-0 whitespace-pre-line text-[15px] leading-relaxed text-content-secondary">{productDescription(product, locale)}</p>
      </div>

      {/* Phone: pinned above the tab bar. The page leaves room for it (pb-24 on main). */}
      <div className="fixed inset-x-0 bottom-[var(--tabbar-h)] z-30 border-t border-line-hairline bg-surface-void/90 px-4 py-3 backdrop-blur-[14px] md:hidden">
        {buttons}
      </div>
    </article>
  );
}

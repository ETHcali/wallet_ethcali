import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import Loading from '../../components/shared/Loading';
import { SwagCard } from '../../components/swag/SwagCard';
import { SWAG_CHAIN, useSwagCatalogue, useSwagLocale, useSwagOnchain, useTrm, utmFromQuery } from '../../hooks/swag';
import type { SwagCategory } from '../../types/swag';

/** Shelf order and names. A category with nothing in it gets no chip. */
const CATEGORIES: ReadonlyArray<{ value: SwagCategory; es: string; en: string }> = [
  { value: 'Cap', es: 'Gorras', en: 'Caps' },
  { value: 'Mug', es: 'Tazas', en: 'Mugs' },
  { value: 'Hoodie', es: 'Hoodies', en: 'Hoodies' },
  { value: 'T-shirt', es: 'Camisetas', en: 'T-shirts' },
];

const CHIP =
  'inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-base';

/**
 * The public storefront. No auth gate: the catalogue and the chain are both
 * readable by anyone. The grid is for choosing; paying happens on the product
 * page (`/swag/<sku>`), where the size picker and both buttons have room. The
 * hooks pin the collection's chain themselves; the page never reads the wallet's.
 */
export default function SwagStorePage() {
  const router = useRouter();
  const locale = useSwagLocale();
  const es = locale === 'es';
  const catalogue = useSwagCatalogue();
  const onchain = useSwagOnchain(catalogue.tokenIds);
  const { rate } = useTrm();
  const [category, setCategory] = useState<SwagCategory | null>(null);
  // Campaign parameters ride along to the product page, and from there to the card checkout.
  const utm = useMemo(() => utmFromQuery(router.query), [router.query]);

  const shelves = useMemo(
    () =>
      CATEGORIES.map((c) => ({ ...c, count: catalogue.products.filter((p) => p.category === c.value).length })).filter(
        (c) => c.count > 0
      ),
    [catalogue.products]
  );
  const products = category ? catalogue.products.filter((p) => p.category === category) : catalogue.products;

  return (
    <div className="min-h-screen bg-surface-void">
      <Head>
        <title>Swag — ETH Cali</title>
        <meta
          name="description"
          content="Official ETH Cali merch. Pay with card or with USDC; every purchase mints the design as an NFT."
        />
      </Head>
      <Navigation />

      <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-5 md:px-6 md:py-8">
        <header className="mb-4 flex items-start justify-between gap-4 md:mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-content-primary md:text-4xl">
              {es ? 'Swag ETH Cali' : 'ETH Cali swag'}
            </h1>
            <p className="mb-0 mt-1 max-w-xl text-sm text-content-muted">
              {es
                ? 'Paga con tarjeta o con USDC. Con USDC el diseño llega también como NFT.'
                : 'Pay by card or with USDC. With USDC the design also arrives as an NFT.'}
            </p>
          </div>
          <Link
            href="/swag/orders"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-control border border-line-strong px-4 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
          >
            {es ? 'Mi swag' : 'My swag'}
          </Link>
        </header>

        {shelves.length > 1 && (
          <nav
            aria-label={es ? 'Categorías' : 'Categories'}
            className="sticky top-14 z-20 -mx-4 mb-4 border-b border-line-hairline bg-surface-void/90 px-4 py-2 backdrop-blur-[14px] md:top-nav md:mx-0 md:mb-6 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none"
          >
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
              <button
                type="button"
                onClick={() => setCategory(null)}
                aria-pressed={category === null}
                className={`${CHIP} ${
                  category === null
                    ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                    : 'border-line-strong text-content-secondary hover:text-content-primary'
                }`}
              >
                {es ? 'Todo' : 'All'}
                <span className="font-mono text-[11px] text-content-faint">{catalogue.products.length}</span>
              </button>
              {shelves.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={category === c.value}
                  className={`${CHIP} ${
                    category === c.value
                      ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                      : 'border-line-strong text-content-secondary hover:text-content-primary'
                  }`}
                >
                  {es ? c.es : c.en}
                  <span className="font-mono text-[11px] text-content-faint">{c.count}</span>
                </button>
              ))}
            </div>
          </nav>
        )}

        {onchain.paused && (
          <p className="mb-4 rounded-chip border border-line-hairline bg-surface-inset px-4 py-3 text-sm text-content-secondary">
            {es
              ? 'Las compras con USDC están en pausa. El pago con tarjeta sigue abierto.'
              : 'USDC purchases are paused right now. Card checkout stays open.'}
          </p>
        )}

        {catalogue.isLoading ? (
          <div className="py-16">
            <Loading size="medium" text={es ? 'Cargando catálogo…' : 'Loading catalogue…'} />
          </div>
        ) : catalogue.error ? (
          <div className="rounded-card border border-line-hairline bg-surface-slab px-5 py-8 text-center">
            <p className="mb-0 font-semibold text-content-primary">
              {es ? 'No pudimos cargar el catálogo.' : 'The catalogue could not be loaded.'}
            </p>
            <p className="mb-0 mt-2 text-sm text-content-muted">{catalogue.error}</p>
            <button
              type="button"
              onClick={() => catalogue.refetch()}
              className="mt-5 inline-flex min-h-tap items-center rounded-control border border-line-strong px-5 text-sm font-semibold text-content-primary hover:border-line-brand hover:text-eth-blue-text"
            >
              {es ? 'Reintentar' : 'Try again'}
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-card border border-line-hairline bg-surface-slab px-5 py-8 text-center">
            <p className="mb-0 font-semibold text-content-primary">{es ? 'Nada a la venta todavía.' : 'Nothing on sale yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {products.map((product, index) => (
              <SwagCard
                key={product.id}
                product={product}
                onchain={product.variant ? onchain.tokens[product.variant.token_id] : undefined}
                trm={rate}
                locale={locale}
                utm={utm}
                priority={index < 4}
              />
            ))}
          </div>
        )}

        <p className="mb-0 mt-8 text-center font-mono text-[10px] uppercase tracking-wide text-content-faint">
          {SWAG_CHAIN.name} · USDC · ETH Cali Swag 2026
        </p>
      </main>
    </div>
  );
}

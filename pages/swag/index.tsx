import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import Loading from '../../components/shared/Loading';
import { SwagCard } from '../../components/swag/SwagCard';
import { SwagCheckoutModal } from '../../components/swag/SwagCheckoutModal';
import { useSwagCatalogue, useSwagLocale, useSwagOnchain, useTrm, utmFromQuery } from '../../hooks/swag';
import type { SwagProduct, SwagSize } from '../../types/swag';

interface Checkout {
  product: SwagProduct;
  tokenId: number;
  size: SwagSize | null;
}

/**
 * The public storefront. No auth gate: the catalogue and the chain are both
 * readable by anyone, and the USDC button starts with Connect. Swag is
 * Base-only, so the page never reads or sets a global chain — Navigation gets
 * no chain prop and the hooks pin 8453 themselves.
 */
export default function SwagStorePage() {
  const router = useRouter();
  const locale = useSwagLocale();
  const catalogue = useSwagCatalogue();
  const onchain = useSwagOnchain(catalogue.tokenIds);
  const { rate } = useTrm();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  // Campaign parameters ride along to the card checkout so the ad gets credit.
  const utm = useMemo(() => utmFromQuery(router.query), [router.query]);

  return (
    <div className="min-h-screen bg-surface-void">
      <Head>
        <title>Swag — ETH Cali</title>
        <meta
          name="description"
          content="Official ETH Cali merch. Pay with card or with USDC on Base; every purchase mints the design as an NFT."
        />
      </Head>
      <Navigation />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-widest text-eth-blue-text">
              {locale === 'es' ? 'Merch oficial' : 'Official merch'}
            </p>
            <h1 className="text-3xl font-bold text-content-primary sm:text-4xl">
              {locale === 'es' ? 'Swag ETH Cali' : 'ETH Cali swag'}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-content-muted">
              {locale === 'es'
                ? 'Paga con tarjeta o con USDC en Base. Cada compra en la cadena acuña el diseño como NFT; la talla y el envío van en el pedido.'
                : 'Pay with card or with USDC on Base. Every on-chain purchase mints the design as an NFT; size and shipping live on the order.'}
            </p>
          </div>
          <Link
            href="/swag/orders"
            className="inline-flex min-h-tap items-center justify-center rounded-control border border-line-strong px-5 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
          >
            {locale === 'es' ? 'Mi swag' : 'My swag'}
          </Link>
        </header>

        {onchain.paused && (
          <p className="mb-6 rounded-chip border border-line-hairline bg-surface-inset px-4 py-3 text-sm text-content-secondary">
            {locale === 'es'
              ? 'Las compras con USDC están en pausa. El pago con tarjeta sigue abierto.'
              : 'USDC purchases are paused right now. Card checkout stays open.'}
          </p>
        )}

        {catalogue.isLoading ? (
          <div className="py-16">
            <Loading size="medium" text={locale === 'es' ? 'Cargando catálogo…' : 'Loading catalogue…'} />
          </div>
        ) : catalogue.error ? (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-10 text-center">
            <p className="font-semibold text-content-primary">
              {locale === 'es' ? 'No pudimos cargar el catálogo.' : 'The catalogue could not be loaded.'}
            </p>
            <p className="mt-2 text-sm text-content-muted">{catalogue.error}</p>
            <button
              type="button"
              onClick={() => catalogue.refetch()}
              className="mt-5 inline-flex min-h-tap items-center rounded-control border border-line-strong px-5 text-sm font-semibold text-content-primary hover:border-line-brand hover:text-eth-blue-text"
            >
              {locale === 'es' ? 'Reintentar' : 'Try again'}
            </button>
          </div>
        ) : catalogue.products.length === 0 ? (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-10 text-center">
            <p className="font-semibold text-content-primary">
              {locale === 'es' ? 'Nada a la venta todavía.' : 'Nothing on sale yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.products.map((product) => (
              <SwagCard
                key={product.id}
                product={product}
                onchain={product.variant ? onchain.tokens[product.variant.token_id] : undefined}
                paused={onchain.paused}
                trm={rate}
                locale={locale}
                utm={utm}
                onPayWithUsdc={(p, tokenId, size) => setCheckout({ product: p, tokenId, size })}
              />
            ))}
          </div>
        )}

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-wide text-content-faint">
          Base · USDC · ETH Cali Swag 2026
        </p>
      </main>

      {checkout && (
        <SwagCheckoutModal
          key={`${checkout.tokenId}-${checkout.size ?? ''}`}
          product={checkout.product}
          tokenId={checkout.tokenId}
          size={checkout.size}
          onClose={() => setCheckout(null)}
        />
      )}
    </div>
  );
}

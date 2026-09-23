/**
 * /swag/<sku> — one design, expanded, with the purchase module. The checkout
 * surface behind the website's product page (ethcali.org/swag/<sku>), which is
 * the canonical URL; ads and the site's "Pay with USDC" button land here.
 *
 *   ?pay=usdc          opens the USDC checkout once the catalogue and the
 *                      chain have answered for this design
 *   ?pay=card          goes straight to the Shopify cart permalink
 *   &size=M            preselects the size (sized designs only)
 *   utm_*              forwarded onto the card checkout link
 *
 * Open Graph is rendered at build/ISR time from Supabase so a crawler sees the
 * product, not the app's generic banner; the interactive card still reads the
 * live catalogue and the chain in the browser like the grid does.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import Loading from '../../components/shared/Loading';
import { SwagCard } from '../../components/swag/SwagCard';
import { SwagCheckoutModal } from '../../components/swag/SwagCheckoutModal';
import {
  productOgImageUrl,
  shopifyCartUrl,
  shopifyVariantFor,
  useSwagCatalogue,
  useSwagLocale,
  useSwagOnchain,
  useTrm,
  utmFromQuery,
  withUtm,
  SWAG_SITE_ORIGIN,
} from '../../hooks/swag';
import { supabase } from '../../lib/supabase';
import type { SwagProduct, SwagSize } from '../../types/swag';

/** What the crawler needs; the browser reads the full row through the catalogue hook. */
interface ProductMeta {
  sku: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  image_path: string | null;
}

interface ProductPageProps {
  meta: ProductMeta | null;
}

interface Checkout {
  product: SwagProduct;
  tokenId: number;
  size: SwagSize | null;
}

const SIZES: readonly SwagSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const META_SELECT = 'sku, name_es, name_en, description_es, description_en, image_path';

function first(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v ? v : null;
}

export default function SwagProductPage({ meta }: ProductPageProps) {
  const router = useRouter();
  const locale = useSwagLocale();
  const catalogue = useSwagCatalogue();
  const { rate } = useTrm();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const es = locale === 'es';

  const skuParam = router.isReady ? (first(router.query.sku) ?? '').toLowerCase() : null;
  const product = useMemo(
    () => (skuParam ? catalogue.products.find((p) => p.sku.toLowerCase() === skuParam) ?? null : null),
    [catalogue.products, skuParam]
  );

  const tokenIds = useMemo(() => (product?.variant ? [product.variant.token_id] : []), [product]);
  const onchain = useSwagOnchain(tokenIds);
  const tokenId = product?.variant?.token_id ?? null;

  const pay = first(router.query.pay)?.toLowerCase() ?? null;
  const sizeParam = first(router.query.size)?.toUpperCase() ?? null;
  const preselectedSize: SwagSize | null =
    product?.sized && sizeParam && (SIZES as readonly string[]).includes(sizeParam) && product.sizes.includes(sizeParam as SwagSize)
      ? (sizeParam as SwagSize)
      : null;
  const utm = useMemo(() => utmFromQuery(router.query), [router.query]);

  // `?pay=` acts once per page load. A sized design with no valid size cannot
  // be paid for from a link: the card opens with the size picker flagged.
  const handledPay = useRef(false);
  useEffect(() => {
    if (handledPay.current || !router.isReady || !product) return;
    if (pay !== 'usdc' && pay !== 'card') return;

    const size = product.sized ? preselectedSize : null;
    if (product.sized && !size) {
      handledPay.current = true;
      return;
    }

    if (pay === 'card') {
      handledPay.current = true;
      const variant = shopifyVariantFor(product, size);
      if (variant) window.location.assign(withUtm(shopifyCartUrl(variant, 1), utm));
      return;
    }

    if (tokenId === null) {
      handledPay.current = true;
      return;
    }
    // Wait for the chain so the modal opens with a price, not a dash.
    if (onchain.tokens[tokenId] === undefined && !onchain.error) return;
    handledPay.current = true;
    setCheckout({ product, tokenId, size });
  }, [router.isReady, product, pay, preselectedSize, tokenId, onchain.tokens, onchain.error, utm]);

  const closeCheckout = () => {
    setCheckout(null);
    // Drop ?pay= so a reload does not reopen the sheet the buyer just closed.
    if (router.query.pay !== undefined) {
      const rest = Object.fromEntries(Object.entries(router.query).filter(([key]) => key !== 'pay'));
      void router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  };

  // Head: the ISR snapshot first (what a crawler sees), the live row once loaded.
  const headName = product ? (es ? product.name_es : product.name_en) : meta ? (es ? meta.name_es : meta.name_en) : null;
  const headDescription = product
    ? es ? product.description_es : product.description_en
    : meta
      ? es ? meta.description_es : meta.description_en
      : null;
  const headSku = (product?.sku ?? meta?.sku ?? skuParam ?? '').toLowerCase();
  const ogImage = productOgImageUrl(product ?? meta ?? { image_path: null });
  const canonical = headSku ? `${SWAG_SITE_ORIGIN}/swag/${headSku}` : `${SWAG_SITE_ORIGIN}/swag`;
  const title = headName ? `${headName} — Swag ETH Cali` : 'Swag — ETH Cali';
  const description =
    headDescription ??
    (es
      ? 'Merch oficial de ETH Cali. Paga con tarjeta o con USDC en Base.'
      : 'Official ETH Cali merch. Pay with card or with USDC on Base.');

  const notFound = router.isReady && !catalogue.isLoading && !catalogue.error && !product;

  return (
    <div className="min-h-screen bg-surface-void">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:url" property="og:url" content={canonical} />
        <meta key="og:title" property="og:title" content={title} />
        <meta key="og:description" property="og:description" content={description} />
        {ogImage && <meta key="og:image" property="og:image" content={ogImage} />}
        <meta key="twitter:card" property="twitter:card" content="summary_large_image" />
        <meta key="twitter:url" property="twitter:url" content={canonical} />
        <meta key="twitter:title" property="twitter:title" content={title} />
        <meta key="twitter:description" property="twitter:description" content={description} />
        {ogImage && <meta key="twitter:image" property="twitter:image" content={ogImage} />}
      </Head>
      <Navigation />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/swag"
            className="inline-flex min-h-tap items-center text-sm font-semibold text-content-secondary transition-colors hover:text-eth-blue-text"
          >
            ← {es ? 'Todo el swag' : 'All swag'}
          </Link>
          <Link
            href="/swag/orders"
            className="inline-flex min-h-tap items-center justify-center rounded-control border border-line-strong px-5 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
          >
            {es ? 'Mi swag' : 'My swag'}
          </Link>
        </header>

        {onchain.paused && (
          <p className="mb-6 rounded-chip border border-line-hairline bg-surface-inset px-4 py-3 text-sm text-content-secondary">
            {es
              ? 'Las compras con USDC están en pausa. El pago con tarjeta sigue abierto.'
              : 'USDC purchases are paused right now. Card checkout stays open.'}
          </p>
        )}

        {!router.isReady || catalogue.isLoading ? (
          <div className="py-16">
            <Loading size="medium" text={es ? 'Cargando producto…' : 'Loading product…'} />
          </div>
        ) : catalogue.error ? (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-10 text-center">
            <p className="font-semibold text-content-primary">
              {es ? 'No pudimos cargar el catálogo.' : 'The catalogue could not be loaded.'}
            </p>
            <p className="mt-2 text-sm text-content-muted">{catalogue.error}</p>
            <button
              type="button"
              onClick={() => catalogue.refetch()}
              className="mt-5 inline-flex min-h-tap items-center rounded-control border border-line-strong px-5 text-sm font-semibold text-content-primary hover:border-line-brand hover:text-eth-blue-text"
            >
              {es ? 'Reintentar' : 'Try again'}
            </button>
          </div>
        ) : notFound || !product ? (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-content-faint">{skuParam}</p>
            <p className="mt-2 font-semibold text-content-primary">
              {es ? 'Este diseño no está a la venta.' : 'This design is not on sale.'}
            </p>
            <p className="mt-2 text-sm text-content-muted">
              {es
                ? 'Puede que el enlace sea viejo o que el diseño se haya retirado.'
                : 'The link may be old, or the design was taken off the shelf.'}
            </p>
            <Link
              href="/swag"
              className="mt-5 inline-flex min-h-tap items-center justify-center rounded-control bg-eth-blue px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
            >
              {es ? 'Ver todo el swag' : 'See all swag'}
            </Link>
          </div>
        ) : (
          <SwagCard
            key={product.id}
            product={product}
            expanded
            onchain={tokenId !== null ? onchain.tokens[tokenId] : undefined}
            paused={onchain.paused}
            trm={rate}
            locale={locale}
            utm={utm}
            initialSize={preselectedSize}
            promptSize={Boolean(pay) && product.sized && !preselectedSize}
            onPayWithUsdc={(p, id, size) => setCheckout({ product: p, tokenId: id, size })}
          />
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
          onClose={closeCheckout}
        />
      )}
    </div>
  );
}

// ── ISR: the Head a crawler sees ─────────────────────────────────────────────
// Read with the anon key like the grid; unknown or inactive SKUs render the
// page's own not-found state (a 200 with a way back, refreshed every minute).

// Every active design is prerendered at build under its lowercase SKU — the
// canonical URL the site and the grid link to. fallback: false on purpose: an
// on-demand render of a page that imports Privy answered 500 on Vercel's
// runtime (Privy loaded as an external ES module tripped over
// styled-components' CommonJS exports), and a prerendered page never touches
// that path. Uppercase or mixed-case requests are lowercased by proxy.ts at
// the edge. Adding a design therefore needs a redeploy, which the catalogue
// sync already implies.
export const getStaticPaths: GetStaticPaths = async () => {
  if (!supabase) return { paths: [], fallback: false };
  const { data } = await supabase.from('swag_products').select('sku').eq('active', true);
  const paths = ((data ?? []) as Array<{ sku: string }>).map((row) => ({
    params: { sku: row.sku.toLowerCase() },
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<ProductPageProps> = async ({ params }) => {
  const sku = String(params?.sku ?? '').toLowerCase();
  if (!supabase || !sku) return { props: { meta: null }, revalidate: 60 };

  // Case-insensitive match done here rather than with ilike: a URL segment is
  // user input and `_`/`%` are wildcards in a LIKE pattern.
  const { data } = await supabase.from('swag_products').select(META_SELECT).eq('active', true);
  const meta = ((data ?? []) as ProductMeta[]).find((row) => row.sku.toLowerCase() === sku) ?? null;

  return { props: { meta }, revalidate: 60 };
};

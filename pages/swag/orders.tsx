import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import Navigation from '../../components/Navigation';
import Loading from '../../components/shared/Loading';
import { HashChip } from '../../components/swag/HashChip';
import {
  productAltName,
  productImageUrl,
  productName,
  useMySwag,
  useSwagCatalogue,
  useSwagLocale,
} from '../../hooks/swag';
import type { SwagOrder, SwagOrderStatus } from '../../types/swag';

const STATUS_LABEL: Record<SwagOrderStatus, { es: string; en: string; className: string }> = {
  paid: { es: 'Pagado', en: 'Paid', className: 'bg-signal-pending/15 text-signal-pending' },
  shipped: { es: 'Enviado', en: 'Shipped', className: 'bg-eth-blue-wash text-eth-blue-text' },
  delivered: { es: 'Entregado', en: 'Delivered', className: 'bg-signal-confirmed/15 text-signal-confirmed' },
  cancelled: { es: 'Cancelado', en: 'Cancelled', className: 'bg-signal-reverted/15 text-signal-reverted' },
};

const CHANNEL_LABEL = {
  onchain: { es: 'USDC', en: 'USDC' },
  shopify: { es: 'Tarjeta', en: 'Card' },
  event: { es: 'Evento', en: 'Event' },
} as const;

const PRIMARY =
  'inline-flex min-h-tap items-center justify-center rounded-control bg-eth-blue px-6 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift';

function OrderRow({ order }: { order: SwagOrder }) {
  const locale = useSwagLocale();
  const { products } = useSwagCatalogue();
  const product = products.find((p) => p.sku === order.product.sku) ?? null;
  const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.paid;
  const image = product ? productImageUrl(product) : null;
  const tokenId = order.tokenId;

  return (
    <li className="flex gap-3 p-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-chip bg-surface-inset">
        {image && <Image src={image} alt="" fill className="object-cover" sizes="64px" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold text-content-primary" title={product ? productAltName(product, locale) : undefined}>
            {product ? productName(product, locale) : locale === 'es' ? order.product.nameEs : order.product.nameEn}
          </p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
            {status[locale]}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-content-muted">
          {CHANNEL_LABEL[order.channel][locale]}
          {order.size && ` · ${order.size}`}
          {order.quantity > 1 && ` · ×${order.quantity}`}
          {` · #${tokenId}`}
        </p>
        <p className="mt-1 text-xs text-content-faint">
          {new Date(order.createdAt).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        {order.txHash && (
          <p className="mt-2 text-xs text-content-muted">
            {locale === 'es' ? 'Compra' : 'Purchase'} <HashChip hash={order.txHash} />
          </p>
        )}
        {order.claimTxHash && (
          <p className="mt-1 text-xs text-content-muted">
            {locale === 'es' ? 'Reclamo' : 'Claim'} <HashChip hash={order.claimTxHash} />
          </p>
        )}
        {order.claimable && (
          <Link href="/swag/claim" className="mt-1 inline-flex min-h-[44px] items-center text-sm font-semibold text-eth-blue-text hover:underline">
            {locale === 'es' ? 'Reclamar el NFT' : 'Claim the NFT'}
          </Link>
        )}
      </div>
    </li>
  );
}

/**
 * Signed in: what this wallet holds from the collection (from the chain) and
 * this account's orders with their fulfilment status (from the API).
 */
export default function SwagOrdersPage() {
  const locale = useSwagLocale();
  const { ready, authenticated, login } = usePrivy();
  const mine = useMySwag();

  const title = locale === 'es' ? 'Mi swag' : 'My swag';

  return (
    <div className="min-h-screen bg-surface-void">
      <Head>
        <title>{title} — ETH Cali</title>
      </Head>
      <Navigation />

      <main className="mx-auto w-full max-w-4xl px-4 pb-8 pt-5 md:px-6 md:py-8">
        <header className="mb-5 flex items-start justify-between gap-4 md:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-content-primary md:text-3xl">{title}</h1>
            <p className="mb-0 mt-1 text-sm text-content-muted">
              {locale === 'es'
                ? 'Tus NFTs de la colección y el estado de envío de cada pedido.'
                : 'Your NFTs from the collection and the shipping status of each order.'}
            </p>
          </div>
          <Link
            href="/swag"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-control border border-line-strong px-4 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
          >
            {locale === 'es' ? 'Tienda' : 'Store'}
          </Link>
        </header>

        {!ready ? (
          <Loading size="medium" />
        ) : !authenticated ? (
          <div className="rounded-card border border-line-hairline bg-surface-slab px-5 py-8 text-center">
            <p className="font-semibold text-content-primary">
              {locale === 'es' ? 'Inicia sesión para ver tu swag.' : 'Sign in to see your swag.'}
            </p>
            <p className="mt-2 text-sm text-content-muted">
              {locale === 'es'
                ? 'Los NFTs se leen de tu billetera; los pedidos, de tu cuenta.'
                : 'NFTs are read from your wallet; orders from your account.'}
            </p>
            <button type="button" onClick={login} className={`${PRIMARY} mt-5`}>
              {locale === 'es' ? 'Iniciar sesión' : 'Sign in'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-content-primary">
                {locale === 'es' ? 'Mis NFTs' : 'My NFTs'}
              </h2>
              {mine.isLoading ? (
                <Loading size="small" />
              ) : mine.owned.length === 0 ? (
                <p className="mb-0 rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-content-muted">
                  {locale === 'es'
                    ? 'Esta billetera aún no tiene nada de la colección.'
                    : 'This wallet does not hold anything from the collection yet.'}
                  {mine.address && (
                    <>
                      {' '}
                      <HashChip hash={mine.address} kind="address" />
                    </>
                  )}
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {mine.owned.map(({ product, tokenId, balance }) => {
                    const image = productImageUrl(product);
                    return (
                      <li key={tokenId} className="overflow-hidden rounded-card border border-line-hairline bg-surface-slab">
                        <div className="relative aspect-square bg-surface-inset">
                          {image && (
                            <Image src={image} alt="" fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="truncate text-sm font-semibold text-content-primary" title={productAltName(product, locale)}>
                            {productName(product, locale)}
                          </p>
                          <p className="mt-1 font-mono text-xs text-content-muted">
                            #{tokenId}
                            {balance > 1 && ` · ×${balance}`}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-content-primary">
                {locale === 'es' ? 'Mis pedidos' : 'My orders'}
              </h2>
              {mine.isLoading ? (
                <Loading size="small" />
              ) : !mine.ordersAvailable ? (
                <p className="mb-0 rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-content-muted">
                  {locale === 'es'
                    ? 'El historial de pedidos aún no está disponible. Tus NFTs arriba son la prueba de compra.'
                    : 'Order history is not available yet. Your NFTs above are the proof of purchase.'}
                </p>
              ) : mine.orders.length === 0 ? (
                <p className="mb-0 rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-content-muted">
                  {locale === 'es' ? 'Todavía no hay pedidos.' : 'No orders yet.'}
                </p>
              ) : (
                <ul className="divide-y divide-line-hairline rounded-card border border-line-hairline bg-surface-slab">
                  {mine.orders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </ul>
              )}
            </section>

            {mine.error && (
              <p role="alert" className="rounded-chip border border-signal-reverted/30 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
                {mine.error}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * The order desk: every order through every channel, with what the warehouse
 * needs and the moves an operator can make on a row. FULFILLMENT_ROLE sees
 * start production, shipped and delivered; cancelling and the voucher cancel
 * are ADMIN_ROLE only (the API and the contract refuse them otherwise).
 *
 * Status changes are database writes and go through PATCH; the trigger there
 * decides which moves are legal and its refusal is shown verbatim. The one
 * onchain action on this tab is "Cancel voucher on chain": cancelOrder(orderRef)
 * from the admin's own wallet, for a refunded order whose voucher was issued
 * and never redeemed. After the receipt the hash is written to notes so the
 * row leaves the queue.
 *
 * Each row owns its own pending flags — three for the PATCHes, two inside its
 * useSwagAdminTx — so a slow request on one order never greys out another.
 */
import { useEffect, useState } from 'react';
import { encodeFunctionData } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { usePatchSwagOrder, useSwagAdminOrders, useSwagAdminTx, type AdminOrderFilters } from '../../hooks/swag';
import {
  NOTE_VOUCHER_CANCELLED_TX,
  type SwagAdminOrderView,
  type SwagOrderChannel,
  type SwagOrderStatus,
} from '../../types/swag-orders';
import { ChevronDownIcon } from '../shared/icons';
import { HashChip } from './HashChip';
import { CARD, FIELD, LABEL, Pill, Spinner, TxButton, buttonClass, ChainGate } from './AdminPrimitives';

const STATUS_TONE: Record<SwagOrderStatus, { label: string; tone: 'pending' | 'brand' | 'confirmed' | 'reverted' }> = {
  awaiting_shipping_payment: { label: 'Shipping unpaid', tone: 'pending' },
  paid: { label: 'Paid', tone: 'pending' },
  in_production: { label: 'In production', tone: 'pending' },
  shipped: { label: 'Shipped', tone: 'brand' },
  delivered: { label: 'Delivered', tone: 'confirmed' },
  cancelled: { label: 'Cancelled', tone: 'reverted' },
};

const CHANNEL_LABEL: Record<SwagOrderChannel, string> = {
  onchain: 'USDC',
  shopify: 'Card',
  event: 'Event',
};

function appendLine(existing: string | null, line: string): string {
  if (!existing) return line;
  return existing.includes(line) ? existing : `${existing}\n${line}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatAmount(amount: number, currency: 'USDC' | 'COP'): string {
  return currency === 'COP'
    ? `COP ${Math.round(amount).toLocaleString('es-CO')}`
    : `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

/** What was charged and when the order moved. Copied from the payment of record by the server. */
function LedgerBlock({ order }: { order: SwagAdminOrderView }) {
  const { item, shipping, shippingDue } = order.payment;
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 border-t border-line-hairline pt-3 text-sm sm:grid-cols-2">
      <dl className="space-y-1">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Charged</dt>
        <dd className="flex justify-between gap-2">
          <span className="text-content-muted">Item</span>
          <span className="font-mono text-content-primary">{item ? formatAmount(item.amount, item.currency) : '—'}</span>
        </dd>
        <dd className="flex justify-between gap-2">
          <span className="text-content-muted">Shipping{shipping?.zone ? ` · ${shipping.zone}` : shippingDue ? ` · ${shippingDue.zone}` : ''}</span>
          <span className="font-mono text-content-primary">
            {shipping ? formatAmount(shipping.amount, shipping.currency) : shippingDue ? <span className="text-signal-pending">{formatAmount(shippingDue.amount, 'USDC')} due</span> : order.channel === 'shopify' ? 'on the first line' : '—'}
          </span>
        </dd>
        {shipping?.txHash && (
          <dd className="flex items-center justify-between gap-2 text-xs">
            <span className="text-content-muted">Shipping transfer</span>
            <HashChip hash={shipping.txHash} />
          </dd>
        )}
      </dl>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Timeline</p>
        {order.timeline.length === 0 ? (
          <p className="mt-1 text-xs text-content-faint">No status history recorded.</p>
        ) : (
          <ol className="mt-1 space-y-1">
            {order.timeline.map((e, i) => (
              <li key={`${e.status}-${i}`} className="flex justify-between gap-2 text-xs">
                <span className="text-content-secondary">{STATUS_TONE[e.status]?.label ?? e.status}</span>
                <span className="font-mono text-content-muted">{formatDate(e.at)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ShippingBlock({ order }: { order: SwagAdminOrderView }) {
  const s = order.shipping;
  const rows: Array<[string, string | undefined]> = [
    ['Name', s.name],
    ['Phone', s.phone],
    ['Cédula / NIT', s.document],
    ['Address', [s.address1, s.address2].filter(Boolean).join(', ')],
    ['City', [s.city, s.region].filter(Boolean).join(', ')],
    ['Country', s.country],
    ['Buyer notes', s.notes],
    ['Tracking', s.tracking],
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">{label}</dt>
          <dd className={`break-words ${value ? 'text-content-primary' : 'text-content-faint'}`}>{value || '—'}</dd>
        </div>
      ))}
      {order.notes && (
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Operator notes</dt>
          <dd className="whitespace-pre-wrap break-words font-mono text-xs text-content-secondary">{order.notes}</dd>
        </div>
      )}
      {order.shopifyOrderId && (
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Shopify order</dt>
          <dd className="break-all font-mono text-xs text-content-secondary">{order.shopifyOrderId}</dd>
        </div>
      )}
    </dl>
  );
}

function OrderRow({ order, canAdmin }: { order: SwagAdminOrderView; canAdmin: boolean }) {
  const patch = usePatchSwagOrder();
  const voucherTx = useSwagAdminTx();

  const [expanded, setExpanded] = useState(false);
  const [askTracking, setAskTracking] = useState(false);
  const [tracking, setTracking] = useState(order.shipping.tracking ?? '');
  // One flag per action. A shared flag would relabel the wrong button.
  const [producing, setProducing] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (
    setFlag: (v: boolean) => void,
    body: Parameters<typeof patch.mutateAsync>[0]
  ) => {
    setFlag(true);
    setError(null);
    try {
      await patch.mutateAsync(body);
      setAskTracking(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The update failed.');
    } finally {
      setFlag(false);
    }
  };

  const cancelVoucher = async () => {
    const data = encodeFunctionData({ abi: swag1155Abi, functionName: 'cancelOrder', args: [order.orderRef] });
    const hash = await voucherTx.run(data, { invalidate: [['swag-admin-orders']] });
    if (!hash) return;
    setRecording(true);
    setError(null);
    try {
      await patch.mutateAsync({ id: order.id, notes: appendLine(order.notes, `${NOTE_VOUCHER_CANCELLED_TX}${hash}`) });
    } catch (e) {
      setError(`Voucher cancelled on chain (${hash.slice(0, 10)}…) but the note was not saved: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setRecording(false);
    }
  };

  const status = STATUS_TONE[order.status];
  const busy = producing || shipping || delivering || cancelling;
  const open = order.status === 'paid' || order.status === 'in_production';
  const showVoucher = canAdmin && order.voucherNeedsCancel;
  const awaiting = order.status === 'awaiting_shipping_payment';

  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-content-primary" title={order.product.nameEs}>
            <span className="mr-2 font-mono text-xs text-content-faint">#{order.id}</span>
            {order.product.nameEn}
          </p>
          <p className="mt-1 font-mono text-xs text-content-muted">
            {order.product.sku}
            {order.size && ` · ${order.size}`}
            {` · ×${order.quantity}`}
            {` · token ${order.tokenId}`}
            {` · ${CHANNEL_LABEL[order.channel]}`}
          </p>
        </div>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-muted">
        <span>{formatDate(order.createdAt)}</span>
        {order.buyer.wallet && (
          <span className="inline-flex items-center gap-1">
            Buyer <HashChip hash={order.buyer.wallet} kind="address" />
          </span>
        )}
        {order.buyer.email && <span className="break-all">Buyer {order.buyer.email}</span>}
        {order.txHash && (
          <span className="inline-flex items-center gap-1">
            Purchase <HashChip hash={order.txHash} />
          </span>
        )}
        {order.claimTxHash && (
          <span className="inline-flex items-center gap-1">
            Claim <HashChip hash={order.claimTxHash} />
          </span>
        )}
        {order.voucherIssued && !order.claimTxHash && <Pill tone="muted">Voucher issued</Pill>}
        {order.voucherNeedsCancel && <Pill tone="pending">Voucher needs cancel</Pill>}
        {order.voucherCancelledTx && (
          <span className="inline-flex items-center gap-1">
            Voucher cancelled <HashChip hash={order.voucherCancelledTx} />
          </span>
        )}
        {order.shipping.tracking && <span className="font-mono">Tracking {order.shipping.tracking}</span>}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-eth-blue-text hover:underline"
        aria-expanded={expanded}
      >
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Hide details' : 'Address, payment and timeline'}
      </button>

      {expanded && (
        <div className="mt-3 rounded-chip border border-line-hairline bg-surface-inset/50 p-3">
          <ShippingBlock order={order} />
          <LedgerBlock order={order} />
        </div>
      )}

      {(open || order.status === 'shipped' || showVoucher || (canAdmin && awaiting)) && (
        <div className="mt-4 space-y-3 border-t border-line-hairline pt-4">
          {askTracking && (
            <label className="block max-w-md">
              <span className={LABEL}>Tracking reference (optional)</span>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Carrier and number"
                className={FIELD}
                disabled={shipping}
                maxLength={120}
              />
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            {order.status === 'paid' && !askTracking && (
              <button
                type="button"
                onClick={() => void act(setProducing, { id: order.id, status: 'in_production' })}
                disabled={busy}
                className={buttonClass('primary')}
              >
                {producing && <Spinner />}
                {producing ? 'Starting…' : 'Start production'}
              </button>
            )}
            {open && !askTracking && (
              <button type="button" onClick={() => setAskTracking(true)} disabled={busy} className={buttonClass(order.status === 'paid' ? 'secondary' : 'primary')}>
                Mark shipped
              </button>
            )}
            {open && askTracking && (
              <>
                <button
                  type="button"
                  onClick={() => void act(setShipping, { id: order.id, status: 'shipped', tracking: tracking.trim() })}
                  disabled={busy}
                  className={buttonClass('primary')}
                >
                  {shipping && <Spinner />}
                  {shipping ? 'Marking shipped…' : 'Confirm shipped'}
                </button>
                <button type="button" onClick={() => setAskTracking(false)} disabled={shipping} className={buttonClass('secondary')}>
                  Back
                </button>
              </>
            )}
            {order.status === 'shipped' && (
              <button
                type="button"
                onClick={() => void act(setDelivering, { id: order.id, status: 'delivered' })}
                disabled={busy}
                className={buttonClass('primary')}
              >
                {delivering && <Spinner />}
                {delivering ? 'Marking delivered…' : 'Mark delivered'}
              </button>
            )}
            {canAdmin && (open || awaiting || order.status === 'shipped') && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Cancel order #${order.id}? The refund itself happens in Shopify or by hand; this only closes the fulfilment record.`)) {
                    void act(setCancelling, { id: order.id, status: 'cancelled' });
                  }
                }}
                disabled={busy}
                className={buttonClass('secondary')}
              >
                {cancelling && <Spinner />}
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </button>
            )}
          </div>

          {showVoucher && (
            <div className="rounded-chip border border-signal-pending/40 bg-signal-pending/10 p-3">
              <p className="mb-2 text-xs text-content-secondary">
                This order was refunded after a voucher was issued. Until <span className="font-mono">cancelOrder</span> runs on
                chain the buyer could still mint it.
              </p>
              <TxButton
                label="Cancel voucher on chain"
                pendingLabel={recording ? 'Saving note…' : 'Cancelling voucher…'}
                tx={voucherTx}
                onClick={cancelVoucher}
                reason={recording ? 'Saving the note.' : null}
              />
            </div>
          )}

          {error && <p className="text-xs text-signal-reverted">{error}</p>}
        </div>
      )}
    </li>
  );
}

const SELECT = `${FIELD} appearance-none`;

export function AdminOrders({ canAdmin }: { canAdmin: boolean }) {
  const [filters, setFilters] = useState<AdminOrderFilters>({ status: '', channel: '', q: '' });
  const [qInput, setQInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === qInput ? f : { ...f, q: qInput })), 300);
    return () => clearTimeout(t);
  }, [qInput]);

  const query = useSwagAdminOrders(filters);
  const orders = query.data?.pages.flatMap((p) => p.orders) ?? [];

  return (
    <div className="space-y-4">
      <ChainGate />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={LABEL}>Status</span>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as AdminOrderFilters['status'] }))} className={SELECT}>
            <option value="">All</option>
            <option value="awaiting_shipping_payment">Shipping unpaid</option>
            <option value="paid">Paid</option>
            <option value="in_production">In production</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>Channel</span>
          <select value={filters.channel} onChange={(e) => setFilters((f) => ({ ...f, channel: e.target.value as AdminOrderFilters['channel'] }))} className={SELECT}>
            <option value="">All</option>
            <option value="onchain">USDC</option>
            <option value="shopify">Card</option>
            <option value="event">Event</option>
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>Search</span>
          <input type="search" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="SKU, email or wallet" className={FIELD} spellCheck={false} />
        </label>
      </div>

      {query.isLoading && <p className="text-sm text-content-faint">Loading orders…</p>}
      {query.error && <p className="text-sm text-signal-reverted">{query.error.message}</p>}
      {!query.isLoading && !query.error && orders.length === 0 && (
        <div className={`${CARD} text-center`}>
          <p className="text-sm text-content-muted">No orders match.</p>
        </div>
      )}

      <ul className="space-y-3">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} canAdmin={canAdmin} />
        ))}
      </ul>

      {query.hasNextPage && (
        <button type="button" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage} className={buttonClass('secondary', 'w-full')}>
          {query.isFetchingNextPage && <Spinner />}
          {query.isFetchingNextPage ? 'Loading…' : 'Load older orders'}
        </button>
      )}
    </div>
  );
}

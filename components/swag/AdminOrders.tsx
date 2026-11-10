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
 *
 * Filters live in the URL (?status=&channel=&attention=&q=), so a tile on the
 * summary or the overview opens exactly the list behind its number. Rows in
 * the same stage can be selected and moved together (POST …/orders/bulk);
 * the reply is per order, so one refused move never hides the others.
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { encodeFunctionData } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { useBulkSwagOrders, usePatchSwagOrder, useSwagAdminOrders, useSwagAdminTx, type AdminOrderFilters } from '../../hooks/swag';
import {
  NOTE_VOUCHER_CANCELLED_TX,
  SWAG_ATTENTION,
  type SwagAdminBulkBody,
  type SwagAdminOrderView,
  type SwagAttention,
  type SwagOrderChannel,
  type SwagOrderStatus,
} from '../../types/swag-orders';
import { ATTENTION_COPY } from './AdminAttention';
import { ChevronDownIcon } from '../shared/icons';
import { HashChip } from '../shared/HashChip';
import { CARD, FIELD, LABEL, Pill, Spinner, TxButton, buttonClass, ChainGate, ConfirmDialog, useToast } from '../admin/primitives';

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

/** The stage a row is in, for bulk moves: rows move together only from the same stage. */
type Stage = 'paid' | 'in_production' | 'shipped';
const stageOf = (o: SwagAdminOrderView): Stage | null =>
  o.status === 'paid' || o.status === 'in_production' || o.status === 'shipped' ? o.status : null;

/** Name and place, and the tracking with its link, without opening the row. */
function Recipient({ order }: { order: SwagAdminOrderView }) {
  const s = order.shipping;
  const t = order.trackingDetail;
  const place = [s.city, s.country].filter(Boolean).join(', ');
  const missingId = (s.country ?? '').toUpperCase() === 'CO' && !s.document;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="text-content-secondary">{[s.name, place].filter(Boolean).join(' · ') || 'No address yet'}</span>
      {missingId && <Pill tone="muted">No cédula</Pill>}
      {t?.number && (
        <span className="font-mono text-xs text-content-muted">
          {t.company && `${t.company} `}
          {t.url ? (
            <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-eth-blue-text hover:underline">
              {t.number}
            </a>
          ) : (
            t.number
          )}
        </span>
      )}
    </div>
  );
}

interface OrderRowProps {
  order: SwagAdminOrderView;
  canAdmin: boolean;
  selected: boolean;
  onToggle: (() => void) | null;
}

function OrderRow({ order, canAdmin, selected, onToggle }: OrderRowProps) {
  const patch = usePatchSwagOrder();
  const voucherTx = useSwagAdminTx();
  const toast = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);

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
      if (body.status) toast(`#${order.id} ${STATUS_TONE[body.status].label.toLowerCase()}.`);
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
    <li className={`${CARD} ${selected ? 'border-line-brand' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        {onToggle && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={`Select order #${order.id}`}
            className="mt-1 h-5 w-5 shrink-0 accent-eth-blue"
          />
        )}
        <div className="min-w-0 flex-1">
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
          <Recipient order={order} />
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
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-eth-blue-text hover:underline"
        aria-expanded={expanded}
      >
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Hide details' : 'Full address, payment and timeline'}
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
                onClick={() => setConfirmCancel(true)}
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
              {/* The one onchain action on this tab, so the network check lives here and nowhere else. */}
              <div className="mb-2">
                <ChainGate />
              </div>
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

      {confirmCancel && (
        <ConfirmDialog
          title={`Cancel order #${order.id}?`}
          body={
            <>
              This closes the fulfilment record only. The refund itself happens in Shopify, or by hand for a USDC order.
              {order.voucherIssued && !order.claimTxHash && ' A claim voucher is live, so the order joins the on-chain cancel queue.'}
            </>
          }
          confirmLabel="Cancel order"
          pendingLabel="Cancelling…"
          danger
          onConfirm={async () => {
            setCancelling(true);
            try {
              await patch.mutateAsync({ id: order.id, status: 'cancelled' });
              toast(`#${order.id} cancelled.`);
            } finally {
              setCancelling(false);
            }
          }}
          onClose={() => setConfirmCancel(false)}
        />
      )}
    </li>
  );
}

const SELECT = `${FIELD} appearance-none`;

const STATUS_VALUES = Object.keys(STATUS_TONE) as SwagOrderStatus[];
const CHANNEL_VALUES = Object.keys(CHANNEL_LABEL) as SwagOrderChannel[];

/** ?status=&channel=&attention=&q= → filters, ignoring anything off the menu. */
function filtersFrom(query: Record<string, string | string[] | undefined>): AdminOrderFilters {
  const one = (k: string) => {
    const v = query[k];
    return (Array.isArray(v) ? v[0] : v) ?? '';
  };
  const pick = <T extends string>(k: string, allowed: readonly T[]): T | '' => {
    const v = one(k);
    return (allowed as readonly string[]).includes(v) ? (v as T) : '';
  };
  return {
    status: pick('status', STATUS_VALUES),
    channel: pick('channel', CHANNEL_VALUES),
    attention: pick<SwagAttention>('attention', SWAG_ATTENTION),
    q: one('q'),
  };
}

const MOVES: Record<Stage, Array<{ to: SwagAdminBulkBody['status']; label: string; pending: string }>> = {
  paid: [
    { to: 'in_production', label: 'Start production', pending: 'Starting…' },
    { to: 'shipped', label: 'Mark shipped', pending: 'Marking shipped…' },
  ],
  in_production: [{ to: 'shipped', label: 'Mark shipped', pending: 'Marking shipped…' }],
  shipped: [{ to: 'delivered', label: 'Mark delivered', pending: 'Marking delivered…' }],
};

/**
 * The selection's actions. Shipping first asks for a tracking reference per
 * parcel on one sheet, then sends them all in one request. Each action owns
 * its flag; the reply's refusals stay on screen beside their order numbers.
 */
function BulkBar({ selected, onDone, onClear }: { selected: SwagAdminOrderView[]; onDone: (moved: number[]) => void; onClear: () => void }) {
  const bulk = useBulkSwagOrders();
  const toast = useToast();
  const [pendingTo, setPendingTo] = useState<SwagAdminBulkBody['status'] | null>(null);
  const [sheet, setSheet] = useState(false);
  const [tracking, setTracking] = useState<Record<number, string>>({});
  const [failures, setFailures] = useState<Array<{ id: number; error: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const stages = new Set(selected.map(stageOf));
  const stage = stages.size === 1 ? [...stages][0] : null;
  const moves = stage ? MOVES[stage] : [];

  const run = async (to: SwagAdminBulkBody['status']) => {
    setPendingTo(to);
    setError(null);
    setFailures([]);
    try {
      const body: SwagAdminBulkBody = { ids: selected.map((o) => o.id), status: to };
      if (to === 'shipped') {
        body.tracking = Object.fromEntries(
          selected.map((o) => [String(o.id), (tracking[o.id] ?? '').trim()]).filter(([, v]) => v)
        );
      }
      const { results } = await bulk.mutateAsync(body);
      const failed = results.flatMap((r) => (r.ok ? [] : [{ id: r.id, error: r.error }]));
      setFailures(failed);
      if (failed.length === 0) setSheet(false);
      const moved = results.length - failed.length;
      if (moved > 0) toast(`${moved} order${moved === 1 ? '' : 's'} ${STATUS_TONE[to].label.toLowerCase()}.`);
      onDone(results.filter((r) => r.ok).map((r) => r.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The update failed.');
    } finally {
      setPendingTo(null);
    }
  };

  const busy = pendingTo !== null;

  return (
    <div className="sticky bottom-3 z-10 rounded-card border border-line-brand bg-surface-slab p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm font-semibold text-content-primary">
          {selected.length} selected
          {!stage && <span className="ml-2 font-normal text-content-faint">Select orders in the same stage to move them together.</span>}
        </p>
        {!sheet &&
          moves.map((m) =>
            m.to === 'shipped' ? (
              <button key={m.to} type="button" onClick={() => setSheet(true)} disabled={busy} className={buttonClass(stage === 'paid' ? 'secondary' : 'primary')}>
                {m.label}
              </button>
            ) : (
              <button key={m.to} type="button" onClick={() => void run(m.to)} disabled={busy} className={buttonClass('primary')}>
                {pendingTo === m.to && <Spinner />}
                {pendingTo === m.to ? m.pending : `${m.label} (${selected.length})`}
              </button>
            )
          )}
        <button type="button" onClick={onClear} disabled={busy} className={buttonClass('secondary')}>
          Clear
        </button>
      </div>

      {sheet && (
        <div className="mt-3 space-y-3 border-t border-line-hairline pt-3">
          <p className="text-xs text-content-muted">Tracking per parcel, optional. Leave a line empty to ship without one.</p>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {selected.map((o) => (
              <li key={o.id} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_16rem]">
                <span className="min-w-0 truncate text-sm text-content-secondary">
                  <span className="mr-2 font-mono text-xs text-content-faint">#{o.id}</span>
                  {o.shipping.name || o.buyer.email || o.product.nameEn}
                  {o.shipping.city && <span className="text-content-faint"> · {o.shipping.city}</span>}
                </span>
                <input
                  type="text"
                  value={tracking[o.id] ?? o.shipping.tracking ?? ''}
                  onChange={(e) => setTracking((t) => ({ ...t, [o.id]: e.target.value }))}
                  placeholder="Carrier and number"
                  aria-label={`Tracking for order #${o.id}`}
                  className={FIELD}
                  disabled={busy}
                  maxLength={120}
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void run('shipped')} disabled={busy} className={buttonClass('primary')}>
              {pendingTo === 'shipped' && <Spinner />}
              {pendingTo === 'shipped' ? 'Marking shipped…' : `Confirm ${selected.length} shipped`}
            </button>
            <button type="button" onClick={() => setSheet(false)} disabled={busy} className={buttonClass('secondary')}>
              Back
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-signal-reverted">{error}</p>}
      {failures.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-signal-reverted">
          {failures.map((f) => (
            <li key={f.id}>
              <span className="font-mono">#{f.id}</span> not moved: {f.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminOrders({ canAdmin }: { canAdmin: boolean }) {
  const router = useRouter();
  const filters = useMemo(() => filtersFrom(router.query), [router.query]);
  const [qInput, setQInput] = useState(filters.q);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  /** One filter changed: rewrite the URL, keep the tab, drop the selection. */
  const setFilter = (key: keyof AdminOrderFilters, value: string) => {
    const query: Record<string, string> = { tab: 'orders' };
    for (const [k, v] of Object.entries({ ...filters, [key]: value })) if (v) query[k] = v;
    setSelectedIds(new Set());
    void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  // A link (a summary tile, the overview) can change ?q= under the box.
  useEffect(() => setQInput(filters.q), [filters.q]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput.trim() !== filters.q) setFilter('q', qInput.trim());
    }, 300);
    return () => clearTimeout(t);
    // setFilter is rebuilt each render; the debounce only cares about the typed text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  const query = useSwagAdminOrders(filters);
  const orders = query.data?.pages.flatMap((p) => p.orders) ?? [];
  const selectable = orders.filter((o) => stageOf(o) !== null);
  const selected = orders.filter((o) => selectedIds.has(o.id));

  const toggle = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allSelected = selectable.length > 0 && selectable.every((o) => selectedIds.has(o.id));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={LABEL}>Status</span>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={SELECT}>
            <option value="">All</option>
            {STATUS_VALUES.map((v) => (
              <option key={v} value={v}>{STATUS_TONE[v].label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>Channel</span>
          <select value={filters.channel} onChange={(e) => setFilter('channel', e.target.value)} className={SELECT}>
            <option value="">All</option>
            {CHANNEL_VALUES.map((v) => (
              <option key={v} value={v}>{CHANNEL_LABEL[v]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>Search</span>
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="#order, name, city, email, wallet, SKU, tracking"
            className={FIELD}
            spellCheck={false}
          />
        </label>
      </div>

      {filters.attention && (
        <div className="flex flex-wrap items-center gap-2 rounded-chip border border-line-hairline bg-surface-inset/50 px-3 py-2 text-sm">
          <span className="text-content-muted">Showing</span>
          <span className="font-semibold text-content-primary">{ATTENTION_COPY[filters.attention].label}</span>
          <button type="button" onClick={() => setFilter('attention', '')} className="ml-auto min-h-[36px] text-xs font-semibold text-eth-blue-text hover:underline">
            Show all orders
          </button>
        </div>
      )}

      {selectable.length > 0 && (
        <label className="inline-flex min-h-[36px] items-center gap-2 text-sm text-content-secondary">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelectedIds(allSelected ? new Set() : new Set(selectable.map((o) => o.id)))}
            className="h-5 w-5 accent-eth-blue"
          />
          Select all {selectable.length} open on screen
        </label>
      )}

      {query.isLoading && <p className="text-sm text-content-faint">Loading orders…</p>}
      {query.error && <p className="text-sm text-signal-reverted">{query.error.message}</p>}
      {!query.isLoading && !query.error && orders.length === 0 && (
        <div className={`${CARD} text-center`}>
          <p className="text-sm text-content-muted">No orders match.</p>
        </div>
      )}

      <ul className="space-y-3">
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            canAdmin={canAdmin}
            selected={selectedIds.has(order.id)}
            onToggle={stageOf(order) ? () => toggle(order.id) : null}
          />
        ))}
      </ul>

      {query.hasNextPage && (
        <button type="button" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage} className={buttonClass('secondary', 'w-full')}>
          {query.isFetchingNextPage && <Spinner />}
          {query.isFetchingNextPage ? 'Loading…' : 'Load older orders'}
        </button>
      )}

      {selected.length > 0 && (
        <BulkBar
          selected={selected}
          onClear={() => setSelectedIds(new Set())}
          onDone={(moved) =>
            setSelectedIds((prev) => {
              const next = new Set(prev);
              moved.forEach((id) => next.delete(id));
              return next;
            })
          }
        />
      )}
    </div>
  );
}

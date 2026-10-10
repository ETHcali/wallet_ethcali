/**
 * This week's batch: what to print, what to pack, and the one button that
 * sends it to the press.
 *
 * The window comes from the server (lib/swag/batch.ts): orders paid before
 * Tuesday 12:00 Bogotá leave on Thursday. "Send to production" moves every
 * paid order in the window to in_production in one request — the server
 * picks the cutoff, so two people at the desk cannot start two batches.
 *
 * Printing goes through a portal at the end of <body>; globals.css hides
 * everything else on paper and prints the portal black on white.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useStartSwagBatch, useSwagAdminBatch } from '../../hooks/swag';
import { SWAG_SIZES, type SwagAdminOrderView } from '../../types/swag-orders';
import { CARD, Pill, Spinner, buttonClass } from '../admin/primitives';

const NO_SIZE = 'One size';
const SIZE_COLUMNS = [...SWAG_SIZES, NO_SIZE] as const;

interface SheetRow {
  sku: string;
  name: string;
  bySize: Record<string, number>;
  total: number;
}

/** Units per design × size, designs in SKU order. */
function printSheet(orders: SwagAdminOrderView[]): { rows: SheetRow[]; columns: string[]; total: number } {
  const bySku = new Map<string, SheetRow>();
  for (const o of orders) {
    const row = bySku.get(o.product.sku) ?? { sku: o.product.sku, name: o.product.nameEs, bySize: {}, total: 0 };
    const size = o.size ?? NO_SIZE;
    row.bySize[size] = (row.bySize[size] ?? 0) + o.quantity;
    row.total += o.quantity;
    bySku.set(o.product.sku, row);
  }
  const rows = Array.from(bySku.values()).sort((a, b) => a.sku.localeCompare(b.sku));
  const columns = SIZE_COLUMNS.filter((s) => rows.some((r) => r.bySize[s]));
  return { rows, columns, total: rows.reduce((n, r) => n + r.total, 0) };
}

function formatDay(isoDate: string): string {
  // A calendar date, not an instant: read it at noon UTC so no zone moves the day.
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

function formatCutoff(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });
}

/** Where a card buyer claims the NFT, with their checkout email filled in. */
function claimUrl(email: string): string {
  const origin = typeof window === 'undefined' ? 'https://app.ethcali.org' : window.location.origin;
  return `${origin}/swag/claim?email=${encodeURIComponent(email)}`;
}

function PrintableSheet({ orders, dispatchDate }: { orders: SwagAdminOrderView[]; dispatchDate: string }) {
  const sheet = printSheet(orders);
  return (
    <div>
      <h1 style={{ fontSize: '16pt', fontWeight: 700 }}>ETH Cali Swag — hoja de impresión</h1>
      <p className="muted">Despacho {formatDay(dispatchDate)} · {orders.length} pedidos · {sheet.total} unidades</p>
      <table style={{ marginTop: '12pt' }}>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Diseño</th>
            {sheet.columns.map((c) => <th key={c}>{c}</th>)}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sheet.rows.map((r) => (
            <tr key={r.sku}>
              <td className="mono">{r.sku}</td>
              <td>{r.name}</td>
              {sheet.columns.map((c) => <td key={c}>{r.bySize[c] ?? ''}</td>)}
              <td><strong>{r.total}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PackingSlip({ order }: { order: SwagAdminOrderView }) {
  const s = order.shipping;
  return (
    <div className="slip">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12pt' }}>
        <div>
          <p className="mono muted">Pedido #{order.id} · {new Date(order.createdAt).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}</p>
          <p style={{ fontSize: '14pt', fontWeight: 700, marginTop: '6pt' }}>{s.name || '—'}</p>
          <p>{[s.address1, s.address2].filter(Boolean).join(', ')}</p>
          <p>{[s.city, s.region, s.country].filter(Boolean).join(', ')}</p>
          {s.phone && <p>Tel. {s.phone}</p>}
          {s.notes && <p className="muted">Nota: {s.notes}</p>}
          <p style={{ marginTop: '8pt' }}>
            <strong>{order.product.nameEs}</strong> · <span className="mono">{order.product.sku}</span>
            {order.size && <> · Talla <strong>{order.size}</strong></>} · ×{order.quantity}
          </p>
        </div>
        {order.channel === 'shopify' && order.buyer.email && (
          <div style={{ textAlign: 'center', width: '120pt', flexShrink: 0 }}>
            <QRCodeSVG value={claimUrl(order.buyer.email)} size={96} />
            <p style={{ fontSize: '8pt', marginTop: '4pt' }}>Reclama tu coleccionable digital con el correo de tu compra</p>
          </div>
        )}
        {order.channel === 'onchain' && (
          <div style={{ width: '120pt', flexShrink: 0, fontSize: '8pt' }}>
            <p>Pagado en USDC. Tu coleccionable digital ya está en tu wallet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type PrintTarget = 'sheet' | 'slips' | null;

function PrintPortal({ target, orders, dispatchDate, onDone }: { target: PrintTarget; orders: SwagAdminOrderView[]; dispatchDate: string; onDone: () => void }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'swag-print-root';
    document.body.appendChild(el);
    setRoot(el);
    return () => {
      el.remove();
    };
  }, []);

  useEffect(() => {
    if (!target || !root) return;
    const done = () => onDone();
    window.addEventListener('afterprint', done, { once: true });
    // Let the portal paint before the print dialog snapshots the page.
    const t = window.setTimeout(() => window.print(), 50);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('afterprint', done);
    };
  }, [target, root, onDone]);

  if (!root || !target) return null;
  return createPortal(
    target === 'sheet' ? (
      <PrintableSheet orders={orders} dispatchDate={dispatchDate} />
    ) : (
      <div>
        {orders.map((o) => <PackingSlip key={o.id} order={o} />)}
      </div>
    ),
    root
  );
}

export function AdminBatch() {
  const query = useSwagAdminBatch();
  const start = useStartSwagBatch();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [printing, setPrinting] = useState<PrintTarget>(null);
  // Stable, so the print effect fires once per click and not on every render.
  const donePrinting = useCallback(() => setPrinting(null), []);

  const orders = useMemo(() => query.data?.orders ?? [], [query.data]);
  const paid = orders.filter((o) => o.status === 'paid');
  const producing = orders.filter((o) => o.status === 'in_production');
  const sheet = useMemo(() => printSheet(orders), [orders]);

  if (query.isLoading) return <p className="text-sm text-content-faint">Loading this week’s batch…</p>;
  if (query.error) return <p className="text-sm text-signal-reverted">{query.error.message}</p>;
  if (!query.data) return null;
  const { batch, later, truncated } = query.data;

  const sendToProduction = async () => {
    setStarting(true);
    setStartError(null);
    try {
      await start.mutateAsync();
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Could not start the batch.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className={CARD}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Dispatch</p>
            <h2 className="mt-1 text-lg font-bold capitalize text-content-primary">{formatDay(batch.dispatchDate)}</h2>
            <p className="mt-1 text-sm text-content-muted">
              {batch.phase === 'collecting'
                ? <>Orders paid before <span className="text-content-secondary">{formatCutoff(batch.cutoff)}</span> join this batch.</>
                : <>Cutoff passed ({formatCutoff(batch.cutoff)}). Print, pack, and book the pickup for Thursday before 11:00.</>}
            </p>
          </div>
          <Pill tone={batch.phase === 'collecting' ? 'brand' : 'pending'}>{batch.phase === 'collecting' ? 'Collecting' : 'On the press'}</Pill>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-chip border border-line-hairline bg-surface-inset/50 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Paid</dt>
            <dd className="mt-1 text-xl font-bold text-content-primary">{paid.length}</dd>
          </div>
          <div className="rounded-chip border border-line-hairline bg-surface-inset/50 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">In production</dt>
            <dd className="mt-1 text-xl font-bold text-content-primary">{producing.length}</dd>
          </div>
          <div className="rounded-chip border border-line-hairline bg-surface-inset/50 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Next week</dt>
            <dd className="mt-1 text-xl font-bold text-content-primary">{later}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => void sendToProduction()} disabled={starting || paid.length === 0} className={buttonClass('primary')}>
            {starting && <Spinner />}
            {starting ? 'Sending to production…' : paid.length === 0 ? 'Nothing new to produce' : `Send ${paid.length} paid order${paid.length === 1 ? '' : 's'} to production`}
          </button>
          <button type="button" onClick={() => setPrinting('sheet')} disabled={orders.length === 0 || printing !== null} className={buttonClass('secondary')}>
            Print sheet
          </button>
          <button type="button" onClick={() => setPrinting('slips')} disabled={orders.length === 0 || printing !== null} className={buttonClass('secondary')}>
            Print packing slips
          </button>
        </div>
        {startError && <p className="mt-2 text-xs text-signal-reverted">{startError}</p>}
        {truncated && <p className="mt-2 text-xs text-signal-pending">More orders than this view holds. Print from the Orders tab by status.</p>}
      </section>

      <section className={CARD}>
        <h2 className="font-semibold text-content-primary">Print sheet</h2>
        <p className="mt-1 text-sm text-content-muted">{sheet.total} unit{sheet.total === 1 ? '' : 's'} across {sheet.rows.length} design{sheet.rows.length === 1 ? '' : 's'}.</p>
        {sheet.rows.length === 0 ? (
          <p className="mt-4 text-sm text-content-faint">No open orders before the cutoff.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-line-hairline text-left text-[10px] uppercase tracking-wide text-content-faint">
                  <th className="py-2 pr-3 font-semibold">Design</th>
                  {sheet.columns.map((c) => <th key={c} className="px-2 py-2 text-center font-semibold">{c}</th>)}
                  <th className="py-2 pl-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {sheet.rows.map((r) => (
                  <tr key={r.sku} className="border-b border-line-hairline last:border-0">
                    <td className="py-2 pr-3">
                      <p className="text-content-primary">{r.name}</p>
                      <p className="font-mono text-[11px] text-content-faint">{r.sku}</p>
                    </td>
                    {sheet.columns.map((c) => (
                      <td key={c} className="px-2 py-2 text-center font-mono text-content-secondary">{r.bySize[c] ?? '·'}</td>
                    ))}
                    <td className="py-2 pl-2 text-right font-mono font-bold text-content-primary">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PrintPortal target={printing} orders={orders} dispatchDate={batch.dispatchDate} onDone={donePrinting} />
    </div>
  );
}

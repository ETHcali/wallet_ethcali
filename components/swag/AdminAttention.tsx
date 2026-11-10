/**
 * "What is waiting on me": one line per reason with a count, each a link to
 * the order list filtered to exactly those orders. The counts and the list
 * come from the same predicate (lib/swag/orders.ts › attentionOf), so a line
 * that says 3 opens 3 orders.
 */
import Link from 'next/link';
import { SWAG_ATTENTION, SWAG_STALE_DAYS, type SwagAdminSummary, type SwagAttention } from '../../types/swag-orders';
import { CARD } from './AdminPrimitives';

export const ATTENTION_COPY: Record<SwagAttention, { label: string; hint: string; adminOnly: boolean }> = {
  stale: {
    label: `Waiting over ${SWAG_STALE_DAYS} days`,
    hint: 'Paid but not shipped; past the batch it should have joined',
    adminOnly: false,
  },
  no_document: {
    label: 'No cédula / NIT',
    hint: 'Colombian address without an ID number; Envia cannot print the label',
    adminOnly: false,
  },
  mirror_failed: {
    label: 'Missing in Shopify',
    hint: 'USDC order whose Shopify copy failed; create it there by hand',
    adminOnly: false,
  },
  no_tracking: {
    label: 'Shipped without tracking',
    hint: 'The buyer has no way to follow the parcel',
    adminOnly: false,
  },
  shipping_unpaid: {
    label: 'Shipping unpaid',
    hint: 'USDC item paid, shipping transfer not yet; not printed until paid',
    adminOnly: false,
  },
  voucher_cancel: {
    label: 'Voucher to cancel on chain',
    hint: 'Refunded while a claim voucher is live; the buyer could still mint',
    adminOnly: true,
  },
};

export const attentionHref = (reason: SwagAttention) => `/swag/admin?tab=orders&attention=${reason}`;

export function AdminAttention({ data }: { data: SwagAdminSummary }) {
  const admin = data.viewer.role === 'admin';
  const open = SWAG_ATTENTION.filter((r) => (admin || !ATTENTION_COPY[r].adminOnly) && data.attention[r] > 0);

  if (open.length === 0) {
    return (
      <p className="rounded-card border border-line-hairline bg-surface-inset/50 p-4 text-sm text-content-muted">
        <span className="font-semibold text-content-secondary">Nothing waiting.</span> No order is stuck, missing an ID or untracked.
      </p>
    );
  }

  return (
    <section className={CARD} aria-labelledby="swag-attention">
      <h2 id="swag-attention" className="mb-2 text-sm font-semibold text-content-secondary">
        Needs attention
      </h2>
      <ul className="divide-y divide-line-hairline">
        {open.map((reason) => (
          <li key={reason}>
            <Link
              href={attentionHref(reason)}
              className="group flex min-h-tap items-center gap-3 py-2 text-sm"
            >
              <span className="inline-flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-full bg-surface-ridge px-2 font-mono text-xs font-bold text-content-primary">
                {data.attention[reason]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-content-primary group-hover:text-eth-blue-text">
                  {ATTENTION_COPY[reason].label}
                </span>
                <span className="block truncate text-xs text-content-faint" title={ATTENTION_COPY[reason].hint}>
                  {ATTENTION_COPY[reason].hint}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-eth-blue-text" aria-hidden>
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

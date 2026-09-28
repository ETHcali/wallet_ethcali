import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import AdminShell from '../../components/admin/AdminShell';
import Loading from '../../components/shared/Loading';
import { AdminBatch } from '../../components/swag/AdminBatch';
import { AdminCollection } from '../../components/swag/AdminCollection';
import { AdminOrders } from '../../components/swag/AdminOrders';
import { AdminShipping } from '../../components/swag/AdminShipping';
import { AdminStock } from '../../components/swag/AdminStock';
import { AdminTeam } from '../../components/swag/AdminTeam';
import { CARD, buttonClass } from '../../components/swag/AdminPrimitives';
import { HashChip } from '../../components/swag/HashChip';
import { SWAG, useSwagAdminSummary } from '../../hooks/swag';
import type { SwagAdminSummary } from '../../types/swag-orders';

type Tab = 'batch' | 'orders' | 'stock' | 'shipping' | 'collection' | 'team';

/** `admin: true` tabs need ADMIN_ROLE; the rest are open to FULFILLMENT_ROLE. */
const TABS: Array<{ id: Tab; label: string; admin: boolean }> = [
  { id: 'batch', label: 'This week', admin: false },
  { id: 'orders', label: 'Orders', admin: false },
  { id: 'stock', label: 'Stock', admin: true },
  { id: 'shipping', label: 'Shipping', admin: true },
  { id: 'collection', label: 'Collection', admin: true },
  { id: 'team', label: 'Team', admin: true },
];

const isTab = (v: unknown): v is Tab => TABS.some((t) => t.id === v);

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-content-primary">{value}</p>
      {hint && <p className="mt-1 truncate text-[11px] text-content-faint">{hint}</p>}
    </div>
  );
}

const usdc = (n: number) => `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
const copFmt = (n: number) => `COP ${Math.round(n).toLocaleString('es-CO')}`;

function Summary({ data }: { data: SwagAdminSummary }) {
  const queue = data.voucherCancelQueue.filter((q) => !q.closedOnChain).length;
  const admin = data.viewer.role === 'admin';
  const { USDC, COP } = data.revenue;
  return (
    <div className="space-y-3">
    {admin && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="USDC in" value={usdc(USDC.item + USDC.shipping)} hint={`${USDC.orders} orders · items ${usdc(USDC.item)} · shipping ${usdc(USDC.shipping)}`} />
        <StatTile label="Card in (COP)" value={copFmt(COP.item + COP.shipping)} hint={`${COP.orders} lines · items ${copFmt(COP.item)} · shipping ${copFmt(COP.shipping)}`} />
        <StatTile label="Shipping unpaid" value={String(data.shippingDue.orders)} hint={data.shippingDue.orders ? `${usdc(data.shippingDue.usdc)} owed; not printed until paid` : 'Every USDC order has paid shipping'} />
      </div>
    )}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="To produce" value={String(data.counts.byStatus.paid)} hint="Paid, not yet on the press" />
      <StatTile label="In production" value={String(data.counts.byStatus.in_production)} hint="Printing or packing" />
      <StatTile label="In transit" value={String(data.counts.byStatus.shipped)} hint="Shipped, not yet delivered" />
      {admin ? (
        <StatTile label="Vouchers to cancel" value={String(queue)} hint="Refunded with a live voucher" />
      ) : (
        <StatTile label="Store" value={data.collection.paused ? 'Paused' : 'Live'} hint={`${data.counts.total} orders in total`} />
      )}
    </div>
    </div>
  );
}

/**
 * The swag admin. Who gets in is decided by the summary route, which reads
 * ADMIN_ROLE and FULFILLMENT_ROLE on the collection across every wallet the
 * signed-in person has linked — so someone added by email, whose role sits on
 * their Privy embedded wallet, is recognised without connecting anything.
 * Every write below is still a transaction the contract checks or an API call
 * requireSwagStaff / requireSwagAdmin checks against the same contract.
 */
export default function SwagAdminPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const summary = useSwagAdminSummary();
  const viewer = summary.data?.viewer;
  const isAdmin = viewer?.role === 'admin';
  const tabs = TABS.filter((t) => !t.admin || isAdmin);

  const [tab, setTab] = useState<Tab>('batch');
  useEffect(() => {
    const q = router.query.tab;
    const wanted = Array.isArray(q) ? q[0] : q;
    if (isTab(wanted)) setTab(wanted);
  }, [router.query.tab]);
  const shown: Tab = tabs.some((t) => t.id === tab) ? tab : 'batch';

  const selectTab = (next: Tab) => {
    setTab(next);
    void router.replace({ pathname: router.pathname, query: next === 'batch' ? {} : { tab: next } }, undefined, { shallow: true });
  };

  let body: React.ReactNode;
  if (!ready || (authenticated && summary.isLoading)) {
    body = <Loading text="Reading roles from the collection…" />;
  } else if (!authenticated) {
    body = (
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
        <p className="text-sm text-content-muted">Sign in with the email or wallet you were added with.</p>
        <button type="button" onClick={login} className={buttonClass('primary')}>Sign in</button>
      </div>
    );
  } else if (!summary.data) {
    body = (
      <div className={CARD}>
        <p className="font-semibold text-content-primary">Not on the swag team</p>
        <p className="mt-2 text-sm text-content-muted">
          None of the wallets on this account holds ADMIN_ROLE or FULFILLMENT_ROLE on{' '}
          <HashChip hash={SWAG.address} kind="address" />. Ask the ops key holder to add you from the Team tab.
        </p>
        {summary.error && <p className="mt-2 text-xs text-content-faint">{summary.error.message}</p>}
      </div>
    );
  } else {
    body = (
      <div className="space-y-6">
        <Summary data={summary.data} />
        <div role="tablist" aria-label="Swag admin sections" className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={shown === t.id}
              onClick={() => selectTab(t.id)}
              className={`min-h-tap shrink-0 rounded-control border px-4 text-sm font-semibold transition-colors ${
                shown === t.id
                  ? 'border-eth-blue bg-eth-blue-wash text-eth-blue-text'
                  : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {shown === 'batch' && <AdminBatch />}
        {shown === 'orders' && <AdminOrders canAdmin={isAdmin} />}
        {shown === 'stock' && isAdmin && <AdminStock />}
        {shown === 'shipping' && isAdmin && <AdminShipping />}
        {shown === 'collection' && isAdmin && <AdminCollection />}
        {shown === 'team' && isAdmin && <AdminTeam />}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Swag admin — ETH Cali</title>
      </Head>
      <AdminShell
        active="swag"
        title="Swag"
        subtitle="Orders, caps and treasury for the collection. Stock and money are read from the chain; the order desk is the fulfilment record."
      >
        {body}
      </AdminShell>
    </>
  );
}

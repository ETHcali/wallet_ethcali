import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import AdminShell from '../../components/admin/AdminShell';
import Loading from '../../components/shared/Loading';
import { AdminCollection } from '../../components/swag/AdminCollection';
import { AdminOrders } from '../../components/swag/AdminOrders';
import { AdminStock } from '../../components/swag/AdminStock';
import { CARD, buttonClass } from '../../components/swag/AdminPrimitives';
import { HashChip } from '../../components/swag/HashChip';
import { CHAIN_IDS } from '../../config/constants';
import { useAdminStatus } from '../../hooks/useAdminStatus';
import { SWAG, useSwagAdminSummary } from '../../hooks/swag';

type Tab = 'orders' | 'stock' | 'collection';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'orders', label: 'Orders' },
  { id: 'stock', label: 'Stock' },
  { id: 'collection', label: 'Collection' },
];

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-content-primary">{value}</p>
      {hint && <p className="mt-1 truncate text-[11px] text-content-faint">{hint}</p>}
    </div>
  );
}

function Summary() {
  const { data, isLoading, error } = useSwagAdminSummary();
  if (error) return <p className="text-sm text-signal-reverted">{error.message}</p>;
  const n = (v: number | undefined) => (isLoading || v === undefined ? '…' : String(v));
  const queue = data?.voucherCancelQueue.filter((q) => !q.closedOnChain).length;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="To ship" value={n(data?.counts.byStatus.paid)} hint="Paid, not yet shipped" />
      <StatTile label="In transit" value={n(data?.counts.byStatus.shipped)} hint="Shipped, not yet delivered" />
      <StatTile label="Vouchers to cancel" value={n(queue)} hint="Refunded with a live voucher" />
      <StatTile label="Store" value={isLoading ? '…' : data?.collection.paused ? 'Paused' : 'Live'} hint={`${data?.counts.total ?? '…'} orders in total`} />
    </div>
  );
}

/**
 * The swag admin. Visibility is presentation: the menu shows this page when
 * isAdmin(wallet) on the collection says yes, and every write below is still
 * either a transaction the contract checks or an API call requireSwagAdmin
 * checks against the same contract.
 */
export default function SwagAdminPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const { isSwagAdmin, isLoading, walletAddress } = useAdminStatus(CHAIN_IDS.BASE);

  const [tab, setTab] = useState<Tab>('orders');
  useEffect(() => {
    const q = router.query.tab;
    const wanted = Array.isArray(q) ? q[0] : q;
    if (wanted === 'orders' || wanted === 'stock' || wanted === 'collection') setTab(wanted);
  }, [router.query.tab]);

  const selectTab = (next: Tab) => {
    setTab(next);
    void router.replace({ pathname: router.pathname, query: next === 'orders' ? {} : { tab: next } }, undefined, { shallow: true });
  };

  let body: React.ReactNode;
  if (!ready || (authenticated && isLoading)) {
    body = <Loading text="Reading roles from the collection…" />;
  } else if (!authenticated) {
    body = (
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
        <p className="text-sm text-content-muted">Sign in with a wallet that holds ADMIN_ROLE on {SWAG.name}.</p>
        <button type="button" onClick={login} className={buttonClass('primary')}>Sign in</button>
      </div>
    );
  } else if (!isSwagAdmin) {
    body = (
      <div className={CARD}>
        <p className="font-semibold text-content-primary">Not an admin of this collection</p>
        <p className="mt-2 text-sm text-content-muted">
          {walletAddress ? <HashChip hash={walletAddress} kind="address" /> : 'This wallet'} does not hold ADMIN_ROLE on{' '}
          <HashChip hash={SWAG.address} kind="address" />. Roles are granted from the Safe; nothing here can change that.
        </p>
      </div>
    );
  } else {
    body = (
      <div className="space-y-6">
        <Summary />
        <div role="tablist" aria-label="Swag admin sections" className="flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => selectTab(t.id)}
              className={`min-h-tap shrink-0 rounded-control border px-4 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'border-eth-blue bg-eth-blue-wash text-eth-blue-text'
                  : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'orders' && <AdminOrders />}
        {tab === 'stock' && <AdminStock />}
        {tab === 'collection' && <AdminCollection />}
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
        subtitle="Orders, caps and treasury for the Base collection. Stock and money are read from the chain; the order desk is the fulfilment record."
        chainId={CHAIN_IDS.BASE}
      >
        {body}
      </AdminShell>
    </>
  );
}

import Head from 'next/head';
import AdminShell from '../../components/admin/AdminShell';

/**
 * Placeholder while the swag admin is rebuilt against the new Swag1155 API
 * (orders, split caps, pause, treasury). The previous page drove royalties,
 * discounts, POAP whitelists and redemption, none of which exist on chain
 * any more.
 */
export default function SwagAdminPage() {
  return (
    <>
      <Head>
        <title>Swag admin — ETH Cali</title>
      </Head>
      <AdminShell
        active="swag"
        title="Swag"
        subtitle="Orders, caps and treasury for the Base collection."
      >
        <div className="rounded-card border border-line-hairline bg-surface-slab p-8 text-center">
          <p className="text-base font-semibold text-content-primary">Admin rebuild in progress</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-content-muted">
            The store now sells one design per token, USDC only, on Base only. The order
            desk, per-token caps and pause controls land here next.
          </p>
        </div>
      </AdminShell>
    </>
  );
}

import Head from 'next/head';
import Link from 'next/link';
import { formatEther } from 'viem';
import AdminShell from '../../components/admin/AdminShell';
import { StatTile } from '../../components/admin/StatTile';
import { ATTENTION_COPY } from '../../components/swag/AdminAttention';
import { HashChip } from '../../components/swag/HashChip';
import { ACCESS_CONTRACTS } from '../../config/access';
import { DEFAULT_CHAIN } from '../../config/chains';
import { useAccessMatrix } from '../../hooks/admin';
import {
  useActiveCampaigns,
  useCampaignTotals,
  useDonationAdmin,
  DONATION_CHAIN_ID,
  useDisplayCurrency,
} from '../../hooks/donations';
import { useAllVaults, useFaucetPaused } from '../../hooks/faucet';
import { useSwagAdminSummary, useSwagCollectionState } from '../../hooks/swag';
import { useAdminRoles } from '../../hooks/useAdminStatus';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { useZKPassportAdmin } from '../../hooks/useZKPassportAdmin';
import { formatUsd } from '../../utils/money';
import { formatTokenBalance } from '../../utils/tokenUtils';
import type { Campaign } from '../../types/donations';
import { SWAG_ATTENTION, type SwagAdminSummary } from '../../types/swag-orders';

/** One product: a heading that links to its admin page, then its numbers. */
function Area({ title, href, status, children }: { title: string; href: string; status?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line-hairline bg-surface-slab p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold text-content-primary">
          {title}
          {status}
        </h2>
        <Link href={href} className="text-sm font-semibold text-eth-blue-text hover:underline">
          Open →
        </Link>
      </div>
      {children}
    </section>
  );
}

function LiveBadge({ paused }: { paused: boolean | undefined }) {
  if (paused === undefined) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        paused ? 'bg-signal-reverted/15 text-signal-reverted' : 'bg-signal-confirmed/15 text-signal-confirmed'
      }`}
    >
      {paused ? 'Paused' : 'Live'}
    </span>
  );
}

/** Raised per currency for one campaign. formatToken uses each token's own decimals. */
function CampaignLine({ campaign }: { campaign: Campaign }) {
  const { data: totals = [] } = useCampaignTotals(campaign.id, DONATION_CHAIN_ID);
  const { format, formatToken } = useDisplayCurrency();
  return (
    <li className="border-t border-line-hairline pt-2 text-sm first:border-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold text-content-secondary">{campaign.name}</span>
        <span className="text-xs text-content-faint">
          {campaign.donorCount} donors · {campaign.active ? 'open' : 'closed'}
        </span>
      </div>
      {totals.map((t) => (
        <p key={t.token.address} className="mt-0.5 font-mono text-xs text-content-primary">
          {formatToken(t.raised, t.token)} <span className="text-content-faint">≈ {format(t.raised, t.token)}</span>
        </p>
      ))}
    </li>
  );
}

/** One line: how many orders wait on someone, linking to the swag queue. */
function SwagAttentionLine({ data }: { data: SwagAdminSummary }) {
  const admin = data.viewer.role === 'admin';
  const waiting = SWAG_ATTENTION.filter((r) => admin || !ATTENTION_COPY[r].adminOnly).reduce((n, r) => n + data.attention[r], 0);
  if (waiting === 0) return null;
  return (
    <Link
      href="/swag/admin"
      className="col-span-2 flex min-h-tap items-center justify-between gap-2 rounded-card border border-line-strong bg-surface-inset/50 px-4 text-sm hover:border-line-brand"
    >
      <span className="font-semibold text-content-primary">
        {waiting} order{waiting === 1 ? '' : 's'} need{waiting === 1 ? 's' : ''} attention
      </span>
      <span className="text-xs font-semibold text-eth-blue-text">Review →</span>
    </Link>
  );
}

function AccessHealth() {
  const matrix = useAccessMatrix();
  const missing = matrix.data?.seed.reduce((n, s) => n + s.missing.length, 0) ?? 0;
  if (!matrix.data) return null;
  return missing > 0 ? (
    <Link
      href="/admin/access"
      className="block rounded-card border border-signal-pending/40 bg-signal-pending/10 p-4 text-sm text-signal-pending hover:border-signal-pending"
    >
      <span className="font-bold">The seed operator is missing {missing} role{missing === 1 ? '' : 's'}.</span>{' '}
      <span className="text-content-muted">Some admin pages stay locked for the foundation wallet until they are granted. Review in Admins &amp; access →</span>
    </Link>
  ) : (
    <p className="rounded-card border border-line-hairline bg-surface-inset/50 p-4 text-sm text-content-muted">
      <span className="text-signal-confirmed">Access in place.</span> The seed operator holds every role it should.
    </p>
  );
}

export default function AdminOverviewPage() {
  const chainId = DEFAULT_CHAIN.id;
  const roles = useAdminRoles();

  const { data: campaigns = [], isLoading: loadingCampaigns } = useActiveCampaigns(DONATION_CHAIN_ID);
  const { isPaused: donationsPaused } = useDonationAdmin(DONATION_CHAIN_ID);

  const { vaults } = useAllVaults(chainId);
  const { isPaused: faucetPaused } = useFaucetPaused(chainId);
  const { getPriceForToken } = useTokenPrices();

  const swagState = useSwagCollectionState();
  const swag = useSwagAdminSummary();

  const identity = useZKPassportAdmin(chainId);

  const ethPrice = getPriceForToken('ETH').price;
  const faucetWei = vaults.reduce((sum, v) => sum + v.balance, 0n);
  const faucetEth = formatEther(faucetWei);
  const faucetUsd = ethPrice > 0 ? `~${formatUsd(Number(faucetEth) * ethPrice, { cents: true })}` : undefined;

  const yourRoles = [
    roles.isDonationSuperAdmin && 'Donations · super admin',
    roles.isDonationAdmin && 'Donations · admin',
    roles.isSwagAdmin && 'Swag · admin',
    roles.isSwagFulfilment && 'Swag · fulfilment',
    roles.isFaucetSuperAdmin && 'Faucet · super admin',
    roles.isFaucetAdmin && 'Faucet · admin',
    roles.isZKPassportOwner && 'Identity · owner',
  ].filter((r): r is string => Boolean(r));

  return (
    <AdminShell
      active="overview"
      title="Overview"
      subtitle="Every product at a glance. Money and roles are read from the chain; orders from the order desk."
    >
      <Head>
        <title>Admin · ETH Cali</title>
      </Head>

      <div className="space-y-4">
        <AccessHealth />

        {roles.walletAddress && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
            <span>Your roles:</span>
            {roles.isLoading && <span>reading…</span>}
            {!roles.isLoading && yourRoles.length === 0 && <span>none on this wallet</span>}
            {yourRoles.map((r) => (
              <span key={r} className="rounded-full bg-surface-ridge px-2.5 py-1 font-semibold text-content-secondary">
                {r}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Area title="Donations" href="/donations/admin" status={<LiveBadge paused={donationsPaused} />}>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <StatTile label="Campaigns" value={loadingCampaigns ? '…' : String(campaigns.length)} hint="Active" />
              <StatTile
                label="Donors"
                value={loadingCampaigns ? '…' : String(campaigns.reduce((sum, c) => sum + c.donorCount, 0))}
                hint="Unique addresses"
              />
            </div>
            {campaigns.length === 0 && !loadingCampaigns ? (
              <p className="text-sm text-content-muted">No campaign yet. Nothing can be donated until one is created.</p>
            ) : (
              <ul className="space-y-2">{campaigns.map((c) => <CampaignLine key={c.id} campaign={c} />)}</ul>
            )}
          </Area>

          <Area title="Swag" href="/swag/admin" status={<LiveBadge paused={swagState.isLoading ? undefined : swagState.paused} />}>
            {swag.data ? (
              <div className="grid grid-cols-2 gap-3">
                <SwagAttentionLine data={swag.data} />
                <StatTile label="To produce" value={String(swag.data.counts.byStatus.paid)} hint="Paid, not yet printed" href="/swag/admin?tab=orders&status=paid" />
                <StatTile label="In transit" value={String(swag.data.counts.byStatus.shipped)} hint="Shipped, not delivered" href="/swag/admin?tab=orders&status=shipped" />
                <StatTile label="Orders" value={String(swag.data.counts.total)} hint="All channels" href="/swag/admin?tab=orders" />
                <StatTile
                  label="USDC in"
                  value={formatUsd(swag.data.revenue.USDC.item + swag.data.revenue.USDC.shipping, { cents: true })}
                  hint={`${swag.data.revenue.USDC.orders} on-chain orders`}
                />
              </div>
            ) : (
              <p className="text-sm text-content-muted">
                Orders show here for the swag team. {swag.error ? 'This account does not hold a swag role.' : ''}
              </p>
            )}
          </Area>

          <Area title="Faucet" href="/faucet/admin" status={<LiveBadge paused={faucetPaused} />}>
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Balance" value={`${formatTokenBalance(faucetEth, 4)} ETH`} hint={faucetUsd} />
              <StatTile label="Vaults" value={`${vaults.filter((v) => v.active).length} / ${vaults.length}`} hint="Active / total" />
            </div>
          </Area>

          <Area title="Identity" href="/sybil/admin">
            <p className="text-sm text-content-muted">
              ZKPassport NFT. Owner{' '}
              {identity.owner ? <HashChip hash={identity.owner} kind="address" /> : '…'}
              {identity.isOwner && ' (you)'}.
            </p>
          </Area>

          <Area title="Certificates" href="/admin/certificates">
            <p className="text-sm text-content-muted">Builder certificates: soulbound NFTs, the PDF diploma and the credential page. Issuers need Admin on BuilderCertificate.</p>
          </Area>

          <Area title="Site content" href="/admin/content">
            <p className="text-sm text-content-muted">Events, venues, team and partners on ethcali.org. Editors need Admin on DonationVault.</p>
          </Area>

          <Area title="Artwork" href="/admin/artwork">
            <p className="text-sm text-content-muted">Swag product artwork, pinned to IPFS before it goes on chain.</p>
          </Area>
        </div>

        <section className="rounded-card border border-line-hairline bg-surface-slab p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-content-secondary">Contracts on Ethereum</h2>
          <ul className="space-y-2 text-sm">
            {ACCESS_CONTRACTS.filter((c) => c.address).map((c) => (
              <li key={c.key} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-content-muted">{c.name}</span>
                <HashChip hash={c.address!} kind="address" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}

import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../components/admin/AdminShell';
import {
  useActiveCampaigns,
  useCampaignTotals,
  useDonationAddresses,
  useDonationAdmin,
  DONATION_CHAIN_ID,
  useDisplayCurrency,
} from '../../hooks/donations';
import { useAdminRoles } from '../../hooks/useAdminStatus';
import { explorerAddress } from '../../config/chains';
import type { Campaign } from '../../types/donations';

/** One headline number. Never renders a raw base unit — callers format first. */
function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-bold text-content-primary" title={value}>
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-[11px] text-content-faint">{hint}</p>}
    </div>
  );
}

/** Per-campaign totals, one row per accepted currency. */
function CampaignSummary({ campaign, chainId }: { campaign: Campaign; chainId: number }) {
  const { data: totals = [], isLoading } = useCampaignTotals(campaign.id, chainId);
  const { format, formatToken } = useDisplayCurrency();

  return (
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-content-primary">{campaign.name}</h3>
          <p className="text-xs text-content-faint">
            Campaign #{campaign.id} · {campaign.donorCount} donors ·{' '}
            {campaign.donationCount} donations
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            campaign.active
              ? 'bg-eth-blue/15 text-eth-blue-text'
              : 'bg-surface-ridge text-content-muted'
          }`}
        >
          {campaign.active ? 'Active' : 'Closed'}
        </span>
      </div>

      {isLoading && <p className="text-xs text-content-faint">Reading totals…</p>}

      {!isLoading && totals.length === 0 && (
        <p className="text-xs text-content-faint">No currencies accepted yet.</p>
      )}

      <div className="space-y-2">
        {totals.map((t) => (
          <div
            key={t.token.address}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line-hairline pt-2 text-sm first:border-0 first:pt-0"
          >
            <span className="font-semibold text-content-secondary">{t.token.symbol}</span>
            <span className="text-content-primary">
              {/* formatToken uses the token's own decimals — ETH 18, USDC 6. */}
              {formatToken(t.raised, t.token)}
              <span className="ml-2 text-xs text-content-faint">
                ≈ {format(t.raised, t.token)}
              </span>
            </span>
          </div>
        ))}
      </div>

      {campaign.autoForward && (
        <p className="mt-3 text-[11px] text-content-faint">
          Router mode: each donation forwards to the beneficiary on arrival, so the
          vault balance stays near zero by design.
        </p>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  const chainId = DONATION_CHAIN_ID;

  const { vault, receiptCollection, isDeployed, tokens } = useDonationAddresses(chainId);
  const { data: campaigns = [], isLoading } = useActiveCampaigns(chainId);
  const { isPaused, isSuperAdmin } = useDonationAdmin(chainId);
  // Other areas are linked when the wallet holds the role on that contract.
  const { isSwagAdmin, isFaucetAdmin, isFaucetSuperAdmin, isZKPassportOwner } = useAdminRoles();

  const otherAreas = [
    { href: '/faucet/admin', label: 'Faucet', shown: isFaucetAdmin || isFaucetSuperAdmin },
    { href: '/swag/admin', label: 'Swag', shown: isSwagAdmin },
    { href: '/sybil/admin', label: 'Identity', shown: isZKPassportOwner },
  ].filter((a) => a.shown);

  return (
    <AdminShell
      active="overview"
      title="Overview"
      subtitle="Live contract state. Every number here is read from the chain, not from the index."
    >
      <Head>
        <title>Admin · ETH Cali</title>
      </Head>

      {!isDeployed ? (
        <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-content-primary">Nothing deployed</h2>
          <p className="text-sm text-content-muted">No DonationVault is deployed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* grid-cols-2 from the smallest size: two tiles fit a phone, four
              would squash to unreadable. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Campaigns"
              value={isLoading ? '…' : String(campaigns.length)}
              hint="Active"
            />
            <StatTile
              label="Donors"
              value={
                isLoading
                  ? '…'
                  : String(campaigns.reduce((sum, c) => sum + c.donorCount, 0))
              }
              hint="Unique addresses"
            />
            <StatTile
              label="Currencies"
              value={String(tokens.length)}
              hint={tokens.map((t) => t.symbol).join(', ')}
            />
            <StatTile
              label="Vault"
              value={isPaused ? 'Paused' : 'Live'}
              hint={isSuperAdmin ? 'You hold custody admin' : 'Operator access'}
            />
          </div>

          {isPaused && (
            <div className="rounded-card border border-signal-pending/40 bg-signal-pending/10 p-4 text-sm text-signal-pending">
              The vault is paused — donations are rejected until it is unpaused.
            </div>
          )}

          {/* Campaigns */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-content-secondary">Campaigns</h2>
            {isLoading && <p className="text-sm text-content-faint">Loading…</p>}
            {!isLoading && campaigns.length === 0 && (
              <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-5">
                <p className="text-sm text-content-muted">
                  No campaign exists yet. Nothing can be donated until one is created.
                </p>
                <Link
                  href="/donations/admin"
                  className="mt-3 inline-flex min-h-tap items-center rounded-control bg-eth-blue px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
                >
                  Create a campaign
                </Link>
              </div>
            )}
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <CampaignSummary key={campaign.id} campaign={campaign} chainId={chainId} />
              ))}
            </div>
          </section>

          {/* Contracts */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-content-secondary">Contracts</h2>
            <div className="space-y-2 rounded-card border border-line-hairline bg-surface-inset/50 p-4 text-xs">
              {[
                { label: 'DonationVault', address: vault },
                { label: 'DonationReceipt1155', address: receiptCollection },
              ].map(({ label, address }) =>
                address ? (
                  <div
                    key={label}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="text-content-muted">{label}</span>
                    <a
                      href={explorerAddress(chainId, address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-mono text-eth-blue-text hover:underline"
                    >
                      {address.slice(0, 10)}…{address.slice(-8)} ↗
                    </a>
                  </div>
                ) : null
              )}
            </div>
          </section>

          {otherAreas.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-content-secondary">Other areas</h2>
              <div className="flex flex-wrap gap-2">
                {otherAreas.map((area) => (
                  <Link
                    key={area.href}
                    href={area.href}
                    className="inline-flex min-h-tap items-center rounded-control border border-line-hairline bg-surface-inset px-4 text-sm font-semibold text-content-secondary transition-colors hover:border-line-strong hover:text-content-primary"
                  >
                    {area.label}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AdminShell>
  );
}

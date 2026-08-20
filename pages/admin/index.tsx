import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../components/admin/AdminShell';
import {
  useActiveCampaigns,
  useCampaignTotals,
  useDonationAddresses,
  useDonationAdmin,
  useDeployedDonationChains,
  useDisplayCurrency,
} from '../../hooks/donations';
import { useAdminStatus } from '../../hooks/useAdminStatus';
import { CHAIN_IDS, EXPLORER_URLS, NETWORK_NAMES, type ChainId } from '../../config/constants';
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
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-bold text-white" title={value}>
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

/** Per-campaign totals, one row per accepted currency. */
function CampaignSummary({ campaign, chainId }: { campaign: Campaign; chainId: number }) {
  const { data: totals = [], isLoading } = useCampaignTotals(campaign.id, chainId);
  const { format, formatToken } = useDisplayCurrency();

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{campaign.name}</h3>
          <p className="text-xs text-slate-500">
            Campaign #{campaign.id} · {campaign.donorCount} donors ·{' '}
            {campaign.donationCount} donations
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            campaign.active
              ? 'bg-green-500/15 text-green-400'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {campaign.active ? 'Active' : 'Closed'}
        </span>
      </div>

      {isLoading && <p className="text-xs text-slate-500">Reading totals…</p>}

      {!isLoading && totals.length === 0 && (
        <p className="text-xs text-slate-500">No currencies accepted yet.</p>
      )}

      <div className="space-y-2">
        {totals.map((t) => (
          <div
            key={t.token.address}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-slate-700/60 pt-2 text-sm first:border-0 first:pt-0"
          >
            <span className="font-semibold text-slate-300">{t.token.symbol}</span>
            <span className="text-white">
              {/* formatToken uses the token's own decimals — COPm 18, USDC 6. */}
              {formatToken(t.raised, t.token)}
              <span className="ml-2 text-xs text-slate-500">
                ≈ {format(t.raised, t.token)}
              </span>
            </span>
          </div>
        ))}
      </div>

      {campaign.autoForward && (
        <p className="mt-3 text-[11px] text-slate-500">
          Router mode: each donation forwards to the beneficiary on arrival, so the
          vault balance stays near zero by design.
        </p>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  const deployedChains = useDeployedDonationChains();
  const [chainId, setChainId] = useState<number>(
    deployedChains[0]?.chainId ?? CHAIN_IDS.CELO
  );

  const { vault, receiptCollection, isDeployed, tokens } = useDonationAddresses(chainId);
  const { data: campaigns = [], isLoading } = useActiveCampaigns(chainId);
  const { isPaused, isSuperAdmin } = useDonationAdmin(chainId);
  const { isSwagAdmin, isFaucetAdmin, isFaucetSuperAdmin, isZKPassportOwner } =
    useAdminStatus(chainId);

  const explorer = EXPLORER_URLS[chainId as ChainId];

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
      chainId={chainId}
    >
      <Head>
        <title>Admin · ETH Cali</title>
      </Head>

      {deployedChains.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {deployedChains.map((chain) => (
            <button
              key={chain.chainId}
              type="button"
              onClick={() => setChainId(chain.chainId)}
              className={`min-h-[44px] rounded-lg border px-4 text-sm font-semibold transition-colors ${
                chain.chainId === chainId
                  ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>
      )}

      {!isDeployed ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-white">Nothing deployed here</h2>
          <p className="text-sm text-slate-400">
            No DonationVault on {NETWORK_NAMES[chainId as ChainId] ?? 'this network'}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* grid-cols-2 from the smallest size: two tiles fit a phone, four
              would squash to unreadable. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Campaigns"
              value={isLoading ? '…' : String(campaigns.length)}
              hint="Active on this chain"
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
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
              The vault is paused — donations are rejected until it is unpaused.
            </div>
          )}

          {/* Campaigns */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-300">Campaigns</h2>
            {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
            {!isLoading && campaigns.length === 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                <p className="text-sm text-slate-400">
                  No campaign exists yet. Nothing can be donated until one is created.
                </p>
                <Link
                  href="/donations/admin"
                  className="mt-3 inline-flex min-h-[44px] items-center rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-400"
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
            <h2 className="mb-3 text-sm font-semibold text-slate-300">Contracts</h2>
            <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-xs">
              {[
                { label: 'DonationVault', address: vault },
                { label: 'DonationReceipt1155', address: receiptCollection },
              ].map(({ label, address }) =>
                address ? (
                  <div
                    key={label}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="text-slate-400">{label}</span>
                    <a
                      href={`${explorer}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-mono text-cyan-400 hover:underline"
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
              <h2 className="mb-3 text-sm font-semibold text-slate-300">Other areas</h2>
              <div className="flex flex-wrap gap-2">
                {otherAreas.map((area) => (
                  <Link
                    key={area.href}
                    href={area.href}
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
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

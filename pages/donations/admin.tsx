import { useState } from 'react';
import Head from 'next/head';
import { useWallets } from '@privy-io/react-auth';
import AdminShell from '../../components/admin/AdminShell';
import CampaignAdminForm from '../../components/donations/CampaignAdminForm';
import CurrencyTierManager from '../../components/donations/CurrencyTierManager';
import {
  useActiveCampaigns,
  useCampaignTotals,
  useDonationAddresses,
  useDeployedDonationChains,
  useDisplayCurrency,
} from '../../hooks/donations';
import {
  useDonationAdmin,
  useDonationAdminActions,
  useReceiptMinterStatus,
} from '../../hooks/donations/useDonationAdmin';
import { CHAIN_IDS, NETWORK_NAMES, type ChainId } from '../../config/constants';

type Tab = 'campaigns' | 'create' | 'receipts';

export default function DonationsAdminPage() {
  const { ready } = useWallets();
  const deployedChains = useDeployedDonationChains();
  const [chainId, setChainId] = useState<number>(
    deployedChains[0]?.chainId ?? CHAIN_IDS.CELO
  );

  const { vault, receiptCollection, isDeployed, tokens } = useDonationAddresses(chainId);
  const { isAdmin, isSuperAdmin, isPaused, walletAddress, isLoading } =
    useDonationAdmin(chainId);
  const { setPaused, setReceiptTier, addReceiptMinter, pendingAction, error } =
    useDonationAdminActions(chainId);
  const { data: vaultIsMinter, isLoading: isCheckingMinter } =
    useReceiptMinterStatus(chainId);

  const { data: campaigns = [] } = useActiveCampaigns(chainId);
  const [tab, setTab] = useState<Tab>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  const [tierForm, setTierForm] = useState({ id: '1', name: '', uri: '' });

  const campaign = campaigns.find((c) => c.id === selectedCampaign) ?? campaigns[0] ?? null;
  const { data: totals = [] } = useCampaignTotals(campaign?.id ?? null, chainId);
  const { formatToken } = useDisplayCurrency();

  const acceptedTokens = totals.map((t) => t.token.address);

  if (!ready || isLoading) {
    return (
      <AdminShell active="donations" title="Donations" chainId={chainId}>
        <p className="py-16 text-center text-sm text-slate-500">Checking permissions…</p>
      </AdminShell>
    );
  }

  if (!isDeployed) {
    return (
      <AdminShell active="donations" title="Donations" chainId={chainId}>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-white">Not deployed</h2>
            <p className="text-sm text-slate-400">
              DonationVault is not deployed on{' '}
              {NETWORK_NAMES[chainId as ChainId] ?? 'this network'} yet.
            </p>
        </div>
      </AdminShell>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <AdminShell active="donations" title="Donations" chainId={chainId}>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-white">Not authorised</h2>
            <p className="text-sm text-slate-400">
              {walletAddress ? (
                <>
                  <span className="font-mono text-xs">{walletAddress}</span> does not hold
                  ADMIN_ROLE on this vault.
                </>
              ) : (
                'Connect an admin wallet to continue.'
              )}
            </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      active="donations"
      title="Donations Admin"
      subtitle={vault ?? undefined}
      chainId={chainId}
    >
      <Head>
        <title>Donations Admin · ETH Cali</title>
      </Head>

      <div>
        <header className="mb-6 flex flex-wrap items-center gap-2">
            {isSuperAdmin && (
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                super admin
              </span>
            )}
            <button
              type="button"
              onClick={() => setPaused(!isPaused)}
              disabled={pendingAction === 'pause' || pendingAction === 'unpause'}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                isPaused
                  ? 'bg-green-500 text-slate-900 hover:bg-green-400'
                  : 'border border-slate-600 bg-slate-800 text-slate-300 hover:border-red-500 hover:text-red-400'
              }`}
            >
              {pendingAction === 'pause' || pendingAction === 'unpause'
                ? 'Saving…'
                : isPaused
                  ? 'Resume donations'
                  : 'Pause donations'}
            </button>
        </header>

        {/* The launch mistake that silently costs donors their NFTs */}
        {receiptCollection && !isCheckingMinter && !vaultIsMinter && (
          <div className="mb-6 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
            <h2 className="mb-1 text-sm font-bold text-amber-300">
              Receipts are not being minted
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-amber-200/80">
              The vault does not hold MINTER_ROLE on the receipt collection. Donations
              will still succeed, but every donor silently receives no NFT. Grant it
              before announcing the campaign.
            </p>
            <button
              type="button"
              onClick={() => vault && addReceiptMinter(vault)}
              disabled={pendingAction === 'addReceiptMinter'}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
            >
              {pendingAction === 'addReceiptMinter' ? 'Granting…' : 'Grant MINTER_ROLE'}
            </button>
          </div>
        )}

        {isPaused && (
          <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-300">
            Donations are paused. Nobody can donate until this is resumed.
          </div>
        )}

        {deployedChains.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {deployedChains.map((c) => (
              <button
                key={c.chainId}
                type="button"
                onClick={() => setChainId(c.chainId)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  c.chainId === chainId
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mb-5 flex gap-2 border-b border-slate-700">
          {(['campaigns', 'create', 'receipts'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? 'border-b-2 border-cyan-500 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {tab === 'create' && (
          <div className="max-w-xl rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
            <h2 className="mb-4 text-sm font-bold text-white">New campaign</h2>
            <CampaignAdminForm chainId={chainId} onCreated={() => setTab('campaigns')} />
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {campaigns.length === 0 && (
                <p className="text-sm text-slate-500">
                  No campaigns yet. Create one to begin.
                </p>
              )}
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCampaign(c.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    campaign?.id === c.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{c.name}</span>
                    <span className="text-[11px] text-slate-500">#{c.id}</span>
                  </div>
                  <div className="mt-1 flex gap-3 text-[11px] text-slate-500">
                    <span>{c.donorCount} donors</span>
                    <span>{c.autoForward ? 'router' : 'holder'}</span>
                    <span>{c.active ? 'open' : 'closed'}</span>
                  </div>
                </button>
              ))}
            </div>

            {campaign && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-white">
                    Raised · {campaign.name}
                  </h3>
                  {totals.length === 0 && (
                    <p className="text-xs text-slate-500">No currencies accepted yet.</p>
                  )}
                  <ul className="space-y-1.5">
                    {totals.map((t) => (
                      <li
                        key={t.token.address}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-400">{t.token.symbol}</span>
                        <span className="font-semibold text-white">
                          {formatToken(t.raised, t.token)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-white">Currencies & tiers</h3>
                  <CurrencyTierManager
                    campaign={campaign}
                    chainId={chainId}
                    acceptedTokens={acceptedTokens}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'receipts' && (
          <div className="max-w-xl space-y-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
              <h2 className="mb-1 text-sm font-bold text-white">Receipt tiers</h2>
              <p className="mb-4 text-xs text-slate-500">
                Each tokenId is a tier. Tiers that have already been minted cannot be
                removed, only deactivated.
              </p>

              {!receiptCollection && (
                <p className="text-xs text-amber-300">
                  No receipt collection deployed on this network.
                </p>
              )}

              {receiptCollection && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tierForm.id}
                      onChange={(e) =>
                        setTierForm({ ...tierForm, id: e.target.value.replace(/[^0-9]/g, '') })
                      }
                      placeholder="1"
                      className="w-16 rounded border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-white outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={tierForm.name}
                      onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                      placeholder="Supporter"
                      className="flex-1 rounded border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={tierForm.uri}
                    onChange={(e) => setTierForm({ ...tierForm, uri: e.target.value })}
                    placeholder="ipfs://…/1.json"
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-2 font-mono text-xs text-white outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReceiptTier(
                        Number(tierForm.id || 0),
                        tierForm.name,
                        tierForm.uri,
                        true
                      )
                    }
                    disabled={
                      !tierForm.name || !tierForm.uri || pendingAction === 'setReceiptTier'
                    }
                    className="w-full rounded-lg bg-cyan-500 py-2 text-xs font-semibold text-slate-900 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    {pendingAction === 'setReceiptTier' ? 'Saving…' : 'Save tier'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4 text-xs text-slate-400">
              <h3 className="mb-2 text-sm font-semibold text-slate-300">Launch order</h3>
              <ol className="list-inside list-decimal space-y-1">
                <li>Grant the vault MINTER_ROLE on the receipt collection</li>
                <li>Create the receipt tiers above</li>
                <li>Create the campaign</li>
                <li>Accept each currency ({tokens.map((t) => t.symbol).join(', ')})</li>
                <li>Set tiers per currency — thresholds differ by decimals</li>
                <li>Verify with a small test donation before announcing</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

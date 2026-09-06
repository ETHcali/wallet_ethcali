import { useState } from 'react';
import Head from 'next/head';
import { useWallets } from '@privy-io/react-auth';
import AdminShell from '../../components/admin/AdminShell';
import CampaignAdminForm from '../../components/donations/CampaignAdminForm';
import CurrencyTierManager from '../../components/donations/CurrencyTierManager';
import BankAccountManager from '../../components/donations/BankAccountManager';
import {
  useActiveCampaigns,
  useCampaignTotals,
  useCampaignRowId,
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

type Tab = 'campaigns' | 'create' | 'receipts' | 'bank';

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
  const { data: campaignRowId } = useCampaignRowId(chainId, vault, campaign?.id ?? null);
  const { formatToken } = useDisplayCurrency();

  const acceptedTokens = totals.map((t) => t.token.address);

  if (!ready || isLoading) {
    return (
      <AdminShell active="donations" title="Donations" chainId={chainId}>
        <p className="py-16 text-center text-sm text-content-faint">Checking permissions…</p>
      </AdminShell>
    );
  }

  if (!isDeployed) {
    return (
      <AdminShell active="donations" title="Donations" chainId={chainId}>
        <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-content-primary">Not deployed</h2>
            <p className="text-sm text-content-muted">
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
        <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-content-primary">Not authorised</h2>
            <p className="text-sm text-content-muted">
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
              <span className="rounded-full border border-eth-blue/40 bg-eth-blue/10 px-2 py-0.5 text-[11px] font-semibold text-eth-blue-text">
                super admin
              </span>
            )}
            <button
              type="button"
              onClick={() => setPaused(!isPaused)}
              disabled={pendingAction === 'pause' || pendingAction === 'unpause'}
              className={`rounded-control px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                isPaused
                  ? 'bg-eth-blue text-on-brand hover:bg-eth-blue-lift'
                  : 'border border-line-strong bg-surface-inset text-content-secondary hover:border-signal-reverted hover:text-signal-reverted'
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
          <div className="mb-6 rounded-card border border-signal-pending/50 bg-signal-pending/10 p-4">
            <h2 className="mb-1 text-sm font-bold text-signal-pending">
              Receipts are not being minted
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-signal-pending/80">
              The vault does not hold MINTER_ROLE on the receipt collection. Donations
              will still succeed, but every donor silently receives no NFT. Grant it
              before announcing the campaign.
            </p>
            <button
              type="button"
              onClick={() => vault && addReceiptMinter(vault)}
              disabled={pendingAction === 'addReceiptMinter'}
              className="rounded-control bg-signal-pending px-3 py-1.5 text-xs font-semibold text-on-brand hover:bg-signal-pending disabled:opacity-50"
            >
              {pendingAction === 'addReceiptMinter' ? 'Granting…' : 'Grant MINTER_ROLE'}
            </button>
          </div>
        )}

        {isPaused && (
          <div className="mb-6 rounded-card border border-signal-reverted/50 bg-signal-reverted/10 p-4 text-sm text-signal-reverted">
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
                className={`rounded-control border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  c.chainId === chainId
                    ? 'border-eth-blue bg-eth-blue/15 text-eth-blue-text'
                    : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mb-5 flex gap-2 border-b border-line-hairline">
          {(['campaigns', 'create', 'receipts', 'bank'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? 'border-b-2 border-eth-blue text-eth-blue-text'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3 text-xs text-signal-reverted">
            {error}
          </div>
        )}

        {tab === 'create' && (
          <div className="max-w-xl rounded-card border border-line-hairline bg-surface-inset/50 p-5">
            <h2 className="mb-4 text-sm font-bold text-content-primary">New campaign</h2>
            <CampaignAdminForm chainId={chainId} onCreated={() => setTab('campaigns')} />
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {campaigns.length === 0 && (
                <p className="text-sm text-content-faint">
                  No campaigns yet. Create one to begin.
                </p>
              )}
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCampaign(c.id)}
                  className={`w-full rounded-card border p-4 text-left transition-colors ${
                    campaign?.id === c.id
                      ? 'border-eth-blue bg-eth-blue/10'
                      : 'border-line-hairline bg-surface-inset/50 hover:border-line-strong'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-content-primary">{c.name}</span>
                    <span className="text-[11px] text-content-faint">#{c.id}</span>
                  </div>
                  <div className="mt-1 flex gap-3 text-[11px] text-content-faint">
                    <span>{c.donorCount} donors</span>
                    <span>{c.autoForward ? 'router' : 'holder'}</span>
                    <span>{c.active ? 'open' : 'closed'}</span>
                  </div>
                </button>
              ))}
            </div>

            {campaign && (
              <div className="space-y-4">
                <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-content-primary">
                    Raised · {campaign.name}
                  </h3>
                  {totals.length === 0 && (
                    <p className="text-xs text-content-faint">No currencies accepted yet.</p>
                  )}
                  <ul className="space-y-1.5">
                    {totals.map((t) => (
                      <li
                        key={t.token.address}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-content-muted">{t.token.symbol}</span>
                        <span className="font-semibold text-content-primary">
                          {formatToken(t.raised, t.token)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-content-primary">Currencies & tiers</h3>
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

        {tab === 'bank' && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-content-primary">Bank transfer donations</h2>
              <p className="mt-1 text-xs text-content-faint">
                Accounts shown on{' '}
                <span className="text-content-secondary">{campaign?.name ?? 'the campaign'}</span> for
                donors who are not paying on-chain. Display only — a transfer is not
                recorded until it is reconciled from the bank.
              </p>
            </div>
            <BankAccountManager campaignId={campaignRowId ?? null} />
          </div>
        )}

        {tab === 'receipts' && (
          <div className="max-w-xl space-y-4">
            <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-5">
              <h2 className="mb-1 text-sm font-bold text-content-primary">Receipt tiers</h2>
              <p className="mb-4 text-xs text-content-faint">
                Each tokenId is a tier. Tiers that have already been minted cannot be
                removed, only deactivated.
              </p>

              {!receiptCollection && (
                <p className="text-xs text-signal-pending">
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
                      className="w-16 rounded-chip border border-line-hairline bg-surface-inset px-2 py-2 text-xs text-content-primary outline-none focus:border-eth-blue"
                    />
                    <input
                      type="text"
                      value={tierForm.name}
                      onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                      placeholder="Supporter"
                      className="flex-1 rounded-chip border border-line-hairline bg-surface-inset px-2 py-2 text-xs text-content-primary outline-none focus:border-eth-blue"
                    />
                  </div>
                  <input
                    type="text"
                    value={tierForm.uri}
                    onChange={(e) => setTierForm({ ...tierForm, uri: e.target.value })}
                    placeholder="ipfs://…/1.json"
                    className="w-full rounded-chip border border-line-hairline bg-surface-inset px-2 py-2 font-mono text-xs text-content-primary outline-none focus:border-eth-blue"
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
                    className="w-full rounded-control bg-eth-blue py-2 text-xs font-semibold text-on-brand hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
                  >
                    {pendingAction === 'setReceiptTier' ? 'Saving…' : 'Save tier'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4 text-xs text-content-muted">
              <h3 className="mb-2 text-sm font-semibold text-content-secondary">Launch order</h3>
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

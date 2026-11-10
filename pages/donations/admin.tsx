import { useState } from 'react';
import Head from 'next/head';
import { useWallets } from '@privy-io/react-auth';
import AdminShell from '../../components/admin/AdminShell';
import { AccessManager } from '../../components/admin/AccessManager';
import { CARD, ConfirmDialog, FIELD, Spinner, Tabs, buttonClass, useToast } from '../../components/admin/primitives';
import { HashChip } from '../../components/shared/HashChip';
import SwitchChainButton from '../../components/shared/SwitchChainButton';
import { useRequireChain } from '../../hooks/useRequireChain';
import CampaignAdminForm from '../../components/donations/CampaignAdminForm';
import CurrencyTierManager from '../../components/donations/CurrencyTierManager';
import BankAccountManager from '../../components/donations/BankAccountManager';
import {
  useActiveCampaigns,
  useCampaignTotals,
  useCampaignRowId,
  useDonationAddresses,
  DONATION_CHAIN_ID,
  useDisplayCurrency,
} from '../../hooks/donations';
import {
  useDonationAdmin,
  useDonationAdminActions,
  useReceiptMinterStatus,
} from '../../hooks/donations/useDonationAdmin';

type Tab = 'campaigns' | 'receipts' | 'bank' | 'access';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'bank', label: 'Bank' },
  { id: 'access', label: 'Access' },
];

export default function DonationsAdminPage() {
  const { ready } = useWallets();
  const chainId = DONATION_CHAIN_ID;
  // Every write on this page is on `chainId`; the wallet is moved here, once,
  // before any of them is reachable.
  const chain = useRequireChain(chainId);

  const { vault, receiptCollection, isDeployed, tokens } = useDonationAddresses(chainId);
  const { isAdmin, isSuperAdmin, isPaused, walletAddress, isLoading } =
    useDonationAdmin(chainId);
  const { setPaused, setReceiptTier, addReceiptMinter, pendingAction, error, errorAction, blocked } =
    useDonationAdminActions(chainId);
  const toast = useToast();
  const [askPause, setAskPause] = useState(false);
  /** The error, only beside the button whose action raised it. */
  const errorFor = (...actions: string[]) =>
    error && errorAction && actions.includes(errorAction) ? <p className="mt-1 text-xs text-signal-reverted">{error}</p> : null;
  const { data: vaultIsMinter, isLoading: isCheckingMinter } =
    useReceiptMinterStatus(chainId);

  const { data: campaigns = [] } = useActiveCampaigns(chainId);
  const [tab, setTab] = useState<Tab>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const [tierForm, setTierForm] = useState({ id: '1', name: '', uri: '' });

  const campaign = campaigns.find((c) => c.id === selectedCampaign) ?? campaigns[0] ?? null;
  const { data: totals = [] } = useCampaignTotals(campaign?.id ?? null, chainId);
  const { data: campaignRowId } = useCampaignRowId(chainId, vault, campaign?.id ?? null);
  const { format, formatToken } = useDisplayCurrency();

  const acceptedTokens = totals.map((t) => t.token.address);

  if (!ready || isLoading) {
    return (
      <AdminShell active="donations" title="Donations">
        <p className="py-16 text-center text-sm text-content-faint">Checking permissions…</p>
      </AdminShell>
    );
  }

  if (!isDeployed) {
    return (
      <AdminShell active="donations" title="Donations">
        <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-content-primary">Not deployed</h2>
            <p className="text-sm text-content-muted">
              DonationVault is not deployed yet.
            </p>
        </div>
      </AdminShell>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <AdminShell active="donations" title="Donations">
        <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-content-primary">Not authorised</h2>
            <p className="text-sm text-content-muted">
              {walletAddress ? (
                <>
                  <HashChip hash={walletAddress} kind="address" /> does not hold ADMIN_ROLE on this vault.
                  Roles are read from the wallet you are signed in with.
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
      title="Donations"
      subtitle="Campaigns, currencies, receipt tiers and bank details. Every change is a transaction on the vault."
    >
      <Head>
        <title>Donations admin · ETH Cali</title>
      </Head>

      <div>
        {/* Rule 2: the network comes first. Until the wallet is on the vault's chain
            this is the only primary action, and every button below says why it waits. */}
        {!chain.ready && (
          <div className={`${CARD} mb-6 flex flex-wrap items-center justify-between gap-3`}>
            <p className="text-sm text-content-muted">Your wallet is on another network. Every action here signs on {chain.chainName}.</p>
            <SwitchChainButton chain={chain} />
          </div>
        )}

        <header className={`${CARD} mb-6 flex flex-wrap items-center justify-between gap-3`}>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-content-primary">
              DonationVault {vault && <HashChip hash={vault} kind="address" />}
              {isSuperAdmin && (
                <span className="rounded-full bg-eth-blue-wash px-2.5 py-1 text-[10px] font-semibold text-eth-blue-text">Super admin</span>
              )}
            </p>
            <p className="mt-1 text-xs text-content-faint">
              {isPaused ? 'Paused: nobody can donate until it is resumed.' : 'Live: donations go through.'}
            </p>
          </div>
          <div>
            {isPaused ? (
              <button
                type="button"
                onClick={async () => {
                  if (await setPaused(false)) toast('Donations resumed.');
                }}
                disabled={pendingAction === 'unpause' || Boolean(blocked)}
                className={buttonClass('primary')}
              >
                {pendingAction === 'unpause' && <Spinner />}
                {pendingAction === 'unpause' ? 'Resuming…' : 'Resume donations'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAskPause(true)}
                disabled={pendingAction === 'pause' || Boolean(blocked)}
                className={buttonClass('secondary')}
              >
                {pendingAction === 'pause' && <Spinner />}
                {pendingAction === 'pause' ? 'Pausing…' : 'Pause donations'}
              </button>
            )}
            {errorFor('pause', 'unpause')}
          </div>
        </header>

        {askPause && (
          <ConfirmDialog
            title="Pause donations?"
            body="Every donation to every campaign reverts until you resume. Funds already raised stay where they are."
            confirmLabel="Pause donations"
            pendingLabel="Pausing…"
            danger
            onConfirm={async () => {
              if (await setPaused(true)) toast('Donations paused.');
            }}
            onClose={() => setAskPause(false)}
          />
        )}

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
              onClick={async () => {
                if (vault && (await addReceiptMinter(vault))) toast('The vault can mint receipts now.');
              }}
              disabled={pendingAction === 'addReceiptMinter' || Boolean(blocked)}
              className={buttonClass('primary')}
            >
              {pendingAction === 'addReceiptMinter' && <Spinner />}
              {pendingAction === 'addReceiptMinter' ? 'Granting…' : 'Grant MINTER_ROLE'}
            </button>
            {errorFor('addReceiptMinter')}
          </div>
        )}

        <div className="mb-5">
          <Tabs label="Donation admin sections" tabs={TABS} value={tab} onChange={setTab} />
        </div>

        {tab === 'campaigns' && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-content-secondary">
              {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
            </h2>
            <button type="button" onClick={() => setCreating((v) => !v)} className={buttonClass(creating ? 'secondary' : 'primary')}>
              {creating ? 'Close' : 'Create campaign'}
            </button>
          </div>
        )}

        {tab === 'campaigns' && creating && (
          <div className="mb-6 max-w-xl rounded-card border border-line-hairline bg-surface-inset/50 p-5">
            <h2 className="mb-4 text-sm font-bold text-content-primary">New campaign</h2>
            <CampaignAdminForm chainId={chainId} onCreated={() => setCreating(false)} />
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {campaigns.length === 0 && (
                <p className="text-sm text-content-faint">
                  No campaigns yet. Use “Create campaign” to begin.
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
                        <span className="text-right font-mono text-content-primary">
                          {formatToken(t.raised, t.token)}
                          <span className="ml-1 text-content-faint">≈ {format(t.raised, t.token)}</span>
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

        {tab === 'access' && <AccessManager only={['donations', 'receipts']} />}

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
                  No receipt collection deployed.
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
                      aria-label="Tier token id"
                      className={`${FIELD} w-20`}
                    />
                    <input
                      type="text"
                      value={tierForm.name}
                      onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                      placeholder="Supporter"
                      aria-label="Tier name"
                      className={FIELD}
                    />
                  </div>
                  <input
                    type="text"
                    value={tierForm.uri}
                    onChange={(e) => setTierForm({ ...tierForm, uri: e.target.value })}
                    placeholder="ipfs://…/1.json"
                    aria-label="Tier metadata URI"
                    className={`${FIELD} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (await setReceiptTier(Number(tierForm.id || 0), tierForm.name, tierForm.uri, true)) {
                        toast(`Receipt tier #${tierForm.id || 0} saved.`);
                      }
                    }}
                    disabled={!tierForm.name || !tierForm.uri || pendingAction === 'setReceiptTier' || Boolean(blocked)}
                    className={buttonClass('primary', 'w-full')}
                  >
                    {pendingAction === 'setReceiptTier' && <Spinner />}
                    {pendingAction === 'setReceiptTier' ? 'Saving…' : 'Save tier'}
                  </button>
                  {errorFor('setReceiptTier')}
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

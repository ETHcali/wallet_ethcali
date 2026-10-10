import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallets } from '@privy-io/react-auth';
import { formatEther } from 'viem';
import AdminShell from '../../components/admin/AdminShell';
import { AccessManager } from '../../components/admin/AccessManager';
import { StatTile } from '../../components/admin/StatTile';
import SwitchChainButton from '../../components/shared/SwitchChainButton';
import { VaultList } from '../../components/faucet/VaultList';
import { CreateVaultForm } from '../../components/faucet/CreateVaultForm';
import { VaultWhitelistManager } from '../../components/faucet/VaultWhitelistManager';
import { buttonClass, CARD, ConfirmDialog, FIELD, LABEL, Spinner, Tabs, useToast } from '../../components/admin/primitives';
import { HashChip } from '../../components/shared/HashChip';
import { DEFAULT_CHAIN } from '../../config/chains';
import { useRequireChain } from '../../hooks/useRequireChain';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { useFaucetManagerAdmin, useFaucetPaused, useAllVaults, useFaucetPause } from '../../hooks/faucet';
import { formatTokenBalance } from '../../utils/tokenUtils';
import { formatUsd } from '../../utils/money';
import { adminErrorMessage } from '../../utils/adminErrors';

type AdminTab = 'vaults' | 'whitelist' | 'access';

const TABS: Array<{ id: AdminTab; label: string }> = [
  { id: 'vaults', label: 'Vaults' },
  { id: 'whitelist', label: 'Whitelist' },
  { id: 'access', label: 'Access' },
];

export default function FaucetAdminPage() {
  // Every read and write below is on Ethereum; the wallet is moved once, here.
  const chainId = DEFAULT_CHAIN.id;
  const faucetManager = DEFAULT_CHAIN.contracts.FaucetManager;
  const chain = useRequireChain(chainId);

  const { ready } = useWallets();
  const { isAdmin, isSuperAdmin, isLoading: isCheckingAdmin, walletAddress } = useFaucetManagerAdmin(chainId);
  const { isPaused, isLoading: isLoadingPaused, refetch: refetchPaused } = useFaucetPaused(chainId);
  const { pause, unpause, canPause } = useFaucetPause(chainId);
  const { vaults, refetch: refetchVaults } = useAllVaults(chainId);
  const { getPriceForToken } = useTokenPrices();

  const [activeTab, setActiveTab] = useState<AdminTab>('vaults');
  const [creating, setCreating] = useState(false);
  const [selectedVaultForWhitelist, setSelectedVaultForWhitelist] = useState<number | null>(null);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [pauseError, setPauseError] = useState<string | null>(null);
  const [askPause, setAskPause] = useState(false);
  const toast = useToast();

  const handleTogglePause = async () => {
    setIsTogglingPause(true);
    setPauseError(null);
    try {
      if (isPaused) await unpause();
      else await pause();
      await refetchPaused();
      toast(isPaused ? 'Faucet live again.' : 'Faucet paused.');
    } catch (err) {
      setPauseError(adminErrorMessage(err));
    } finally {
      setIsTogglingPause(false);
    }
  };

  const ethPrice = getPriceForToken('ETH').price;
  const eth = (wei: bigint) => {
    const value = formatEther(wei);
    const usd = ethPrice > 0 ? ` (~${formatUsd(Number(value) * ethPrice, { cents: true })})` : '';
    return { value: `${formatTokenBalance(value, 4)} ETH`, usd };
  };
  const balance = eth(vaults.reduce((sum, v) => sum + v.balance, 0n));
  const claimed = eth(vaults.reduce((sum, v) => sum + v.totalClaimed, 0n));
  const activeVaults = vaults.filter((v) => v.active).length;

  if (!ready || isCheckingAdmin) {
    return (
      <AdminShell active="faucet" title="Faucet">
        <p className="py-16 text-center text-sm text-content-faint">Checking permissions…</p>
      </AdminShell>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <AdminShell active="faucet" title="Faucet">
        <div className={CARD}>
          <h2 className="font-semibold text-content-primary">Not a faucet admin</h2>
          <p className="mt-2 text-sm text-content-muted">
            {walletAddress ? (
              <>
                <HashChip hash={walletAddress} kind="address" /> does not hold ADMIN_ROLE on FaucetManager
                {faucetManager && <> <HashChip hash={faucetManager} kind="address" /></>}.
              </>
            ) : (
              'Connect an admin wallet to continue.'
            )}
          </p>
          <Link href="/admin/access" className={buttonClass('secondary', 'mt-4')}>
            See who can grant it
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      active="faucet"
      title="Faucet"
      subtitle="ETH vaults people claim from. Balances and claims are read from FaucetManager on Ethereum."
    >
      <Head>
        <title>Faucet admin · ETH Cali</title>
      </Head>

      {/* Reads work from anywhere; the wallet only has to be here to sign. */}
      {!chain.ready && (
        <div className={`${CARD} mb-6 flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-sm text-content-muted">Your wallet is on another network. Every action here signs on {chain.chainName}.</p>
          <SwitchChainButton chain={chain} />
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Faucet</p>
          <p className={`mt-1 text-xl font-bold ${isPaused ? 'text-signal-reverted' : 'text-signal-confirmed'}`}>
            {isPaused ? 'Paused' : 'Live'}
          </p>
          {canPause && (
            <button
              type="button"
              onClick={() => (isPaused ? void handleTogglePause() : setAskPause(true))}
              disabled={isLoadingPaused || isTogglingPause || !chain.ready}
              title={!chain.ready ? `Switch to ${chain.chainName} first.` : undefined}
              className={buttonClass('secondary', 'mt-2 w-full')}
            >
              {isTogglingPause && <Spinner />}
              {isTogglingPause ? (isPaused ? 'Resuming…' : 'Pausing…') : isPaused ? 'Unpause' : 'Pause'}
            </button>
          )}
          {pauseError && <p className="mt-1 text-[11px] text-signal-reverted">{pauseError}</p>}
        </div>
        <StatTile label="Balance" value={balance.value} hint={`Across every vault${balance.usd}`} />
        <StatTile label="Claimed" value={claimed.value} hint={`All time${claimed.usd}`} />
        <StatTile label="Vaults" value={`${activeVaults} / ${vaults.length}`} hint="Active / total" />
      </div>

      <div className="mb-4">
        <Tabs label="Faucet admin sections" tabs={TABS} value={activeTab} onChange={setActiveTab} />
      </div>

      {askPause && (
        <ConfirmDialog
          title="Pause the faucet?"
          body="Every claim from every vault reverts until it is unpaused. Vault balances stay where they are."
          confirmLabel="Pause faucet"
          pendingLabel="Pausing…"
          danger
          onConfirm={async () => {
            try {
              await pause();
            } catch (err) {
              // Shown inside the dialog; translated so no selector reaches the screen.
              throw new Error(adminErrorMessage(err));
            }
            await refetchPaused();
            toast('Faucet paused.');
          }}
          onClose={() => setAskPause(false)}
        />
      )}

      {activeTab === 'vaults' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-content-secondary">
              {vaults.length} vault{vaults.length === 1 ? '' : 's'}
            </h2>
            {!creating && (
              <button type="button" onClick={() => setCreating(true)} className={buttonClass('primary')}>
                Create vault
              </button>
            )}
          </div>

          {creating && (
            <div className="space-y-2">
              <div className="flex justify-end">
                <button type="button" onClick={() => setCreating(false)} className={buttonClass('secondary')}>
                  Close
                </button>
              </div>
              <CreateVaultForm
                chainId={chainId}
                onSuccess={() => {
                  refetchVaults();
                  setCreating(false);
                }}
              />
            </div>
          )}

          <VaultList chainId={chainId} />
        </div>
      )}

      {activeTab === 'whitelist' && (
        <div className="space-y-4">
          <div className={CARD}>
            <label className="block">
              <span className={LABEL}>Vault</span>
              <select
                value={selectedVaultForWhitelist ?? ''}
                onChange={(e) => setSelectedVaultForWhitelist(e.target.value ? Number(e.target.value) : null)}
                className={`${FIELD} appearance-none`}
              >
                <option value="">Choose a vault</option>
                {vaults.map((vault) => (
                  <option key={vault.id} value={vault.id}>
                    #{vault.id} {vault.name} — whitelist {vault.whitelistEnabled ? 'on' : 'off'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedVaultForWhitelist !== null && (
            <VaultWhitelistManager
              chainId={chainId}
              vault={vaults.find((v) => v.id === selectedVaultForWhitelist)!}
              onSuccess={() => refetchVaults()}
            />
          )}
        </div>
      )}

      {activeTab === 'access' && <AccessManager only={['faucet']} />}
    </AdminShell>
  );
}

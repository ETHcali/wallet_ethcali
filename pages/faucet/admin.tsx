import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import AdminShell from '../../components/admin/AdminShell';
import ChainPicker from '../../components/shared/ChainPicker';
import SwitchChainButton from '../../components/shared/SwitchChainButton';
import { VaultList } from '../../components/faucet/VaultList';
import { CreateVaultForm } from '../../components/faucet/CreateVaultForm';
import { VaultWhitelistManager } from '../../components/faucet/VaultWhitelistManager';
import { explorerAddress } from '../../config/chains';
import { useChainQuery } from '../../hooks/useChainQuery';
import { useRequireChain } from '../../hooks/useRequireChain';
import { useFaucetManagerAdmin, useFaucetPaused, useAllVaults, useFaucetPause } from '../../hooks/faucet';
import { formatEther } from 'viem';

type AdminTab = 'vaults' | 'create' | 'whitelist' | 'settings';

export default function FaucetAdminPage() {
  // This page picks its chain from the chains FaucetManager is deployed on,
  // remembered in `?chain=`. Every read and write below is on that chain.
  const { chainId, chain: chainInfo, chains, setChainId } = useChainQuery('faucet');
  const faucetManager = chainInfo.contracts.FaucetManager;
  const chain = useRequireChain(chainId);

  const { ready } = useWallets();
  const { isAdmin, isSuperAdmin, isLoading: isCheckingAdmin, walletAddress } = useFaucetManagerAdmin(chainId);
  const { isPaused, isLoading: isLoadingPaused, refetch: refetchPaused } = useFaucetPaused(chainId);
  const { pause, unpause, canPause } = useFaucetPause(chainId);
  const { vaults, refetch: refetchVaults } = useAllVaults(chainId);
  const [activeTab, setActiveTab] = useState<AdminTab>('vaults');
  const [selectedVaultForWhitelist, setSelectedVaultForWhitelist] = useState<number | null>(null);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [pauseError, setPauseError] = useState<string | null>(null);

  const handleTogglePause = async () => {
    setIsTogglingPause(true);
    setPauseError(null);
    try {
      if (isPaused) {
        await unpause();
      } else {
        await pause();
      }
      refetchPaused();
    } catch (err) {
      setPauseError(err instanceof Error ? err.message : 'Could not change the pause state.');
    } finally {
      setIsTogglingPause(false);
    }
  };

  const totalBalance = vaults.reduce((sum, v) => sum + v.balance, 0n);
  const totalClaimed = vaults.reduce((sum, v) => sum + v.totalClaimed, 0n);
  const activeVaults = vaults.filter(v => v.active).length;

  const picker = <ChainPicker chains={chains} value={chainId} onChange={setChainId} className="mb-6" />;

  if (!ready || isCheckingAdmin) {
    return (
      <AdminShell active="faucet" title="Faucet">
          {picker}
          <div className="flex items-center justify-center py-20">
            <div className="w-3 h-3 border-2 border-eth-blue border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-eth-blue-text font-mono text-[10px] tracking-wider">VERIFYING...</span>
          </div>
        </AdminShell>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <AdminShell active="faucet" title="Faucet">
          {picker}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-black/60 border border-signal-reverted/30 rounded-control p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-signal-reverted rounded-full"></div>
                <span className="text-[10px] text-signal-reverted font-mono tracking-wider">Access denied on {chainInfo.name}</span>
              </div>
              <div className="space-y-2 text-[10px] font-mono">
                <p className="text-content-faint">contract: <span className="text-content-faint">{faucetManager?.slice(0, 10)}…</span></p>
                <p className="text-content-faint">wallet: <span className="text-content-faint">{walletAddress?.slice(0, 10)}…</span></p>
              </div>
            </div>
          </div>
        </AdminShell>
    );
  }

  return (
    <AdminShell active="faucet" title="Faucet">
        {picker}

        {/* Reads work from anywhere; the wallet only has to be here to sign. */}
        {!chain.ready && (
          <div className="mb-6 max-w-sm">
            <p className="mb-2 text-xs text-content-muted">
              Reads come from {chain.chainName}; to sign anything below your wallet has to be there too.
            </p>
            <SwitchChainButton chain={chain} />
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            {isSuperAdmin && (
              <span className="text-[9px] text-signal-pending font-mono bg-signal-pending/10 px-2 py-0.5 rounded-chip">SUPER</span>
            )}
          </div>
          <p className="text-content-faint font-mono text-[10px] tracking-widest uppercase">
            VAULT_MANAGEMENT • {chainInfo.name} • {vaults.length} VAULTS
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">STATUS</p>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-signal-reverted' : 'bg-signal-confirmed'}`}></div>
              <span className={`text-xs font-mono ${isPaused ? 'text-signal-reverted' : 'text-signal-confirmed'}`}>
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>
            {canPause && (
              <button
                onClick={handleTogglePause}
                disabled={isLoadingPaused || isTogglingPause || !chain.ready}
                className={`mt-2 text-[9px] font-mono px-2 py-1 rounded-chip transition disabled:opacity-50 ${
                  isPaused
                    ? 'bg-eth-blue/10 text-eth-blue-text hover:bg-eth-blue/20'
                    : 'bg-signal-reverted/10 text-signal-reverted hover:bg-signal-reverted/20'
                }`}
              >
                {isTogglingPause ? 'SAVING…' : isPaused ? 'UNPAUSE' : 'PAUSE'}
              </button>
            )}
            {pauseError && <p className="mt-1 text-[9px] font-mono text-signal-reverted">{pauseError}</p>}
          </div>

          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">Total balance</p>
            <p className="text-sm font-mono text-eth-blue-text">
              {parseFloat(formatEther(totalBalance)).toFixed(4)}
            </p>
            <p className="text-[9px] text-content-faint font-mono">ETH</p>
          </div>

          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">CLAIMED</p>
            <p className="text-sm font-mono text-eth-blue-text">
              {parseFloat(formatEther(totalClaimed)).toFixed(4)}
            </p>
            <p className="text-[9px] text-content-faint font-mono">ETH</p>
          </div>

          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">VAULTS</p>
            <p className="text-sm font-mono text-content-primary">
              {activeVaults}<span className="text-content-faint">/{vaults.length}</span>
            </p>
            <p className="text-[9px] text-content-faint font-mono">ACTIVE</p>
          </div>
        </div>

        {/* Admin Functions Reference */}
        <div className="bg-black/40 border border-line-hairline rounded-chip p-3 mb-6">
          <p className="text-[9px] text-content-faint font-mono tracking-wider mb-2">Admin functions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="text-content-faint">
              <span className="text-eth-blue-text">addAdmin</span>(addr)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">removeAdmin</span>(addr)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">createVault</span>(...)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">setNFTContract</span>(addr)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">addToWhitelist</span>(vaultId, addr)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">removeFromWhitelist</span>(vaultId, addr)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">setWhitelistEnabled</span>(vaultId, bool)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">addBatchToWhitelist</span>(vaultId, addrs[])
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(['vaults', 'create', 'whitelist', 'settings'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded-chip transition-all ${
                activeTab === tab
                  ? 'bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40'
                  : 'text-content-faint hover:text-content-muted border border-transparent'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'vaults' && (
            <VaultList chainId={chainId} />
          )}

          {activeTab === 'create' && (
            <CreateVaultForm chainId={chainId} onSuccess={refetchVaults} />
          )}

          {activeTab === 'whitelist' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Select vault</p>
                <select
                  value={selectedVaultForWhitelist ?? ''}
                  onChange={(e) => setSelectedVaultForWhitelist(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary focus:border-eth-blue/50 focus:outline-none"
                >
                  <option value="">-- Select Vault --</option>
                  {vaults.map((vault) => (
                    <option key={vault.id} value={vault.id}>
                      [{vault.id}] {vault.name} {vault.whitelistEnabled ? '(Whitelist ON)' : '(Whitelist OFF)'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVaultForWhitelist !== null && (
                <VaultWhitelistManager
                  chainId={chainId}
                  vault={vaults.find(v => v.id === selectedVaultForWhitelist)!}
                  onSuccess={() => {
                    refetchVaults();
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Contract Info */}
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">CONTRACT</p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-content-faint">address</span>
                    {faucetManager && (
                      <a
                        href={explorerAddress(chainId, faucetManager)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-eth-blue-text hover:text-eth-blue-text"
                      >
                        {faucetManager.slice(0, 10)}…{faucetManager.slice(-8)}
                      </a>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-faint">network</span>
                    <span className="text-content-muted">{chainInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-faint">your_wallet</span>
                    <span className="text-content-muted">{walletAddress?.slice(0, 10)}…{walletAddress?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-faint">role</span>
                    <span className={isSuperAdmin ? 'text-signal-pending' : 'text-eth-blue-text'}>
                      {isSuperAdmin ? 'Super admin' : 'ADMIN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Management Placeholder */}
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Admin management</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      className="flex-1 bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary placeholder-content-faint focus:border-eth-blue/50 focus:outline-none"
                    />
                    <button className="px-3 py-2 bg-eth-blue/10 border border-eth-blue/30 rounded-chip text-eth-blue-text text-[10px] font-mono hover:bg-eth-blue/20 transition">
                      ADD
                    </button>
                    <button className="px-3 py-2 bg-signal-reverted/10 border border-signal-reverted/30 rounded-chip text-signal-reverted text-[10px] font-mono hover:bg-signal-reverted/20 transition">
                      REMOVE
                    </button>
                  </div>
                  <p className="text-[9px] text-content-faint font-mono">Enter address to add/remove admin</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {faucetManager && (
          <div className="mt-6 pt-4 border-t border-line-hairline">
            <div className="flex gap-2 text-[9px] font-mono text-content-faint">
              <a href={explorerAddress(chainId, faucetManager)} target="_blank" rel="noopener noreferrer" className="hover:text-eth-blue-text">
                VIEW_CONTRACT →
              </a>
            </div>
          </div>
        )}
      </AdminShell>
  );
}

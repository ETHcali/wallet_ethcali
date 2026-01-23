import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import { VaultList } from '../../components/faucet/VaultList';
import { CreateVaultForm } from '../../components/faucet/CreateVaultForm';
import { VaultWhitelistManager } from '../../components/faucet/VaultWhitelistManager';
import { useSwagAddresses } from '../../utils/network';
import { useFaucetManagerAdmin, useFaucetPaused, useAllVaults, useFaucetPause } from '../../hooks/faucet';
import { formatEther } from 'viem';

type AdminTab = 'vaults' | 'create' | 'whitelist' | 'settings';

export default function FaucetAdminPage() {
  const { chainId, faucetManager, explorerUrl } = useSwagAddresses();
  const { ready } = useWallets();
  const { isAdmin, isSuperAdmin, isLoading: isCheckingAdmin, walletAddress } = useFaucetManagerAdmin();
  const { isPaused, isLoading: isLoadingPaused, refetch: refetchPaused } = useFaucetPaused();
  const { pause, unpause, canPause } = useFaucetPause();
  const { vaults, refetch: refetchVaults } = useAllVaults();
  const [activeTab, setActiveTab] = useState<AdminTab>('vaults');
  const [selectedVaultForWhitelist, setSelectedVaultForWhitelist] = useState<number | null>(null);

  const handleTogglePause = async () => {
    try {
      if (isPaused) {
        await unpause();
      } else {
        await pause();
      }
      refetchPaused();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle pause state');
    }
  };

  const totalBalance = vaults.reduce((sum, v) => sum + v.balance, 0n);
  const totalClaimed = vaults.reduce((sum, v) => sum + v.totalClaimed, 0n);
  const activeVaults = vaults.filter(v => v.active).length;

  if (!ready || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation currentChainId={chainId} />
        <Layout>
          <div className="flex items-center justify-center py-20">
            <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-cyan-400 font-mono text-[10px] tracking-wider">VERIFYING...</span>
          </div>
        </Layout>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation currentChainId={chainId} />
        <Layout>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-black/60 border border-red-500/30 rounded-lg p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-[10px] text-red-400 font-mono tracking-wider">ACCESS_DENIED</span>
              </div>
              <div className="space-y-2 text-[10px] font-mono">
                <p className="text-gray-500">contract: <span className="text-gray-600">{faucetManager?.slice(0, 10)}...</span></p>
                <p className="text-gray-500">wallet: <span className="text-gray-600">{walletAddress?.slice(0, 10)}...</span></p>
              </div>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation currentChainId={chainId} />
      <Layout>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h1 className="text-lg font-bold text-orange-400 font-mono tracking-wider">
              FAUCET_ADMIN
            </h1>
            {isSuperAdmin && (
              <span className="text-[9px] text-yellow-400 font-mono bg-yellow-500/10 px-2 py-0.5 rounded">SUPER</span>
            )}
          </div>
          <p className="text-gray-600 font-mono text-[10px] tracking-widest uppercase">
            VAULT_MANAGEMENT • {vaults.length} VAULTS
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">STATUS</p>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className={`text-xs font-mono ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>
            {canPause && (
              <button
                onClick={handleTogglePause}
                disabled={isLoadingPaused}
                className={`mt-2 text-[9px] font-mono px-2 py-1 rounded transition ${
                  isPaused
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {isPaused ? 'UNPAUSE' : 'PAUSE'}
              </button>
            )}
          </div>

          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">TOTAL_BAL</p>
            <p className="text-sm font-mono text-green-400">
              {parseFloat(formatEther(totalBalance)).toFixed(4)}
            </p>
            <p className="text-[9px] text-gray-700 font-mono">ETH</p>
          </div>

          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">CLAIMED</p>
            <p className="text-sm font-mono text-cyan-400">
              {parseFloat(formatEther(totalClaimed)).toFixed(4)}
            </p>
            <p className="text-[9px] text-gray-700 font-mono">ETH</p>
          </div>

          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">VAULTS</p>
            <p className="text-sm font-mono text-white">
              {activeVaults}<span className="text-gray-600">/{vaults.length}</span>
            </p>
            <p className="text-[9px] text-gray-700 font-mono">ACTIVE</p>
          </div>
        </div>

        {/* Admin Functions Reference */}
        <div className="bg-black/40 border border-gray-800 rounded p-3 mb-6">
          <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-2">ADMIN_FUNCTIONS</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
            <div className="text-gray-600">
              <span className="text-orange-400">addAdmin</span>(addr)
            </div>
            <div className="text-gray-600">
              <span className="text-orange-400">removeAdmin</span>(addr)
            </div>
            <div className="text-gray-600">
              <span className="text-orange-400">createVault</span>(...)
            </div>
            <div className="text-gray-600">
              <span className="text-orange-400">setNFTContract</span>(addr)
            </div>
            <div className="text-gray-600">
              <span className="text-cyan-400">addToWhitelist</span>(vaultId, addr)
            </div>
            <div className="text-gray-600">
              <span className="text-cyan-400">removeFromWhitelist</span>(vaultId, addr)
            </div>
            <div className="text-gray-600">
              <span className="text-cyan-400">setWhitelistEnabled</span>(vaultId, bool)
            </div>
            <div className="text-gray-600">
              <span className="text-cyan-400">addBatchToWhitelist</span>(vaultId, addrs[])
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(['vaults', 'create', 'whitelist', 'settings'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded transition-all ${
                activeTab === tab
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'text-gray-600 hover:text-gray-400 border border-transparent'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'vaults' && (
            <VaultList />
          )}

          {activeTab === 'create' && (
            <CreateVaultForm onSuccess={refetchVaults} />
          )}

          {activeTab === 'whitelist' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-gray-800 rounded p-4">
                <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">SELECT_VAULT</p>
                <select
                  value={selectedVaultForWhitelist ?? ''}
                  onChange={(e) => setSelectedVaultForWhitelist(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-[10px] font-mono text-gray-300 focus:border-orange-500/50 focus:outline-none"
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
              <div className="bg-black/60 border border-gray-800 rounded p-4">
                <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">CONTRACT</p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-600">address</span>
                    <a
                      href={`${explorerUrl}/address/${faucetManager}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {faucetManager?.slice(0, 10)}...{faucetManager?.slice(-8)}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">your_wallet</span>
                    <span className="text-gray-400">{walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">role</span>
                    <span className={isSuperAdmin ? 'text-yellow-400' : 'text-green-400'}>
                      {isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Management Placeholder */}
              <div className="bg-black/60 border border-gray-800 rounded p-4">
                <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">ADMIN_MANAGEMENT</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      className="flex-1 bg-black/40 border border-gray-700 rounded px-3 py-2 text-[10px] font-mono text-gray-300 placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
                    />
                    <button className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-[10px] font-mono hover:bg-green-500/20 transition">
                      ADD
                    </button>
                    <button className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-[10px] font-mono hover:bg-red-500/20 transition">
                      REMOVE
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-600 font-mono">Enter address to add/remove admin</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex gap-2 text-[9px] font-mono text-gray-700">
            <a href={`${explorerUrl}/address/${faucetManager}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">
              VIEW_CONTRACT →
            </a>
          </div>
        </div>
      </Layout>
    </div>
  );
}

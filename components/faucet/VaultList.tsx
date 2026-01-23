import { useState } from 'react';
import { formatEther } from 'viem';
import { useAllVaults } from '../../hooks/faucet';
import { Vault, VaultType } from '../../types/faucet';
import { VaultEditModal } from './VaultEditModal';
import { VaultDepositWithdraw } from './VaultDepositWithdraw';

const vaultTypeLabels: Record<VaultType, string> = {
  [VaultType.NonReturnable]: 'Non-Returnable',
  [VaultType.Returnable]: 'Returnable',
};

const vaultTypeColors: Record<VaultType, string> = {
  [VaultType.NonReturnable]: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  [VaultType.Returnable]: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export function VaultList() {
  const { vaults, isLoading, error, refetch } = useAllVaults();
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [depositWithdrawVault, setDepositWithdrawVault] = useState<Vault | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading vaults...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading vaults: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-center text-slate-400">No vaults found. Create your first vault above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">All Vaults</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vaults.map((vault) => (
          <div
            key={vault.id}
            className={`rounded-xl border p-5 transition ${
              vault.active
                ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                : 'border-slate-800 bg-slate-900/30 opacity-70'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{vault.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{vault.description}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${vaultTypeColors[vault.vaultType]}`}>
                {vaultTypeLabels[vault.vaultType]}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-slate-900/60 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Balance</p>
                <p className="text-lg font-mono text-green-400">
                  {parseFloat(formatEther(vault.balance)).toFixed(4)} ETH
                </p>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Claim Amount</p>
                <p className="text-lg font-mono text-cyan-400">
                  {parseFloat(formatEther(vault.claimAmount)).toFixed(4)} ETH
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="flex gap-4 text-xs text-slate-500 mb-4">
              <span>
                Claimed: <span className="text-white">{parseFloat(formatEther(vault.totalClaimed)).toFixed(4)}</span> ETH
              </span>
              {vault.vaultType === VaultType.Returnable && (
                <span>
                  Returned: <span className="text-white">{parseFloat(formatEther(vault.totalReturned)).toFixed(4)}</span> ETH
                </span>
              )}
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between border-t border-slate-700 pt-4">
              <div className="flex flex-col gap-1">
                <span className={`inline-flex items-center gap-1.5 text-xs ${vault.active ? 'text-green-400' : 'text-red-400'}`}>
                  <span className={`h-2 w-2 rounded-full ${vault.active ? 'bg-green-400' : 'bg-red-400'}`} />
                  {vault.active ? 'Active' : 'Inactive'}
                </span>
                {vault.whitelistEnabled && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400">
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    Whitelist Enabled
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDepositWithdrawVault(vault)}
                  className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition"
                >
                  Deposit/Withdraw
                </button>
                <button
                  onClick={() => setEditingVault(vault)}
                  className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingVault && (
        <VaultEditModal
          vault={editingVault}
          onClose={() => setEditingVault(null)}
          onSuccess={() => {
            setEditingVault(null);
            refetch();
          }}
        />
      )}

      {depositWithdrawVault && (
        <VaultDepositWithdraw
          vault={depositWithdrawVault}
          onClose={() => setDepositWithdrawVault(null)}
          onSuccess={() => {
            setDepositWithdrawVault(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

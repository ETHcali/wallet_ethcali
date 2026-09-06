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
  [VaultType.NonReturnable]: 'bg-eth-blue/10 text-eth-blue-text border-eth-blue/30',
  [VaultType.Returnable]: 'bg-eth-blue/10 text-eth-blue-text border-eth-blue/30',
};

export function VaultList() {
  const { vaults, isLoading, error, refetch } = useAllVaults();
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [depositWithdrawVault, setDepositWithdrawVault] = useState<Vault | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-card border border-line-hairline bg-surface-slab/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-eth-blue border-t-transparent" />
          <span className="ml-3 text-content-muted">Loading vaults...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-signal-reverted/40 bg-signal-reverted/10 p-6">
        <p className="text-signal-reverted">Error loading vaults: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm text-eth-blue-text hover:text-eth-blue-text"
        >
          Retry
        </button>
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="rounded-card border border-line-hairline bg-surface-slab/60 p-6">
        <p className="text-center text-content-muted">No vaults found. Create your first vault above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-content-primary">All Vaults</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-eth-blue-text hover:text-eth-blue-text transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vaults.map((vault) => (
          <div
            key={vault.id}
            className={`rounded-card border p-5 transition ${
              vault.active
                ? 'border-line-hairline bg-surface-inset/50 hover:border-line-strong'
                : 'border-line-hairline bg-surface-slab/30 opacity-70'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-content-primary">{vault.name}</h3>
                <p className="text-sm text-content-muted line-clamp-2">{vault.description}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${vaultTypeColors[vault.vaultType]}`}>
                {vaultTypeLabels[vault.vaultType]}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-control bg-surface-slab/60 p-3">
                <p className="text-xs text-content-faint uppercase tracking-wider">Balance</p>
                <p className="text-lg font-mono text-eth-blue-text">
                  {parseFloat(formatEther(vault.balance)).toFixed(4)} ETH
                </p>
              </div>
              <div className="rounded-control bg-surface-slab/60 p-3">
                <p className="text-xs text-content-faint uppercase tracking-wider">Claim Amount</p>
                <p className="text-lg font-mono text-eth-blue-text">
                  {parseFloat(formatEther(vault.claimAmount)).toFixed(4)} ETH
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="flex gap-4 text-xs text-content-faint mb-4">
              <span>
                Claimed: <span className="text-content-primary">{parseFloat(formatEther(vault.totalClaimed)).toFixed(4)}</span> ETH
              </span>
              {vault.vaultType === VaultType.Returnable && (
                <span>
                  Returned: <span className="text-content-primary">{parseFloat(formatEther(vault.totalReturned)).toFixed(4)}</span> ETH
                </span>
              )}
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between border-t border-line-hairline pt-4">
              <div className="flex flex-col gap-1">
                <span className={`inline-flex items-center gap-1.5 text-xs ${vault.active ? 'text-signal-confirmed' : 'text-content-faint'}`}>
                  <span className={`h-2 w-2 rounded-full ${vault.active ? 'bg-signal-confirmed' : 'bg-content-faint'}`} />
                  {vault.active ? 'Active' : 'Inactive'}
                </span>
                {vault.whitelistEnabled && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-signal-pending">
                    <span className="h-2 w-2 rounded-full bg-signal-pending" />
                    Whitelist Enabled
                  </span>
                )}
                {vault.zkPassportRequired && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-eth-blue-text">
                    <span className="h-2 w-2 rounded-full bg-eth-blue" />
                    ZKPassport Required
                  </span>
                )}
                {vault.allowedToken !== '0x0000000000000000000000000000000000000000' && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-eth-blue-text">
                    <span className="h-2 w-2 rounded-full bg-eth-blue" />
                    Token Gated
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDepositWithdrawVault(vault)}
                  className="rounded-control border border-eth-blue/30 bg-eth-blue/10 px-3 py-1.5 text-xs font-medium text-eth-blue-text hover:bg-eth-blue/20 transition"
                >
                  Deposit/Withdraw
                </button>
                <button
                  onClick={() => setEditingVault(vault)}
                  className="rounded-control border border-line-strong bg-surface-ridge px-3 py-1.5 text-xs font-medium text-content-primary hover:bg-surface-ridge transition"
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

import { useState } from 'react';
import { formatEther } from 'viem';
import { useUpdateVault } from '../../hooks/faucet';
import { Vault, VaultType } from '../../types/faucet';

interface VaultEditModalProps {
  vault: Vault;
  onClose: () => void;
  onSuccess: () => void;
}

const vaultTypeLabels: Record<VaultType, string> = {
  [VaultType.NonReturnable]: 'Non-Returnable',
  [VaultType.Returnable]: 'Returnable',
};

export function VaultEditModal({ vault, onClose, onSuccess }: VaultEditModalProps) {
  const { updateVault, canUpdate } = useUpdateVault();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: vault.name,
    description: vault.description,
    claimAmount: formatEther(vault.claimAmount),
    active: vault.active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Please enter a vault name');
      return;
    }

    const claimAmount = parseFloat(form.claimAmount);
    if (isNaN(claimAmount) || claimAmount <= 0) {
      setError('Please enter a valid claim amount');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateVault({
        vaultId: vault.id,
        name: form.name,
        description: form.description,
        claimAmount: form.claimAmount,
        active: form.active,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vault');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Vault</h2>
            <p className="text-sm text-slate-500">
              Vault #{vault.id} - {vaultTypeLabels[vault.vaultType]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-slate-400">Vault Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-400">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-400">Claim Amount (ETH)</label>
            <input
              type="number"
              min="0"
              step="0.001"
              value={form.claimAmount}
              onChange={(e) => setForm({ ...form, claimAmount: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4">
            <div>
              <p className="text-white font-medium">Active Status</p>
              <p className="text-xs text-slate-500">
                {form.active ? 'Users can claim from this vault' : 'Vault is paused'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.active ? 'bg-green-500' : 'bg-slate-600'
              }`}
              disabled={isSubmitting}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  form.active ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Read-only vault stats */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Vault Stats (Read-only)</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Balance</p>
                <p className="text-green-400 font-mono">{parseFloat(formatEther(vault.balance)).toFixed(4)} ETH</p>
              </div>
              <div>
                <p className="text-slate-500">Total Claimed</p>
                <p className="text-white font-mono">{parseFloat(formatEther(vault.totalClaimed)).toFixed(4)} ETH</p>
              </div>
              {vault.vaultType === VaultType.Returnable && (
                <div>
                  <p className="text-slate-500">Total Returned</p>
                  <p className="text-cyan-400 font-mono">{parseFloat(formatEther(vault.totalReturned)).toFixed(4)} ETH</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 text-white hover:bg-slate-700 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canUpdate}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

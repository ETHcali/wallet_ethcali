import { useState } from 'react';
import { useCreateVault } from '../../hooks/faucet';
import { VaultType, VaultFormData } from '../../types/faucet';

interface CreateVaultFormProps {
  onSuccess?: () => void;
}

export function CreateVaultForm({ onSuccess }: CreateVaultFormProps) {
  const { createVault, canCreate } = useCreateVault();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<VaultFormData>({
    name: '',
    description: '',
    claimAmount: '0.01',
    vaultType: VaultType.NonReturnable,
    whitelistEnabled: false,
    zkPassportRequired: false,
    allowedToken: '0x0000000000000000000000000000000000000000',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
      await createVault(form);
      setSuccess(true);
      setForm({
        name: '',
        description: '',
        claimAmount: '0.01',
        vaultType: VaultType.NonReturnable,
        whitelistEnabled: false,
        zkPassportRequired: false,
        allowedToken: '0x0000000000000000000000000000000000000000',
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vault');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Create New Vault</h2>
        <p className="text-sm text-slate-500">Configure a new faucet vault for distributing ETH</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm text-slate-400">Vault Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="e.g., ETH Cali Main Faucet"
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
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="0.01"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-slate-400">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
          placeholder="Brief description of this vault's purpose..."
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-slate-400">Vault Type</label>
        <div className="flex gap-4">
          <label
            className={`flex-1 cursor-pointer rounded-lg border p-4 transition ${
              form.vaultType === VaultType.NonReturnable
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <input
              type="radio"
              name="vaultType"
              value={VaultType.NonReturnable}
              checked={form.vaultType === VaultType.NonReturnable}
              onChange={() => setForm({ ...form, vaultType: VaultType.NonReturnable })}
              className="sr-only"
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                form.vaultType === VaultType.NonReturnable
                  ? 'border-purple-400'
                  : 'border-slate-500'
              }`}>
                {form.vaultType === VaultType.NonReturnable && (
                  <div className="h-2 w-2 rounded-full bg-purple-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">Non-Returnable</p>
                <p className="text-xs text-slate-500">One-time claims, no returns expected</p>
              </div>
            </div>
          </label>

          <label
            className={`flex-1 cursor-pointer rounded-lg border p-4 transition ${
              form.vaultType === VaultType.Returnable
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <input
              type="radio"
              name="vaultType"
              value={VaultType.Returnable}
              checked={form.vaultType === VaultType.Returnable}
              onChange={() => setForm({ ...form, vaultType: VaultType.Returnable })}
              className="sr-only"
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                form.vaultType === VaultType.Returnable
                  ? 'border-blue-400'
                  : 'border-slate-500'
              }`}>
                {form.vaultType === VaultType.Returnable && (
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">Returnable</p>
                <p className="text-xs text-slate-500">Users can return funds after use</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.whitelistEnabled}
            onChange={(e) => setForm({ ...form, whitelistEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-900"
            disabled={isSubmitting}
          />
          <div>
            <p className="font-medium text-white">Enable Whitelist</p>
            <p className="text-xs text-slate-500">Restrict claims to whitelisted addresses only</p>
          </div>
        </label>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.zkPassportRequired}
            onChange={(e) => setForm({ ...form, zkPassportRequired: e.target.checked })}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-400 focus:ring-offset-slate-900"
            disabled={isSubmitting}
          />
          <div>
            <p className="font-medium text-white">Require ZKPassport NFT</p>
            <p className="text-xs text-slate-500">Only ZKPassport NFT holders can claim</p>
          </div>
        </label>
      </div>

      {(form.zkPassportRequired || form.allowedToken !== '0x0000000000000000000000000000000000000000') && (
        <div className="space-y-2">
          <label className="block text-sm text-slate-400">Required Token/NFT Address</label>
          <input
            type="text"
            value={form.allowedToken}
            onChange={(e) => setForm({ ...form, allowedToken: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono text-sm"
            placeholder="0x..."
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500">Set to 0x0...0 to disable</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3">
          <p className="text-sm text-green-300">Vault created successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !canCreate}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3 font-medium text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? 'Creating Vault...' : 'Create Vault'}
      </button>
    </form>
  );
}

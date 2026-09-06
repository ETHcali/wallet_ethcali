import { useState } from 'react';
import { formatEther } from 'viem';
import { useUpdateVault, useUpdateVaultGating } from '../../hooks/faucet';
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
  const { updateVaultGating, canUpdateGating } = useUpdateVaultGating();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGatingSubmitting, setIsGatingSubmitting] = useState(false);
  const [gatingError, setGatingError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: vault.name,
    description: vault.description,
    claimAmount: formatEther(vault.claimAmount),
    active: vault.active,
  });

  const [gatingForm, setGatingForm] = useState({
    zkPassportRequired: vault.zkPassportRequired,
    allowedToken: vault.allowedToken,
  });

  const handleGatingSubmit = async () => {
    setGatingError(null);
    setIsGatingSubmitting(true);

    try {
      await updateVaultGating(vault.id, gatingForm.zkPassportRequired, gatingForm.allowedToken);
      onSuccess();
    } catch (err) {
      setGatingError(err instanceof Error ? err.message : 'Failed to update gating');
    } finally {
      setIsGatingSubmitting(false);
    }
  };

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
      <div className="w-full max-w-md rounded-card border border-line-hairline bg-surface-slab p-6 ">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-content-primary">Edit Vault</h2>
            <p className="text-sm text-content-faint">
              Vault #{vault.id} - {vaultTypeLabels[vault.vaultType]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-primary transition"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-content-muted">Vault Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-content-muted">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-content-muted">Claim Amount (ETH)</label>
            <input
              type="number"
              min="0"
              step="0.001"
              value={form.claimAmount}
              onChange={(e) => setForm({ ...form, claimAmount: e.target.value })}
              className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between rounded-control border border-line-hairline bg-surface-inset p-4">
            <div>
              <p className="text-content-primary font-medium">Active Status</p>
              <p className="text-xs text-content-faint">
                {form.active ? 'Users can claim from this vault' : 'Vault is paused'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.active ? 'bg-eth-blue' : 'bg-surface-ridge'
              }`}
              disabled={isSubmitting}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-paper transition-transform ${
                  form.active ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Gating Settings */}
          <div className="rounded-control border border-line-hairline bg-surface-inset/50 p-4 space-y-4">
            <p className="text-xs text-content-faint uppercase tracking-wider">Gating Settings</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-content-primary font-medium">Require ZKPassport</p>
                <p className="text-xs text-content-faint">Only ZKPassport NFT holders can claim</p>
              </div>
              <button
                type="button"
                onClick={() => setGatingForm({ ...gatingForm, zkPassportRequired: !gatingForm.zkPassportRequired })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  gatingForm.zkPassportRequired ? 'bg-eth-blue' : 'bg-surface-ridge'
                }`}
                disabled={isGatingSubmitting}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-paper transition-transform ${
                    gatingForm.zkPassportRequired ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-content-muted">Allowed Token/NFT Address</label>
              <input
                type="text"
                value={gatingForm.allowedToken}
                onChange={(e) => setGatingForm({ ...gatingForm, allowedToken: e.target.value })}
                className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary font-mono text-sm focus:border-eth-blue focus:outline-none"
                placeholder="0x..."
                disabled={isGatingSubmitting}
              />
              <p className="text-xs text-content-faint">Set to 0x0...0 to disable token gating</p>
            </div>

            {gatingError && (
              <div className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3">
                <p className="text-sm text-signal-reverted">{gatingError}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGatingSubmit}
              disabled={isGatingSubmitting || !canUpdateGating}
              className="w-full rounded-control border border-line-strong bg-surface-inset hover:border-line-brand py-2.5 text-sm font-medium text-content-primary hover:opacity-90 disabled:opacity-50 transition"
            >
              {isGatingSubmitting ? 'Updating Gating...' : 'Save Gating'}
            </button>
          </div>

          {/* Read-only vault stats */}
          <div className="rounded-control border border-line-hairline bg-surface-inset/50 p-4 space-y-2">
            <p className="text-xs text-content-faint uppercase tracking-wider">Vault Stats (Read-only)</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-content-faint">Balance</p>
                <p className="text-eth-blue-text font-mono">{parseFloat(formatEther(vault.balance)).toFixed(4)} ETH</p>
              </div>
              <div>
                <p className="text-content-faint">Total Claimed</p>
                <p className="text-content-primary font-mono">{parseFloat(formatEther(vault.totalClaimed)).toFixed(4)} ETH</p>
              </div>
              {vault.vaultType === VaultType.Returnable && (
                <div>
                  <p className="text-content-faint">Total Returned</p>
                  <p className="text-eth-blue-text font-mono">{parseFloat(formatEther(vault.totalReturned)).toFixed(4)} ETH</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3">
              <p className="text-sm text-signal-reverted">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-control border border-line-strong bg-surface-inset py-3 text-content-primary hover:bg-surface-ridge transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canUpdate}
              className="flex-1 rounded-control bg-eth-blue hover:bg-eth-blue-lift py-3 font-medium text-content-primary hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

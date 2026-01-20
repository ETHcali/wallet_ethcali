import { useState } from 'react';
import { AdminVariant, useUpdateVariant } from '../../hooks/useSwagAdmin';
import { getIPFSGatewayUrl } from '../../lib/pinata';

interface AdminProductEditModalProps {
  variant: AdminVariant;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminProductEditModal({ variant, onClose, onSuccess }: AdminProductEditModalProps) {
  const { updateVariant, canUpdate } = useUpdateVariant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    price: variant.price.toString(),
    maxSupply: variant.maxSupply.toString(),
    active: variant.active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = parseFloat(form.price);
    const maxSupply = parseInt(form.maxSupply, 10);

    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }

    if (isNaN(maxSupply) || maxSupply < variant.minted) {
      setError(`Max supply must be at least ${variant.minted} (already minted)`);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateVariant(variant.tokenId, price, maxSupply, form.active);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {variant.metadata?.image && (
              <img
                src={getIPFSGatewayUrl(variant.metadata.image)}
                alt={variant.metadata?.name || 'Product'}
                className="h-16 w-16 rounded-lg object-cover border border-slate-700"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {variant.metadata?.name || `Token ${variant.tokenId.toString().slice(-6)}`}
              </h2>
              <p className="text-sm text-slate-500 font-mono">
                ID: {variant.tokenId.toString()}
              </p>
            </div>
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
            <label className="block text-sm text-slate-400">Price (USDC)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-400">Max Supply</label>
            <input
              type="number"
              min={variant.minted}
              value={form.maxSupply}
              onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500">
              {variant.minted} already minted. Minimum: {variant.minted}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4">
            <div>
              <p className="text-white font-medium">Active Status</p>
              <p className="text-xs text-slate-500">
                {form.active ? 'Product is visible and purchasable' : 'Product is hidden'}
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

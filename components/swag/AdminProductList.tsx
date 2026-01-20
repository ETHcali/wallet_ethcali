import { useState } from 'react';
import { useAllVariants, AdminVariant } from '../../hooks/useSwagAdmin';
import { AdminProductEditModal } from './AdminProductEditModal';
import { getIPFSGatewayUrl } from '../../lib/pinata';

export function AdminProductList() {
  const { variants, isLoading, error, refetch } = useAllVariants();
  const [editingVariant, setEditingVariant] = useState<AdminVariant | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading products: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-center text-slate-400">No products found. Create your first product above.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Manage Products</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Token ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price (USDC)</th>
              <th className="px-4 py-3">Supply</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {variants.map((variant) => (
              <tr key={variant.tokenId.toString()} className="hover:bg-slate-800/50 transition">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-slate-400">
                    #{variant.tokenId.toString().slice(-6)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {variant.metadata?.image && (
                      <img
                        src={getIPFSGatewayUrl(variant.metadata.image)}
                        alt={variant.metadata?.name || 'Product'}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-700"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {variant.metadata?.name || `Token ${variant.tokenId.toString().slice(-6)}`}
                      </p>
                      {variant.metadata?.attributes?.find(a => a.trait_type === 'Size') && (
                        <span className="text-xs text-slate-500">
                          Size: {variant.metadata.attributes.find(a => a.trait_type === 'Size')?.value}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-green-400 font-mono">${variant.price.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <span className="text-white">{variant.minted}</span>
                    <span className="text-slate-500"> / {variant.maxSupply}</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${(variant.minted / variant.maxSupply) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {variant.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingVariant(variant)}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700 transition"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingVariant && (
        <AdminProductEditModal
          variant={editingVariant}
          onClose={() => setEditingVariant(null)}
          onSuccess={() => {
            setEditingVariant(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

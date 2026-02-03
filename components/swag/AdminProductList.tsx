import { useState } from 'react';
import { useTokenIds, useVariant, useVariantUri, useSetVariant } from '../../hooks/swag';
import { AdminProductEditModal } from './AdminProductEditModal';
import { CreateProductModal } from './CreateProductModal';
import { useSwagAddresses } from '../../utils/network';

function VariantCard({ contractAddress, chainId, tokenId, onEdit }: {
  contractAddress: string;
  chainId: number;
  tokenId: number;
  onEdit: () => void;
}) {
  const { variant, isLoading, refetch } = useVariant(contractAddress, chainId, tokenId);
  const { uri } = useVariantUri(contractAddress, chainId, tokenId);
  const { setVariant, canSet } = useSetVariant(contractAddress, chainId);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!variant || !canSet) return;
    setIsToggling(true);
    try {
      await setVariant(tokenId, variant.price, variant.maxSupply, !variant.active);
      await refetch();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to toggle');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading || !variant) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-1/3" />
      </div>
    );
  }

  const price = Number(variant.price) / 1e6;
  const minted = Number(variant.minted);
  const maxSupply = Number(variant.maxSupply);
  const remaining = maxSupply - minted;

  return (
    <div className={`rounded-xl border p-5 transition ${
      variant.active ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : 'border-slate-800 bg-slate-900/30 opacity-70'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white font-mono">Token #{tokenId}</h3>
          {uri && <p className="text-xs text-slate-500 truncate max-w-[200px]">{uri}</p>}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          variant.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${variant.active ? 'bg-green-400' : 'bg-red-400'}`} />
          {variant.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-slate-900/60 p-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Price</p>
          <p className="text-lg font-mono text-green-400">${price.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-slate-900/60 p-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Supply</p>
          <p className="text-lg font-mono text-cyan-400">{minted}/{maxSupply}</p>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-4">{remaining} remaining</div>

      <div className="flex gap-2 border-t border-slate-700 pt-3">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 transition"
        >
          Edit
        </button>
        <button
          onClick={handleToggle}
          disabled={!canSet || isToggling}
          className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            variant.active
              ? 'border-red-600 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'border-green-600 bg-green-500/10 text-green-400 hover:bg-green-500/20'
          }`}
        >
          {isToggling ? 'Updating...' : variant.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
}

function CreateProductButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-pink-500/20 hover:opacity-90 transition"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create Product
    </button>
  );
}

export function AdminProductList() {
  const { swag1155, chainId } = useSwagAddresses();
  const { tokenIds, isLoading, error, refetch } = useTokenIds(swag1155 || '', chainId);
  const [editingTokenId, setEditingTokenId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading variants...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading variants: {error}</p>
        <button onClick={() => refetch()} className="mt-3 text-sm text-cyan-400 hover:text-cyan-300">Retry</button>
      </div>
    );
  }

  if (tokenIds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-slate-800 p-4">
              <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Products Yet</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              Create your first product variant to start selling swag. You will need a Token ID, price, supply, and metadata URI.
            </p>
            <CreateProductButton onClick={() => setIsCreating(true)} />
          </div>
        </div>

        {isCreating && swag1155 && (
          <CreateProductModal
            contractAddress={swag1155}
            chainId={chainId}
            onClose={() => setIsCreating(false)}
            onSuccess={() => {
              setIsCreating(false);
              refetch();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Product Variants</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="text-sm text-cyan-400 hover:text-cyan-300 transition">Refresh</button>
          <CreateProductButton onClick={() => setIsCreating(true)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tokenIds.map((tokenId) => (
          <VariantCard
            key={tokenId}
            contractAddress={swag1155 || ''}
            chainId={chainId}
            tokenId={tokenId}
            onEdit={() => setEditingTokenId(tokenId)}
          />
        ))}
      </div>

      {editingTokenId !== null && swag1155 && (
        <AdminProductEditModal
          tokenId={editingTokenId}
          contractAddress={swag1155}
          chainId={chainId}
          onClose={() => setEditingTokenId(null)}
          onSuccess={() => {
            setEditingTokenId(null);
            refetch();
          }}
        />
      )}

      {isCreating && swag1155 && (
        <CreateProductModal
          contractAddress={swag1155}
          chainId={chainId}
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

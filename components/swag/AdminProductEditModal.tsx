import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  useUpdateDesignInfo,
  useUpdateDesignDiscountConfig,
  useSetDesignPrice,
  useSetDesignTotalSupply,
} from '../../hooks/swag';
import { useDesignInfo, useDesignDiscountConfig } from '../../hooks/useSwagStore';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import type { DesignInfo, DiscountConfig, DiscountType } from '../../types/swag';

interface AdminProductEditModalProps {
  designAddress: string;
  chainId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminProductEditModal({ designAddress, chainId, onClose, onSuccess }: AdminProductEditModalProps) {
  const { designInfo, isLoading: isLoadingDesign } = useDesignInfo(designAddress, chainId);
  const { discountConfig, isLoading: isLoadingDiscount } = useDesignDiscountConfig(designAddress, chainId);
  const { updateDesignInfo, canUpdate: canUpdateInfo } = useUpdateDesignInfo(designAddress, chainId);
  const { updateDiscountConfig, canUpdate: canUpdateDiscount } = useUpdateDesignDiscountConfig(designAddress, chainId);
  const { setPrice, canSet: canSetPrice } = useSetDesignPrice(designAddress, chainId);
  const { setTotalSupply, canSet: canSetSupply } = useSetDesignTotalSupply(designAddress, chainId);

  const [activeTab, setActiveTab] = useState<'info' | 'discount'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Design Info form state
  const [designForm, setDesignForm] = useState<Partial<DesignInfo>>({});
  // Discount form state
  const [discountForm, setDiscountForm] = useState<Partial<DiscountConfig>>({});

  // Initialize forms when data loads
  useEffect(() => {
    if (designInfo) {
      setDesignForm({
        name: designInfo.name,
        description: designInfo.description,
        imageUrl: designInfo.imageUrl,
        website: designInfo.website,
        gender: designInfo.gender,
        color: designInfo.color,
        style: designInfo.style,
      });
    }
  }, [designInfo]);

  useEffect(() => {
    if (discountConfig) {
      setDiscountForm({
        smartContractEnabled: discountConfig.smartContractEnabled,
        smartContractAddress: discountConfig.smartContractAddress,
        smartContractDiscount: discountConfig.smartContractDiscount,
        poapEnabled: discountConfig.poapEnabled,
        poapEventId: discountConfig.poapEventId,
        poapDiscount: discountConfig.poapDiscount,
        discountType: discountConfig.discountType,
      });
    }
  }, [discountConfig]);

  const handleUpdateDesignInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designInfo) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const updatedDesignInfo: DesignInfo = {
        ...designInfo,
        ...designForm,
        name: designForm.name || designInfo.name,
        description: designForm.description || designInfo.description,
        imageUrl: designForm.imageUrl || designInfo.imageUrl,
        website: designForm.website || designInfo.website,
        gender: designForm.gender || designInfo.gender,
        color: designForm.color || designInfo.color,
        style: designForm.style || designInfo.style,
      };

      await updateDesignInfo(updatedDesignInfo);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update Design info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!designInfo) return;
    const priceInput = (document.getElementById('price-input') as HTMLInputElement)?.value;
    if (!priceInput) return;

    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await setPrice(price);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSupply = async () => {
    if (!designInfo) return;
    const supplyInput = (document.getElementById('supply-input') as HTMLInputElement)?.value;
    if (!supplyInput) return;

    const supply = parseInt(supplyInput, 10);
    const minted = Number(designInfo.minted);
    if (isNaN(supply) || supply < minted) {
      setError(`Supply must be at least ${minted} (already minted)`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await setTotalSupply(supply);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update supply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountConfig) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const updatedDiscount: DiscountConfig = {
        ...discountConfig,
        ...discountForm,
        smartContractEnabled: discountForm.smartContractEnabled ?? discountConfig.smartContractEnabled,
        smartContractAddress: discountForm.smartContractAddress || discountConfig.smartContractAddress,
        smartContractDiscount: discountForm.smartContractDiscount ?? discountConfig.smartContractDiscount,
        poapEnabled: discountForm.poapEnabled ?? discountConfig.poapEnabled,
        poapEventId: discountForm.poapEventId ?? discountConfig.poapEventId,
        poapDiscount: discountForm.poapDiscount ?? discountConfig.poapDiscount,
        discountType: discountForm.discountType ?? discountConfig.discountType,
      };

      await updateDiscountConfig(updatedDiscount);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update discount config');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDesign || isLoadingDiscount) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!designInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-red-300">Design not found</div>
      </div>
    );
  }

  const imageUrl = getIPFSGatewayUrl(designInfo.imageUrl || '') || '/logo_eth_cali.png';
  const currentPrice = Number(designInfo.pricePerUnit) / 1_000_000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-700">
              <Image
                src={imageUrl}
                alt={designInfo.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{designInfo.name}</h2>
              <p className="text-sm text-slate-500 font-mono">Design: {designAddress.slice(0, 10)}...</p>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'info'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Design Info
          </button>
          <button
            onClick={() => setActiveTab('discount')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'discount'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Discounts
          </button>
        </div>

        {activeTab === 'info' && (
          <form onSubmit={handleUpdateDesignInfo} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Name</label>
                <input
                  type="text"
                  value={designForm.name || ''}
                  onChange={(e) => setDesignForm({ ...designForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Image URL</label>
                <input
                  type="text"
                  value={designForm.imageUrl || ''}
                  onChange={(e) => setDesignForm({ ...designForm, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="ipfs://... or https://..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-400">Description</label>
              <textarea
                value={designForm.description || ''}
                onChange={(e) => setDesignForm({ ...designForm, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-400">Website</label>
              <input
                type="text"
                value={designForm.website || ''}
                onChange={(e) => setDesignForm({ ...designForm, website: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Gender</label>
                <input
                  type="text"
                  value={designForm.gender || ''}
                  onChange={(e) => setDesignForm({ ...designForm, gender: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="Male, Female, Unisex"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Color</label>
                <input
                  type="text"
                  value={designForm.color || ''}
                  onChange={(e) => setDesignForm({ ...designForm, color: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Style</label>
                <input
                  type="text"
                  value={designForm.style || ''}
                  onChange={(e) => setDesignForm({ ...designForm, style: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Quick price and supply updates */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Price (USDC)</label>
                <div className="flex gap-2">
                  <input
                    id="price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={currentPrice.toFixed(2)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    disabled={isSubmitting || !canSetPrice}
                  />
                  <button
                    type="button"
                    onClick={handleUpdatePrice}
                    disabled={isSubmitting || !canSetPrice}
                    className="px-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Total Supply</label>
                <div className="flex gap-2">
                  <input
                    id="supply-input"
                    type="number"
                    min={Number(designInfo.minted)}
                    defaultValue={Number(designInfo.totalSupply).toString()}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    disabled={isSubmitting || !canSetSupply}
                  />
                  <button
                    type="button"
                    onClick={handleUpdateSupply}
                    disabled={isSubmitting || !canSetSupply}
                    className="px-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
                <p className="text-xs text-slate-500">{Number(designInfo.minted)} already minted</p>
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
                disabled={isSubmitting || !canUpdateInfo}
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Updating...' : 'Save Design Info'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'discount' && discountConfig && (
          <form onSubmit={handleUpdateDiscount} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Discount Type</label>
                <select
                  value={discountForm.discountType ?? discountConfig.discountType}
                  onChange={(e) => setDiscountForm({ ...discountForm, discountType: Number(e.target.value) as DiscountType })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <option value={0}>Percentage (basis points)</option>
                  <option value={1}>Fixed Amount</option>
                </select>
              </div>

              {/* POAP Discount */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">POAP Discount</label>
                  <button
                    type="button"
                    onClick={() => setDiscountForm({ ...discountForm, poapEnabled: !discountForm.poapEnabled })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      discountForm.poapEnabled ?? discountConfig.poapEnabled ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                    disabled={isSubmitting}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                        discountForm.poapEnabled ?? discountConfig.poapEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                {(discountForm.poapEnabled ?? discountConfig.poapEnabled) && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="block text-xs text-slate-400">POAP Event ID</label>
                      <input
                        type="number"
                        min="0"
                        value={discountForm.poapEventId?.toString() || discountConfig.poapEventId.toString()}
                        onChange={(e) => setDiscountForm({ ...discountForm, poapEventId: BigInt(e.target.value) })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-slate-400">
                        Discount {discountForm.discountType === 0 ? '(basis points)' : '(USDC units)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountForm.poapDiscount?.toString() || discountConfig.poapDiscount.toString()}
                        onChange={(e) => setDiscountForm({ ...discountForm, poapDiscount: BigInt(e.target.value) })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Contract Discount */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Smart Contract Discount</label>
                  <button
                    type="button"
                    onClick={() => setDiscountForm({ ...discountForm, smartContractEnabled: !discountForm.smartContractEnabled })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      discountForm.smartContractEnabled ?? discountConfig.smartContractEnabled ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                    disabled={isSubmitting}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                        discountForm.smartContractEnabled ?? discountConfig.smartContractEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                {(discountForm.smartContractEnabled ?? discountConfig.smartContractEnabled) && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="block text-xs text-slate-400">Contract Address</label>
                      <input
                        type="text"
                        value={discountForm.smartContractAddress || discountConfig.smartContractAddress}
                        onChange={(e) => setDiscountForm({ ...discountForm, smartContractAddress: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none"
                        placeholder="0x..."
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-slate-400">
                        Discount {discountForm.discountType === 0 ? '(basis points)' : '(USDC units)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountForm.smartContractDiscount?.toString() || discountConfig.smartContractDiscount.toString()}
                        onChange={(e) => setDiscountForm({ ...discountForm, smartContractDiscount: BigInt(e.target.value) })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        disabled={isSubmitting}
                      />
                    </div>
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
                disabled={isSubmitting || !canUpdateDiscount}
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Updating...' : 'Save Discount Config'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

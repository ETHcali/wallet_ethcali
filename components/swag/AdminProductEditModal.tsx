import { useState } from 'react';
import { useVariant, useVariantUri, useSetVariant, useSetVariantWithURI } from '../../hooks/swag';
import { useRoyalties, useTotalRoyaltyBps, useAddRoyalty, useClearRoyalties } from '../../hooks/swag';
import { usePoapDiscounts, useHolderDiscounts, useAddPoapDiscount, useRemovePoapDiscount, useAddHolderDiscount, useRemoveHolderDiscount } from '../../hooks/swag';
import { DiscountType } from '../../types/swag';

interface AdminProductEditModalProps {
  tokenId: number;
  contractAddress: string;
  chainId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminProductEditModal({ tokenId, contractAddress, chainId, onClose, onSuccess }: AdminProductEditModalProps) {
  const { variant, isLoading: isLoadingVariant } = useVariant(contractAddress, chainId, tokenId);
  const { uri: currentUri } = useVariantUri(contractAddress, chainId, tokenId);
  const { setVariant, canSet } = useSetVariant(contractAddress, chainId);
  const { setVariantWithURI } = useSetVariantWithURI(contractAddress, chainId);
  const { royalties, isLoading: isLoadingRoyalties, refetch: refetchRoyalties } = useRoyalties(contractAddress, chainId, tokenId);
  const { totalBps, refetch: refetchBps } = useTotalRoyaltyBps(contractAddress, chainId, tokenId);
  const { addRoyalty, canAdd } = useAddRoyalty(contractAddress, chainId);
  const { clearRoyalties, canClear } = useClearRoyalties(contractAddress, chainId);

  // Discount hooks
  const { poapDiscounts, isLoading: isLoadingPoapDiscounts, refetch: refetchPoapDiscounts } = usePoapDiscounts(contractAddress, chainId, tokenId);
  const { holderDiscounts, isLoading: isLoadingHolderDiscounts, refetch: refetchHolderDiscounts } = useHolderDiscounts(contractAddress, chainId, tokenId);
  const { addPoapDiscount, canAdd: canAddPoap } = useAddPoapDiscount(contractAddress, chainId);
  const { removePoapDiscount } = useRemovePoapDiscount(contractAddress, chainId);
  const { addHolderDiscount, canAdd: canAddHolder } = useAddHolderDiscount(contractAddress, chainId);
  const { removeHolderDiscount } = useRemoveHolderDiscount(contractAddress, chainId);

  const [activeTab, setActiveTab] = useState<'variant' | 'royalties' | 'discounts'>('variant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Variant form
  const [priceInput, setPriceInput] = useState('');
  const [maxSupplyInput, setMaxSupplyInput] = useState('');
  const [activeInput, setActiveInput] = useState(true);
  const [uriInput, setUriInput] = useState('');
  const [formInitialized, setFormInitialized] = useState(false);

  // Initialize form when variant data loads
  if (variant && !formInitialized) {
    setPriceInput((Number(variant.price) / 1e6).toFixed(2));
    setMaxSupplyInput(Number(variant.maxSupply).toString());
    setActiveInput(variant.active);
    setUriInput(currentUri || '');
    setFormInitialized(true);
  }

  // Royalty form
  const [royaltyRecipient, setRoyaltyRecipient] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('');

  // POAP discount form
  const [poapEventId, setPoapEventId] = useState('');
  const [poapDiscountPct, setPoapDiscountPct] = useState('');

  // Holder discount form
  const [holderToken, setHolderToken] = useState('');
  const [holderDiscountType, setHolderDiscountType] = useState<DiscountType>(DiscountType.Percentage);
  const [holderValue, setHolderValue] = useState('');

  const handleSaveVariant = async () => {
    setError(null);
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) { setError('Invalid price'); return; }
    const maxSupply = parseInt(maxSupplyInput, 10);
    if (isNaN(maxSupply) || maxSupply < 0) { setError('Invalid max supply'); return; }

    setIsSubmitting(true);
    try {
      const priceBigInt = BigInt(Math.round(price * 1e6));
      const maxSupplyBigInt = BigInt(maxSupply);
      if (uriInput && uriInput !== currentUri) {
        await setVariantWithURI(tokenId, priceBigInt, maxSupplyBigInt, activeInput, uriInput);
      } else {
        await setVariant(tokenId, priceBigInt, maxSupplyBigInt, activeInput);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update variant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRoyalty = async () => {
    setError(null);
    if (!royaltyRecipient.trim()) { setError('Enter recipient address'); return; }
    const pct = parseFloat(royaltyPercentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) { setError('Percentage must be between 0 and 100'); return; }
    const bps = Math.round(pct * 100); // 5% = 500 bps

    setIsSubmitting(true);
    try {
      await addRoyalty(tokenId, royaltyRecipient.trim(), bps);
      setRoyaltyRecipient('');
      setRoyaltyPercentage('');
      refetchRoyalties();
      refetchBps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add royalty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearRoyalties = async () => {
    if (!confirm('Clear all royalties for this token?')) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await clearRoyalties(tokenId);
      refetchRoyalties();
      refetchBps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear royalties');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVariant) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const treasuryShare = 100 - totalBps / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Token #{tokenId}</h2>
            <p className="text-sm text-slate-500 font-mono">{contractAddress.slice(0, 10)}...</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('variant')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'variant' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Variant Info
          </button>
          <button
            onClick={() => setActiveTab('royalties')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'royalties' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Royalties
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'discounts' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Discounts
          </button>
        </div>

        {activeTab === 'variant' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Price (USDC)</label>
                <input type="number" min="0" step="0.01" value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Max Supply</label>
                <input type="number" min="0" value={maxSupplyInput}
                  onChange={(e) => setMaxSupplyInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  disabled={isSubmitting} />
                {variant && <p className="text-xs text-slate-500">{Number(variant.minted)} already minted</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-400">Metadata URI</label>
              <input type="text" value={uriInput}
                onChange={(e) => setUriInput(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                placeholder="ipfs://... or https://..."
                disabled={isSubmitting} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4">
              <div>
                <p className="text-white font-medium">Active Status</p>
                <p className="text-xs text-slate-500">{activeInput ? 'Available for purchase' : 'Not available'}</p>
              </div>
              <button type="button" onClick={() => setActiveInput(!activeInput)}
                className={`relative h-6 w-11 rounded-full transition-colors ${activeInput ? 'bg-green-500' : 'bg-slate-600'}`}
                disabled={isSubmitting}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${activeInput ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 text-white hover:bg-slate-700 transition"
                disabled={isSubmitting}>Cancel</button>
              <button onClick={handleSaveVariant} disabled={isSubmitting || !canSet}
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 transition">
                {isSubmitting ? 'Saving...' : 'Save Variant'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'royalties' && (
          <div className="space-y-4">
            {/* Treasury share */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-white font-medium">Treasury Share</p>
                  <p className="text-xs text-slate-500">Remaining after royalty splits</p>
                </div>
                <p className="text-2xl font-mono text-green-400">{treasuryShare.toFixed(1)}%</p>
              </div>
            </div>

            {/* Current royalties */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Current Royalties</p>
              {isLoadingRoyalties ? (
                <p className="text-xs text-slate-500">Loading...</p>
              ) : royalties.length === 0 ? (
                <p className="text-xs text-slate-500">No royalties configured</p>
              ) : (
                <div className="space-y-2">
                  {royalties.map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
                      <span className="text-xs font-mono text-slate-300">{r.recipient.slice(0, 10)}...{r.recipient.slice(-6)}</span>
                      <span className="text-sm font-mono text-cyan-400">{Number(r.percentage) / 100}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add royalty form */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
              <p className="text-sm text-white font-medium">Add Royalty</p>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs text-slate-400">Recipient Address</label>
                  <input type="text" value={royaltyRecipient}
                    onChange={(e) => setRoyaltyRecipient(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none"
                    placeholder="0x..." disabled={isSubmitting} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400">Percentage (%)</label>
                  <input type="number" min="0" max="100" step="0.01" value={royaltyPercentage}
                    onChange={(e) => setRoyaltyPercentage(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="5" disabled={isSubmitting} />
                </div>
              </div>
              <button onClick={handleAddRoyalty} disabled={isSubmitting || !canAdd}
                className="w-full rounded-lg bg-cyan-500/10 border border-cyan-500/30 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20 transition disabled:opacity-50">
                {isSubmitting ? 'Adding...' : 'Add Royalty'}
              </button>
            </div>

            {/* Clear all */}
            {royalties.length > 0 && (
              <button onClick={handleClearRoyalties} disabled={isSubmitting || !canClear}
                className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                {isSubmitting ? 'Clearing...' : 'Clear All Royalties'}
              </button>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discounts' && (
          <div className="space-y-6">
            {/* POAP Discounts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">POAP Discounts</p>
              {isLoadingPoapDiscounts ? (
                <p className="text-xs text-slate-500">Loading...</p>
              ) : poapDiscounts.length === 0 ? (
                <p className="text-xs text-slate-500">No POAP discounts configured</p>
              ) : (
                <div className="space-y-2">
                  {poapDiscounts.map((d, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-300">Event #{d.eventId.toString()}</span>
                        <span className="text-sm font-mono text-cyan-400">{Number(d.discountBps) / 100}%</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${d.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-500'}`}>
                          {d.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          setIsSubmitting(true);
                          setError(null);
                          try {
                            await removePoapDiscount(tokenId, i);
                            refetchPoapDiscounts();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to remove');
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        disabled={isSubmitting}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add POAP discount form */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
                <p className="text-sm text-white font-medium">Add POAP Discount</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400">Event ID</label>
                    <input type="number" min="0" value={poapEventId}
                      onChange={(e) => setPoapEventId(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none"
                      placeholder="12345" disabled={isSubmitting} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400">Discount (%)</label>
                    <input type="number" min="0" max="100" step="0.01" value={poapDiscountPct}
                      onChange={(e) => setPoapDiscountPct(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      placeholder="10" disabled={isSubmitting} />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setError(null);
                    const eventId = parseInt(poapEventId, 10);
                    if (isNaN(eventId) || eventId < 0) { setError('Enter a valid event ID'); return; }
                    const pct = parseFloat(poapDiscountPct);
                    if (isNaN(pct) || pct <= 0 || pct > 100) { setError('Discount must be between 0 and 100'); return; }
                    const bps = BigInt(Math.round(pct * 100));
                    setIsSubmitting(true);
                    try {
                      await addPoapDiscount(tokenId, BigInt(eventId), bps);
                      setPoapEventId('');
                      setPoapDiscountPct('');
                      refetchPoapDiscounts();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to add POAP discount');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting || !canAddPoap}
                  className="w-full rounded-lg bg-cyan-500/10 border border-cyan-500/30 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add POAP Discount'}
                </button>
              </div>
            </div>

            {/* Holder Discounts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Holder Discounts</p>
              {isLoadingHolderDiscounts ? (
                <p className="text-xs text-slate-500">Loading...</p>
              ) : holderDiscounts.length === 0 ? (
                <p className="text-xs text-slate-500">No holder discounts configured</p>
              ) : (
                <div className="space-y-2">
                  {holderDiscounts.map((d, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-300">{d.token.slice(0, 10)}...{d.token.slice(-6)}</span>
                        <span className="text-sm font-mono text-cyan-400">
                          {d.discountType === DiscountType.Percentage
                            ? `${Number(d.value) / 100}%`
                            : `$${(Number(d.value) / 1e6).toFixed(2)}`}
                        </span>
                        <span className="text-xs text-slate-400">
                          {d.discountType === DiscountType.Percentage ? 'Pct' : 'Fixed'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${d.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-500'}`}>
                          {d.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          setIsSubmitting(true);
                          setError(null);
                          try {
                            await removeHolderDiscount(tokenId, i);
                            refetchHolderDiscounts();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to remove');
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        disabled={isSubmitting}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Holder discount form */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
                <p className="text-sm text-white font-medium">Add Holder Discount</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400">Token Address</label>
                    <input type="text" value={holderToken}
                      onChange={(e) => setHolderToken(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none"
                      placeholder="0x..." disabled={isSubmitting} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-400">Type</label>
                      <select
                        value={holderDiscountType}
                        onChange={(e) => setHolderDiscountType(Number(e.target.value) as DiscountType)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        disabled={isSubmitting}
                      >
                        <option value={DiscountType.Percentage}>Percentage (%)</option>
                        <option value={DiscountType.Fixed}>Fixed (USDC)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-400">
                        {holderDiscountType === DiscountType.Percentage ? 'Discount (%)' : 'Discount (USDC)'}
                      </label>
                      <input type="number" min="0" step={holderDiscountType === DiscountType.Percentage ? '0.01' : '0.01'} value={holderValue}
                        onChange={(e) => setHolderValue(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        placeholder={holderDiscountType === DiscountType.Percentage ? '10' : '1.00'}
                        disabled={isSubmitting} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setError(null);
                    if (!holderToken.trim()) { setError('Enter token address'); return; }
                    const val = parseFloat(holderValue);
                    if (isNaN(val) || val <= 0) { setError('Enter a valid value'); return; }
                    let onChainValue: bigint;
                    if (holderDiscountType === DiscountType.Percentage) {
                      if (val > 100) { setError('Percentage must be <= 100'); return; }
                      onChainValue = BigInt(Math.round(val * 100)); // bps
                    } else {
                      onChainValue = BigInt(Math.round(val * 1e6)); // USDC base units
                    }
                    setIsSubmitting(true);
                    try {
                      await addHolderDiscount(tokenId, holderToken.trim(), holderDiscountType, onChainValue);
                      setHolderToken('');
                      setHolderValue('');
                      refetchHolderDiscounts();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to add holder discount');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting || !canAddHolder}
                  className="w-full rounded-lg bg-cyan-500/10 border border-cyan-500/30 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Holder Discount'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

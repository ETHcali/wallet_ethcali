import { useState, useEffect, useRef, useCallback } from 'react';
import { useVariant, useVariantUri, useSetVariant, useSetVariantWithURI } from '../../hooks/swag';
import { useRoyalties, useTotalRoyaltyBps, useAddRoyalty, useClearRoyalties } from '../../hooks/swag';
import { usePoapDiscounts, useHolderDiscounts, useAddPoapDiscount, useRemovePoapDiscount, useAddHolderDiscount, useRemoveHolderDiscount } from '../../hooks/swag';
import { DiscountType } from '../../types/swag';
import type { Swag1155Metadata, Swag1155MetadataAttribute, GenderOption } from '../../types/swag';
import { pinImageToIPFS, pinMetadataToIPFS, getIPFSGatewayUrl } from '../../lib/pinata';

const GENDER_OPTIONS: GenderOption[] = ['Male', 'Female', 'Unisex'];

interface AdminProductEditModalProps {
  tokenId: number;
  contractAddress: string;
  chainId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminProductEditModal({ tokenId, contractAddress, chainId, onClose, onSuccess }: AdminProductEditModalProps) {
  const { variant, isLoading: isLoadingVariant } = useVariant(contractAddress, chainId, tokenId);
  const { uri: currentUri, refetch: refetchUri } = useVariantUri(contractAddress, chainId, tokenId);
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

  const [activeTab, setActiveTab] = useState<'variant' | 'metadata' | 'royalties' | 'discounts'>('variant');
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

  // Metadata form state
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadataName, setMetadataName] = useState('');
  const [metadataDescription, setMetadataDescription] = useState('');
  const [metadataImageUri, setMetadataImageUri] = useState('');
  const [metadataGender, setMetadataGender] = useState<GenderOption>('Unisex');
  const [metadataColor, setMetadataColor] = useState('');
  const [metadataStyle, setMetadataStyle] = useState('');
  const [metadataSize, setMetadataSize] = useState('');
  const [metadataProduct, setMetadataProduct] = useState('');
  const [metadataInitialized, setMetadataInitialized] = useState(false);
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [metadataProgress, setMetadataProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch metadata when tab is opened or URI changes
  useEffect(() => {
    if (activeTab === 'metadata' && currentUri && !metadataInitialized) {
      setMetadataLoading(true);
      setMetadataError(null);
      const gatewayUrl = getIPFSGatewayUrl(currentUri);
      fetch(gatewayUrl)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch metadata');
          return res.json();
        })
        .then((data: Swag1155Metadata) => {
          setMetadataName(data.name || '');
          setMetadataDescription(data.description || '');
          setMetadataImageUri(data.image || '');
          // Parse attributes
          if (data.attributes) {
            for (const attr of data.attributes) {
              if (attr.trait_type === 'Gender') setMetadataGender(attr.value as GenderOption);
              if (attr.trait_type === 'Color') setMetadataColor(attr.value);
              if (attr.trait_type === 'Style') setMetadataStyle(attr.value);
              if (attr.trait_type === 'Size') setMetadataSize(attr.value);
              if (attr.trait_type === 'Product') setMetadataProduct(attr.value);
            }
          }
          setMetadataInitialized(true);
        })
        .catch(err => {
          setMetadataError(err instanceof Error ? err.message : 'Failed to load metadata');
        })
        .finally(() => {
          setMetadataLoading(false);
        });
    }
  }, [activeTab, currentUri, metadataInitialized]);

  const handleFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Only PNG, JPG, or WebP images are accepted');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setNewImageBase64(result);
      setNewImagePreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSaveMetadata = async () => {
    setError(null);
    if (!metadataName.trim()) { setError('Name is required'); return; }
    if (!metadataDescription.trim()) { setError('Description is required'); return; }

    setIsSubmitting(true);
    try {
      let finalImageUri = metadataImageUri;

      // Upload new image if provided
      if (newImageBase64) {
        setMetadataProgress('Uploading new image...');
        finalImageUri = await pinImageToIPFS(newImageBase64, `${metadataName.trim().replace(/\s+/g, '-').toLowerCase()}.png`);
      }

      // Build attributes array
      const attributes: Swag1155MetadataAttribute[] = [];
      if (metadataProduct.trim()) attributes.push({ trait_type: 'Product', value: metadataProduct.trim() });
      if (metadataColor.trim()) attributes.push({ trait_type: 'Color', value: metadataColor.trim() });
      if (metadataGender) attributes.push({ trait_type: 'Gender', value: metadataGender });
      if (metadataStyle.trim()) attributes.push({ trait_type: 'Style', value: metadataStyle.trim() });
      if (metadataSize.trim()) attributes.push({ trait_type: 'Size', value: metadataSize.trim() });

      const metadata: Swag1155Metadata = {
        name: metadataName.trim(),
        description: metadataDescription.trim(),
        image: finalImageUri,
        attributes: attributes.length > 0 ? attributes : undefined,
      };

      setMetadataProgress('Uploading metadata to IPFS...');
      const newUri = await pinMetadataToIPFS(metadata);

      setMetadataProgress('Updating on-chain URI...');
      const price = parseFloat(priceInput) || Number(variant?.price || 0) / 1e6;
      const maxSupply = parseInt(maxSupplyInput, 10) || Number(variant?.maxSupply || 0);
      const priceBigInt = BigInt(Math.round(price * 1e6));
      const maxSupplyBigInt = BigInt(maxSupply);
      await setVariantWithURI(tokenId, priceBigInt, maxSupplyBigInt, activeInput, newUri);

      // Reset state
      setNewImageBase64(null);
      setNewImagePreview(null);
      setMetadataImageUri(finalImageUri);
      setUriInput(newUri);
      refetchUri();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metadata');
    } finally {
      setIsSubmitting(false);
      setMetadataProgress('');
    }
  };

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
  const imagePreviewUrl = newImagePreview || (metadataImageUri ? getIPFSGatewayUrl(metadataImageUri) : null);

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
        <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('variant')}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'variant' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Variant Info
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'metadata' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Metadata
          </button>
          <button
            onClick={() => setActiveTab('royalties')}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'royalties' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Royalties
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
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
              <p className="text-xs text-slate-500">Use the Metadata tab for a rich editing experience</p>
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

        {activeTab === 'metadata' && (
          <div className="space-y-5">
            {metadataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span className="ml-3 text-slate-400">Loading metadata...</span>
              </div>
            ) : metadataError && !metadataInitialized ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-sm text-red-300">{metadataError}</p>
                <p className="text-xs text-slate-500 mt-2">You can still fill in new metadata below.</p>
              </div>
            ) : null}

            {/* Image */}
            <div className="space-y-2">
              <label className="block text-sm text-slate-400">Image</label>
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 cursor-pointer transition ${
                  imagePreviewUrl ? 'border-cyan-500/50 bg-slate-800/50' : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                }`}
              >
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <>
                    <svg className="h-8 w-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-slate-400">Click or drag to upload new image</p>
                  </>
                )}
                {newImagePreview && (
                  <span className="absolute top-2 right-2 rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">New</span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-slate-600">Click to replace. Max 5MB, PNG/JPG/WebP</p>
            </div>

            {/* Name & Description */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Name</label>
                <input
                  type="text"
                  value={metadataName}
                  onChange={e => setMetadataName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="ETH Cali Tee — M"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">Product Name</label>
                <input
                  type="text"
                  value={metadataProduct}
                  onChange={e => setMetadataProduct(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="ETH Cali Tee"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-400">Description</label>
              <textarea
                value={metadataDescription}
                onChange={e => setMetadataDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-cyan-400 focus:outline-none resize-none"
                placeholder="Premium cotton tee from ETH Cali 2025"
                disabled={isSubmitting}
              />
            </div>

            {/* Traits */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">Traits</p>
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Gender</label>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setMetadataGender(g)}
                      disabled={isSubmitting}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                        metadataGender === g
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400">Color</label>
                  <input
                    type="text"
                    value={metadataColor}
                    onChange={e => setMetadataColor(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="Black"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400">Style</label>
                  <input
                    type="text"
                    value={metadataStyle}
                    onChange={e => setMetadataStyle(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="Classic"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400">Size</label>
                  <input
                    type="text"
                    value={metadataSize}
                    onChange={e => setMetadataSize(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="M"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Progress / Error */}
            {metadataProgress && (
              <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <p className="text-sm text-cyan-300">{metadataProgress}</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 text-white hover:bg-slate-700 transition"
                disabled={isSubmitting}>Cancel</button>
              <button onClick={handleSaveMetadata} disabled={isSubmitting || !canSet}
                className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 py-3 font-medium text-white shadow-lg shadow-pink-500/20 hover:opacity-90 disabled:opacity-50 transition">
                {isSubmitting ? 'Saving...' : 'Save Metadata'}
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

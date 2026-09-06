import { useState, useRef, useCallback } from 'react';
import { useSetVariantWithURI } from '../../hooks/swag';
import { pinImageToIPFS, pinMetadataToIPFS } from '../../lib/pinata';
import type { SizeOption, GenderOption, Swag1155Metadata, Swag1155MetadataAttribute } from '../../types/swag';

const SIZE_OPTIONS: { key: SizeOption; label: string; offset: number }[] = [
  { key: 'S', label: 'S', offset: 1 },
  { key: 'M', label: 'M', offset: 2 },
  { key: 'L', label: 'L', offset: 3 },
  { key: 'XL', label: 'XL', offset: 4 },
  { key: 'NA', label: 'One Size', offset: 5 },
];

const GENDER_OPTIONS: GenderOption[] = ['Male', 'Female', 'Unisex'];

interface SizeConfig {
  enabled: boolean;
  maxSupply: string;
}

type SizeState = Record<SizeOption, SizeConfig>;

const initialSizes: SizeState = {
  S: { enabled: false, maxSupply: '' },
  M: { enabled: false, maxSupply: '' },
  L: { enabled: false, maxSupply: '' },
  XL: { enabled: false, maxSupply: '' },
  NA: { enabled: false, maxSupply: '' },
};

export function CreateProductModal({ contractAddress, chainId, onClose, onSuccess }: {
  contractAddress: string;
  chainId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { setVariantWithURI, canSet } = useSetVariantWithURI(contractAddress, chainId);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState<GenderOption>('Unisex');
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('');
  const [baseId, setBaseId] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState<SizeState>(initialSizes);
  const [active, setActive] = useState(true);

  // Image
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      setImageBase64(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const toggleSize = (key: SizeOption) => {
    setSizes(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const setSizeSupply = (key: SizeOption, value: string) => {
    setSizes(prev => ({
      ...prev,
      [key]: { ...prev[key], maxSupply: value },
    }));
  };

  const enabledSizes = SIZE_OPTIONS.filter(s => sizes[s.key].enabled);
  const totalSupply = enabledSizes.reduce((sum, s) => {
    const val = parseInt(sizes[s.key].maxSupply, 10);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!name.trim()) { setError('Product name is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    if (!imageBase64) { setError('Please upload an image'); return; }
    if (!color.trim()) { setError('Color is required'); return; }
    if (!style.trim()) { setError('Style is required'); return; }

    const baseIdNum = parseInt(baseId, 10);
    if (isNaN(baseIdNum) || baseIdNum < 0) { setError('Enter a valid base Token ID'); return; }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) { setError('Enter a valid price in USDC'); return; }

    if (enabledSizes.length === 0) { setError('Select at least one size'); return; }

    for (const s of enabledSizes) {
      const supply = parseInt(sizes[s.key].maxSupply, 10);
      if (isNaN(supply) || supply <= 0) {
        setError(`Max supply for size ${s.label} must be greater than 0`);
        return;
      }
    }

    setIsSubmitting(true);
    const priceBigInt = BigInt(Math.round(priceNum * 1e6));

    try {
      // 1. Upload image
      setProgress('Uploading image to IPFS...');
      const imageUri = await pinImageToIPFS(imageBase64, `${name.trim().replace(/\s+/g, '-').toLowerCase()}.png`);

      // 2. For each size, build metadata and create variant
      for (const sizeOpt of enabledSizes) {
        const supply = parseInt(sizes[sizeOpt.key].maxSupply, 10);
        const tokenId = baseIdNum * 10 + sizeOpt.offset;
        const sizeName = sizeOpt.key === 'NA' ? name.trim() : `${name.trim()} — ${sizeOpt.label}`;

        setProgress(`Uploading metadata for ${sizeOpt.label}...`);
        const attributes: Swag1155MetadataAttribute[] = [
          { trait_type: 'Product', value: name.trim() },
          { trait_type: 'Color', value: color.trim() },
          { trait_type: 'Gender', value: gender },
          { trait_type: 'Style', value: style.trim() },
          { trait_type: 'Size', value: sizeOpt.key },
        ];
        const metadata: Swag1155Metadata = {
          name: sizeName,
          description: description.trim(),
          image: imageUri,
          attributes,
        };
        const metadataUri = await pinMetadataToIPFS(metadata);

        setProgress(`Creating variant #${tokenId} (${sizeOpt.label})...`);
        await setVariantWithURI(tokenId, priceBigInt, BigInt(supply), active, metadataUri);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
      setProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-card border border-line-hairline bg-surface-slab p-6 ">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-content-primary">Create Product</h2>
            <p className="text-sm text-content-faint">Fill in product details, upload an image, and create on-chain variants</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-content-muted hover:text-content-primary transition">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* A. Product Info */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-content-secondary uppercase tracking-wider">Product Info</h3>
            <div className="space-y-2">
              <label className="block text-sm text-content-muted">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none"
                placeholder="ETH Cali Tee"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-content-muted">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none resize-none"
                placeholder="Premium cotton tee from ETH Cali 2025"
                disabled={isSubmitting}
              />
            </div>
          </section>

          {/* B. Image Upload */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-content-secondary uppercase tracking-wider">Image</h3>
            <div
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={`relative flex flex-col items-center justify-center rounded-card border-2 border-dashed p-6 cursor-pointer transition ${
                imagePreview ? 'border-eth-blue/50 bg-surface-inset/50' : 'border-line-strong bg-surface-inset/30 hover:border-line-strong'
              }`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-control object-contain" />
              ) : (
                <>
                  <svg className="h-10 w-10 text-content-faint mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-content-muted">Click or drag to upload</p>
                </>
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
            <p className="text-xs text-content-faint">Recommended: 1200x1200px square, PNG or JPG, max 5MB</p>
          </section>

          {/* C. Traits */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-content-secondary uppercase tracking-wider">Traits</h3>
            <div className="space-y-2">
              <label className="block text-sm text-content-muted">Gender</label>
              <div className="flex gap-3">
                {GENDER_OPTIONS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    disabled={isSubmitting}
                    className={`rounded-control border px-4 py-2 text-sm font-medium transition ${
                      gender === g
                        ? 'border-eth-blue bg-eth-blue/10 text-eth-blue-text'
                        : 'border-line-hairline bg-surface-inset text-content-muted hover:border-line-strong'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-content-muted">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none"
                  placeholder="Black"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-content-muted">Style</label>
                <input
                  type="text"
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none"
                  placeholder="Classic"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </section>

          {/* D. Sizes & Pricing */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-content-secondary uppercase tracking-wider">Sizes & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-content-muted">Base Token ID</label>
                <input
                  type="number"
                  min="0"
                  value={baseId}
                  onChange={e => setBaseId(e.target.value)}
                  className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary font-mono focus:border-eth-blue focus:outline-none"
                  placeholder="100"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-content-faint">Base ID x 10 + size offset (S=1, M=2, L=3, XL=4, OneSize=5)</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-content-muted">Price (USDC)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary focus:border-eth-blue focus:outline-none"
                  placeholder="25.00"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="rounded-control border border-line-hairline bg-surface-inset/50 divide-y divide-line-hairline">
              {SIZE_OPTIONS.map(s => (
                <div key={s.key} className="flex items-center gap-4 px-4 py-3">
                  <label className="flex items-center gap-2 min-w-[100px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sizes[s.key].enabled}
                      onChange={() => toggleSize(s.key)}
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded-chip border-line-strong bg-surface-ridge text-eth-blue-text focus:ring-eth-blue"
                    />
                    <span className={`text-sm font-medium ${sizes[s.key].enabled ? 'text-content-primary' : 'text-content-faint'}`}>
                      {s.label}
                    </span>
                  </label>
                  {sizes[s.key].enabled && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-content-faint">Max Supply:</span>
                      <input
                        type="number"
                        min="1"
                        value={sizes[s.key].maxSupply}
                        onChange={e => setSizeSupply(s.key, e.target.value)}
                        className="w-24 rounded-control border border-line-strong bg-surface-ridge px-3 py-1.5 text-sm text-content-primary font-mono focus:border-eth-blue focus:outline-none"
                        placeholder="50"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {enabledSizes.length > 0 && (
              <p className="text-sm text-content-muted">
                Total supply: <span className="font-mono text-eth-blue-text">{totalSupply}</span> across {enabledSizes.length} size{enabledSizes.length > 1 ? 's' : ''}
              </p>
            )}
          </section>

          {/* E. Active toggle */}
          <div className="flex items-center justify-between rounded-control border border-line-hairline bg-surface-inset p-4">
            <div>
              <p className="text-content-primary font-medium">Active on Creation</p>
              <p className="text-xs text-content-faint">{active ? 'Available for purchase immediately' : 'Hidden until activated'}</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative h-6 w-11 rounded-full transition-colors ${active ? 'bg-eth-blue' : 'bg-surface-ridge'}`}
              disabled={isSubmitting}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-paper transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Progress / Error */}
          {progress && (
            <div className="flex items-center gap-3 rounded-control border border-eth-blue/30 bg-eth-blue/10 p-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-eth-blue border-t-transparent" />
              <p className="text-sm text-eth-blue-text">{progress}</p>
            </div>
          )}

          {error && (
            <div className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3">
              <p className="text-sm text-signal-reverted">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-control border border-line-strong bg-surface-inset py-3 text-content-primary hover:bg-surface-ridge transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSet}
              className="flex-1 rounded-control bg-eth-blue hover:bg-eth-blue-lift py-3 font-medium text-content-primary hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

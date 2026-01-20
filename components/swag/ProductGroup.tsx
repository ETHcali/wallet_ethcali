import { useState, useMemo } from 'react';
import { useBuyVariant, useVariantMetadata, useVariantState } from '../../hooks/useSwagStore';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import type { Swag1155MetadataAttribute } from '../../types/swag';

interface VariantInfo {
  tokenId: bigint;
  size: string;
  price: number;
  available: number;
  active: boolean;
  isLoading: boolean;
}

interface ProductGroupProps {
  tokenIds: bigint[];
  productName: string;
}

// Hook to get variant data for a single token
function useVariantData(tokenId: bigint) {
  const { price, available, active, isLoading: isStateLoading } = useVariantState(tokenId);
  const { metadata, isLoading: isMetadataLoading } = useVariantMetadata(tokenId);

  const size = useMemo(() => {
    const sizeAttr = metadata?.attributes?.find(
      (attr: Swag1155MetadataAttribute) => attr.trait_type === 'Size'
    );
    return sizeAttr?.value || 'One Size';
  }, [metadata]);

  return {
    tokenId,
    size,
    price,
    available,
    active,
    isLoading: isStateLoading || isMetadataLoading,
    metadata,
  };
}

// Individual size button component
function SizeButton({
  variant,
  isSelected,
  onSelect
}: {
  variant: VariantInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isSoldOut = variant.available === 0;
  const isDisabled = !variant.active || isSoldOut;

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`
        relative px-4 py-2 rounded-lg font-medium text-sm transition-all
        ${isSelected
          ? 'bg-cyan-500 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/20'
          : isDisabled
            ? 'bg-slate-800/50 text-slate-600 border border-slate-700 cursor-not-allowed line-through'
            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-white'
        }
      `}
    >
      {variant.size}
      {isSoldOut && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>
  );
}

export function ProductGroup({ tokenIds, productName }: ProductGroupProps) {
  // Get data for the first token to display main info
  const firstVariant = useVariantData(tokenIds[0]);
  const { buy, canBuy } = useBuyVariant();

  // Get data for all variants
  const variant1 = useVariantData(tokenIds[0]);
  const variant2 = useVariantData(tokenIds[1] || tokenIds[0]);
  const variant3 = useVariantData(tokenIds[2] || tokenIds[0]);
  const variant4 = useVariantData(tokenIds[3] || tokenIds[0]);

  const variants = useMemo(() => {
    const all = [variant1];
    if (tokenIds[1]) all.push(variant2);
    if (tokenIds[2]) all.push(variant3);
    if (tokenIds[3]) all.push(variant4);
    return all;
  }, [variant1, variant2, variant3, variant4, tokenIds]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const selectedVariant = variants[selectedIndex] || variants[0];
  const isLoading = variants.some(v => v.isLoading);

  const handleBuy = async () => {
    if (!selectedVariant || !selectedVariant.active || !canBuy) return;
    setPending(true);
    setError(null);
    try {
      await buy(selectedVariant.tokenId, quantity, selectedVariant.price);
    } catch (err: any) {
      console.error('Buy error:', err);
      setError(err?.message || 'Transaction failed');
    } finally {
      setPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 animate-pulse">
        <div className="aspect-square w-full bg-slate-800 rounded-xl mb-4" />
        <div className="h-6 bg-slate-800 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
      </div>
    );
  }

  if (!firstVariant.metadata) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">
        Missing metadata for product
      </div>
    );
  }

  const { metadata } = firstVariant;
  const imageUrl = getIPFSGatewayUrl(metadata.image || '') || '/logo_eth_cali.png';

  // Get non-size attributes for display
  const otherAttributes = metadata.attributes?.filter(
    (attr: Swag1155MetadataAttribute) => attr.trait_type !== 'Size'
  ) || [];

  // Calculate total available across all sizes
  const totalAvailable = variants.reduce((sum, v) => sum + v.available, 0);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl hover:border-slate-700 transition-all">
      {/* Image */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-slate-900 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <img
          src={imageUrl}
          alt={metadata.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {/* Quick info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">{variants.length} sizes available</p>
              <p className="text-lg font-bold text-white">${selectedVariant.price.toFixed(2)} USDC</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${totalAvailable > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalAvailable > 0 ? `${totalAvailable} left` : 'Sold out'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-5">
        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{metadata.name}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{metadata.description}</p>
        </div>

        {/* Attributes */}
        {otherAttributes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {otherAttributes.map((attr: Swag1155MetadataAttribute) => (
              <span
                key={attr.trait_type}
                className="text-xs rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-slate-300"
              >
                {attr.value}
              </span>
            ))}
          </div>
        )}

        {/* Size Selector */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Select Size</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <SizeButton
                key={variant.tokenId.toString()}
                variant={variant}
                isSelected={selectedIndex === index}
                onSelect={() => {
                  setSelectedIndex(index);
                  setQuantity(1);
                }}
              />
            ))}
          </div>
        </div>

        {/* Selected Size Info */}
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Selected: {selectedVariant.size}</p>
            <p className="text-lg font-bold text-white">${selectedVariant.price.toFixed(2)} <span className="text-sm font-normal text-slate-400">USDC</span></p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${selectedVariant.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {selectedVariant.available > 0 ? `${selectedVariant.available} available` : 'Sold out'}
            </p>
          </div>
        </div>

        {/* Buy Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden bg-slate-900/80">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || pending}
              className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              -
            </button>
            <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant.available, quantity + 1))}
              disabled={quantity >= selectedVariant.available || pending}
              className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleBuy}
            disabled={!selectedVariant.active || pending || !canBuy || selectedVariant.available === 0}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : !canBuy ? (
              'Connect Wallet'
            ) : selectedVariant.available === 0 ? (
              'Sold Out'
            ) : (
              `Buy for $${(selectedVariant.price * quantity).toFixed(2)}`
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">{error}</p>
        )}
      </div>
    </article>
  );
}

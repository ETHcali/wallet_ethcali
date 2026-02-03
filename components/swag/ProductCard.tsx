import { useState } from 'react';
import Image from 'next/image';
import { useWallets } from '@privy-io/react-auth';
import { useTokenIds, useVariant, useVariantUri, useVariantRemaining } from '../../hooks/swag';
import { useDiscountedPrice } from '../../hooks/swag';
import { useBuy } from '../../hooks/useSwagStore';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { baseUnitsToPrice } from '../../utils/tokenGeneration';
import { logger } from '../../utils/logger';
import { getExplorerUrl } from '../../utils/network';
import type { Swag1155Metadata } from '../../types/swag';

interface ProductCardProps {
  designAddress: string;
  chainId: number;
}

function useVariantMetadata(uri: string) {
  const [metadata, setMetadata] = useState<Swag1155Metadata | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (uri && !loaded) {
    setLoaded(true);
    const url = getIPFSGatewayUrl(uri) || uri;
    fetch(url)
      .then(r => r.json())
      .then(data => setMetadata(data as Swag1155Metadata))
      .catch(() => {});
  }

  return metadata;
}

function VariantCard({
  contractAddress,
  chainId,
  tokenId,
}: {
  contractAddress: string;
  chainId: number;
  tokenId: number;
}) {
  const { wallets } = useWallets();
  const address = wallets?.[0]?.address;
  const { variant, isLoading: isVariantLoading } = useVariant(contractAddress, chainId, tokenId);
  const { uri } = useVariantUri(contractAddress, chainId, tokenId);
  const { remaining, isLoading: isRemainingLoading } = useVariantRemaining(contractAddress, chainId, tokenId);
  const { discountedPrice, isLoading: isPriceLoading } = useDiscountedPrice(contractAddress, chainId, tokenId, address);
  const { buy, canBuy } = useBuy();
  const metadata = useVariantMetadata(uri);

  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isVariantLoading || isRemainingLoading;

  const handleBuy = async () => {
    if (!variant?.active || !canBuy) return;
    if (remaining === 0) { setError('Sold out'); return; }
    setPending(true);
    setError(null);
    try {
      await buy(contractAddress, tokenId, quantity);
    } catch (err: any) {
      logger.error('Buy error:', err);
      setError(err?.message || 'Transaction failed');
    } finally {
      setPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading variant...</span>
        </div>
      </div>
    );
  }

  if (!variant) return null;

  const imageUrl = metadata?.image ? (getIPFSGatewayUrl(metadata.image) || '/logo_eth_cali.png') : '/logo_eth_cali.png';
  const name = metadata?.name || `Token #${tokenId}`;
  const description = metadata?.description || '';
  const basePrice = baseUnitsToPrice(variant.price);
  const displayPrice = isPriceLoading ? basePrice : baseUnitsToPrice(discountedPrice);
  const hasDiscount = !isPriceLoading && discountedPrice < variant.price;
  const explorerUrl = getExplorerUrl(chainId);
  const contractLink = `${explorerUrl}/address/${contractAddress}`;

  const attributes = metadata?.attributes?.filter(a => a.trait_type !== 'Size') || [];
  const sizeAttr = metadata?.attributes?.find(a => a.trait_type === 'Size');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-2xl">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
          unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        {description && <p className="text-sm text-slate-400">{description}</p>}
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          {sizeAttr && (
            <span className="rounded-full border border-slate-800 px-3 py-1">Size: {sizeAttr.value}</span>
          )}
          {attributes.map(a => (
            <span key={a.trait_type} className="rounded-full border border-slate-800 px-3 py-1">
              {a.trait_type}: {a.value}
            </span>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-800">
          <a href={contractLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors group">
            <span className="font-mono text-slate-500 group-hover:text-cyan-400">
              {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </span>
            <span className="text-slate-600 group-hover:text-cyan-500">View on Explorer</span>
          </a>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
        <div>
          <p className="text-sm text-slate-400">Price</p>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-lg text-slate-500 line-through">{basePrice.toFixed(2)}</span>
            )}
            <p className="text-2xl font-semibold text-white">{displayPrice.toFixed(2)} USDC</p>
          </div>
          {hasDiscount && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Discount Applied</span>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-400">Availability</p>
          <p className={`text-lg font-semibold ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {remaining > 0 ? `${remaining} left` : 'Sold out'}
          </p>
        </div>
      </div>
      {remaining > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden bg-slate-900/80">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1 || pending}
                className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50">-</button>
              <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(remaining, quantity + 1))} disabled={quantity >= remaining || pending}
                className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50">+</button>
            </div>
            <button type="button" onClick={handleBuy}
              disabled={!variant.active || pending || !canBuy || remaining === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 text-center text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
              {pending ? 'Buying...' : !canBuy ? 'Connect Wallet' : !variant.active ? 'Inactive' : `Buy for $${(displayPrice * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
      {remaining === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">Sold out</p>
        </div>
      )}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </article>
  );
}

export function ProductCard({ designAddress, chainId }: ProductCardProps) {
  const { tokenIds, isLoading } = useTokenIds(designAddress, chainId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading products...</span>
        </div>
      </div>
    );
  }

  if (tokenIds.length === 0) {
    return (
      <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-6">
        <p className="text-yellow-200 font-medium mb-2">No Products Available</p>
        <p className="text-sm text-yellow-300/80">No variants found in this contract.</p>
      </div>
    );
  }

  return (
    <>
      {tokenIds.map(id => (
        <VariantCard key={id} contractAddress={designAddress} chainId={chainId} tokenId={id} />
      ))}
    </>
  );
}

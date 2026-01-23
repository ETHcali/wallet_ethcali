import { useState } from 'react';
import Image from 'next/image';
import { useWallets } from '@privy-io/react-auth';
import {
  useDesignInfo,
  useDesignDiscountConfig,
  useDesignRemainingSupply,
  useDesignPriceWithDiscounts,
  useMintDesign,
} from '../../hooks/useSwagStore';
import { usePoapVerification } from '../../hooks/usePoapVerification';
import { useSmartContractDiscount } from '../../hooks/useSmartContractDiscount';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { baseUnitsToPrice } from '../../utils/tokenGeneration';
import { logger } from '../../utils/logger';
import { getExplorerUrl } from '../../utils/network';
import type { SizeOption } from '../../types/swag';

interface ProductCardProps {
  designAddress: string;
  chainId: number;
}

const AVAILABLE_SIZES: SizeOption[] = ['S', 'M', 'L', 'XL', 'NA'];

export function ProductCard({ designAddress, chainId }: ProductCardProps) {
  const { wallets } = useWallets();
  const address = wallets?.[0]?.address;
  const { designInfo, isLoading: isDesignLoading } = useDesignInfo(designAddress, chainId);
  const { discountConfig } = useDesignDiscountConfig(designAddress, chainId);
  const { remaining, isLoading: isSupplyLoading } = useDesignRemainingSupply(designAddress, chainId);
  const { hasPoap, isChecking: isCheckingPoap } = usePoapVerification(designAddress, discountConfig);
  const { isEligible: hasSmartContractDiscount } = useSmartContractDiscount(
    designAddress,
    chainId,
    discountConfig,
    address
  );
  const { price, priceDisplay, isLoading: isPriceLoading } = useDesignPriceWithDiscounts(
    designAddress,
    chainId,
    address,
    hasPoap
  );
  const { mint, canMint } = useMintDesign();

  const [selectedSize, setSelectedSize] = useState<SizeOption>('M');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isDesignLoading || isSupplyLoading || isPriceLoading || isCheckingPoap;

  const handleMint = async () => {
    if (!designInfo || !designInfo.active || !canMint) return;
    if (remaining === 0) {
      setError('Design is sold out');
      return;
    }

    setPending(true);
    setError(null);
    try {
      await mint(designAddress, selectedSize, hasPoap, price);
      // Success - user will see transaction confirmation
    } catch (err: any) {
      logger.error('Mint error:', err);
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
          <span className="ml-3 text-slate-400">Loading design from contract...</span>
        </div>
      </div>
    );
  }

  if (!designInfo) {
    return (
      <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-6">
        <div className="text-yellow-200">
          <p className="font-medium mb-2">Contract Data Not Available</p>
          <p className="text-sm text-yellow-300/80 mb-3">
            Unable to read design information from the contract.
          </p>
          <a
            href={`${getExplorerUrl(chainId)}/address/${designAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-yellow-400/80 font-mono break-all hover:text-yellow-300 underline"
          >
            {designAddress}
          </a>
          <p className="text-xs text-yellow-400/60 mt-1">
            Chain ID: {chainId}
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = getIPFSGatewayUrl(designInfo.imageUrl || '') || '/logo_eth_cali.png';
  const hasDiscount = hasPoap || hasSmartContractDiscount;
  const basePrice = baseUnitsToPrice(designInfo.pricePerUnit);
  const explorerUrl = getExplorerUrl(chainId);
  const contractLink = `${explorerUrl}/address/${designAddress}`;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-2xl">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <Image 
          src={imageUrl} 
          alt={designInfo.name} 
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
          unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{designInfo.name}</h3>
        </div>
        <p className="text-sm text-slate-400">{designInfo.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-slate-800 px-3 py-1">
            Gender: {designInfo.gender}
          </span>
          <span className="rounded-full border border-slate-800 px-3 py-1">
            Color: {designInfo.color}
          </span>
          <span className="rounded-full border border-slate-800 px-3 py-1">
            Style: {designInfo.style}
          </span>
        </div>
        {/* Contract Address Link */}
        <div className="pt-2 border-t border-slate-800">
          <a
            href={contractLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors group"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="font-mono text-slate-500 group-hover:text-cyan-400">
              {designAddress.slice(0, 6)}...{designAddress.slice(-4)}
            </span>
            <span className="text-slate-600 group-hover:text-cyan-500">View on Explorer</span>
          </a>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
        <div>
          <p className="text-sm text-slate-400">Price</p>
          <div className="flex items-center gap-2">
            {hasDiscount && basePrice !== priceDisplay && (
              <span className="text-lg text-slate-500 line-through">{basePrice.toFixed(2)}</span>
            )}
            <p className="text-2xl font-semibold text-white">{priceDisplay.toFixed(2)} USDC</p>
          </div>
          {hasDiscount && (
            <div className="flex gap-1 mt-1">
              {hasPoap && (
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                  POAP Discount
                </span>
              )}
              {hasSmartContractDiscount && (
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                  Contract Discount
                </span>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-400">Availability</p>
          <p className={`text-lg font-semibold ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {remaining > 0 ? `${remaining} left` : 'Sold out'}
          </p>
        </div>
      </div>
      {/* Show minting section if there's remaining supply, even if inactive */}
      {remaining > 0 ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400 mb-2">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  disabled={pending || !designInfo.active}
                  className={`px-4 py-2 rounded-lg border transition ${
                    selectedSize === size
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  } disabled:opacity-50`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleMint}
            disabled={!designInfo.active || pending || !canMint || remaining === 0}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 text-center text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? 'Minting...' : !canMint ? 'Connect Wallet' : !designInfo.active ? 'Design Inactive' : `Mint ${selectedSize}`}
          </button>
          {!designInfo.active && (
            <p className="text-xs text-yellow-400 text-center">
              This design is currently inactive and cannot be minted
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">Sold out</p>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </article>
  );
}

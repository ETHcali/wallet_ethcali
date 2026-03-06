/**
 * ProductCard · GroupedProductCard · ProductDetailModal
 *
 * User-facing swag store.
 *
 * Card (compact):  image · name · price · size pills · qty + buy
 * Modal (full):    large image | description · per-size inventory ·
 *                  size picker · buy · attributes · royalties · discounts
 */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useWallets } from '@privy-io/react-auth';
import {
  useVariant,
  useVariantRemaining,
  useDiscountedPrice,
  useRoyalties,
  usePoapDiscounts,
  useHolderDiscounts,
} from '../../hooks/swag';
import {
  useGroupedProducts,
  type ProductGroup,
  type VariantSize,
} from '../../hooks/swag/useGroupedProducts';
import { useBuy } from '../../hooks/useSwagStore';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { baseUnitsToPrice } from '../../utils/tokenGeneration';
import { logger } from '../../utils/logger';
import { getExplorerUrl } from '../../utils/network';
import { DiscountType } from '../../types/swag';

// ─── helpers ──────────────────────────────────────────────────────────────────

function stockLabel(remaining: number, isLoading: boolean): string {
  if (isLoading) return '…';
  if (remaining === 0) return 'Sold out';
  if (remaining <= 5) return `${remaining} left!`;
  return `${remaining} left`;
}

function stockColor(remaining: number, isLoading: boolean): string {
  if (isLoading) return 'text-slate-500';
  if (remaining === 0) return 'text-red-400';
  if (remaining <= 5) return 'text-yellow-400';
  return 'text-emerald-400';
}

// ─── SizePill  (card – compact) ───────────────────────────────────────────────

function SizePill({
  contractAddress,
  chainId,
  sv,
  isSelected,
  onSelect,
}: {
  contractAddress: string;
  chainId: number;
  sv: VariantSize;
  isSelected: boolean;
  onSelect: (tokenId: number) => void;
}) {
  const { remaining, isLoading } = useVariantRemaining(contractAddress, chainId, sv.tokenId);
  const isSoldOut = !isLoading && remaining === 0;
  const label = sv.size === 'One Size' || sv.size === 'NA' ? 'One Size' : sv.size;

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() => !isSoldOut && onSelect(sv.tokenId)}
      aria-pressed={isSelected}
      title={isSoldOut ? `${label} – Sold out` : `Select ${label}`}
      className={[
        'px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150 select-none',
        isSelected
          ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/25'
          : isSoldOut
          ? 'border-slate-800 text-slate-600 line-through bg-transparent cursor-not-allowed'
          : 'border-slate-700 text-slate-300 hover:border-cyan-500/60 hover:text-white bg-slate-900/40 cursor-pointer',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ─── ModalSizePill  (modal – rich: shows stock count) ─────────────────────────

function ModalSizePill({
  contractAddress,
  chainId,
  sv,
  isSelected,
  onSelect,
}: {
  contractAddress: string;
  chainId: number;
  sv: VariantSize;
  isSelected: boolean;
  onSelect: (tokenId: number) => void;
}) {
  const { remaining, isLoading } = useVariantRemaining(contractAddress, chainId, sv.tokenId);
  const isSoldOut = !isLoading && remaining === 0;
  const label = sv.size === 'One Size' || sv.size === 'NA' ? 'One Size' : sv.size;

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() => !isSoldOut && onSelect(sv.tokenId)}
      aria-pressed={isSelected}
      className={[
        'flex flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 transition-all duration-150 min-w-[4rem] select-none',
        isSelected
          ? 'bg-cyan-500/15 border-cyan-500 shadow-md shadow-cyan-500/10'
          : isSoldOut
          ? 'border-slate-800 bg-transparent cursor-not-allowed opacity-50'
          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'text-sm font-bold',
          isSelected ? 'text-cyan-400' : isSoldOut ? 'text-slate-600 line-through' : 'text-white',
        ].join(' ')}
      >
        {label}
      </span>
      <span className={`text-[10px] font-medium ${stockColor(remaining, isLoading)}`}>
        {stockLabel(remaining, isLoading)}
      </span>
    </button>
  );
}

// ─── InventoryRow  (modal inventory table) ────────────────────────────────────

function InventoryRow({
  contractAddress,
  chainId,
  sv,
}: {
  contractAddress: string;
  chainId: number;
  sv: VariantSize;
}) {
  const { remaining, isLoading } = useVariantRemaining(contractAddress, chainId, sv.tokenId);
  const { variant } = useVariant(contractAddress, chainId, sv.tokenId);
  const label = sv.size === 'One Size' || sv.size === 'NA' ? 'One Size' : sv.size;
  const maxSupply = variant ? Number(variant.maxSupply) : 0;
  const pct = maxSupply > 0 ? Math.round(((maxSupply - remaining) / maxSupply) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      {/* Size label */}
      <span className="w-16 shrink-0 text-xs font-semibold text-slate-400">{label}</span>
      {/* Progress bar */}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={[
            'h-full rounded-full transition-all',
            remaining === 0
              ? 'bg-red-500/60'
              : remaining <= 5
              ? 'bg-yellow-500/70'
              : 'bg-emerald-500/70',
          ].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Count */}
      <span className={`w-20 shrink-0 text-right text-xs font-medium ${stockColor(remaining, isLoading)}`}>
        {stockLabel(remaining, isLoading)}
      </span>
    </div>
  );
}

// ─── ProductDetailModal ───────────────────────────────────────────────────────

interface ModalProps {
  group: ProductGroup;
  contractAddress: string;
  chainId: number;
  initialTokenId: number;
  onClose: () => void;
}

function ProductDetailModal({ group, contractAddress, chainId, initialTokenId, onClose }: ModalProps) {
  const { wallets } = useWallets();
  const address = wallets?.[0]?.address;

  const [selectedTokenId, setSelectedTokenId] = useState(initialTokenId);
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState(false);

  const { variant } = useVariant(contractAddress, chainId, selectedTokenId);
  const { remaining } = useVariantRemaining(contractAddress, chainId, selectedTokenId);
  const { discountedPrice, isLoading: isPriceLoading } = useDiscountedPrice(
    contractAddress, chainId, selectedTokenId, address,
  );
  const { royalties, isLoading: rLoading } = useRoyalties(contractAddress, chainId, selectedTokenId);
  const { poapDiscounts } = usePoapDiscounts(contractAddress, chainId, selectedTokenId);
  const { holderDiscounts } = useHolderDiscounts(contractAddress, chainId, selectedTokenId);
  const { buy, canBuy } = useBuy();

  const explorerBase = getExplorerUrl(chainId);
  const imageUrl = group.imageUri
    ? getIPFSGatewayUrl(group.imageUri) || '/logo_eth_cali.png'
    : '/logo_eth_cali.png';

  const basePrice = variant ? baseUnitsToPrice(variant.price) : 0;
  const displayPrice = isPriceLoading || !address ? basePrice : baseUnitsToPrice(discountedPrice);
  const hasDiscount = !isPriceLoading && !!address && !!variant && discountedPrice < variant.price;
  const isSoldOut = remaining === 0;

  const showSizePicker =
    group.sizes.length > 1 ||
    (group.sizes.length === 1 && group.sizes[0].size !== 'NA');

  const activePoap = poapDiscounts.filter(d => d.active);
  const activeHolder = holderDiscounts.filter(d => d.active);
  const hasDiscounts = activePoap.length > 0 || activeHolder.length > 0;

  // Close on Escape, lock body scroll
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [handleKeyDown]);

  const handleSizeSelect = (tokenId: number) => {
    setSelectedTokenId(tokenId);
    setQty(1);
    setTxError(null);
    setTxSuccess(false);
  };

  const handleBuy = async () => {
    if (!canBuy || isSoldOut || !variant?.active) return;
    setPending(true);
    setTxError(null);
    setTxSuccess(false);
    try {
      await buy(contractAddress, selectedTokenId, qty);
      setTxSuccess(true);
    } catch (err: unknown) {
      logger.error('Buy error:', err);
      setTxError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setPending(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet / dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={group.productName}
        className="relative w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-slate-700/60 bg-slate-950 shadow-2xl flex flex-col"
      >
        {/* ── Top bar (drag handle on mobile + close btn) ── */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
          {/* Mobile drag handle */}
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-700 sm:hidden" />
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/80 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 px-5 pb-6">

          {/* ── Left: image (sticky on large screens) ── */}
          <div className="lg:sticky lg:top-4 lg:self-start shrink-0 w-full lg:w-72 xl:w-80">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <Image
                src={imageUrl}
                alt={group.productName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
                unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
                priority
              />
              {/* Inactive badge */}
              {variant && !variant.active && (
                <div className="absolute right-2 top-2">
                  <span className="rounded-full border border-slate-600 bg-slate-800/90 px-2.5 py-1 text-xs text-slate-300">
                    Inactive
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: all details ── */}
          <div className="flex flex-1 flex-col gap-5 pt-4 lg:pt-0 min-w-0">

            {/* Name + price */}
            <div>
              <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
                {group.productName}
              </h2>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                {hasDiscount && (
                  <span className="text-base text-slate-500 line-through">${basePrice.toFixed(2)}</span>
                )}
                <span className="text-2xl font-bold text-white">
                  ${displayPrice.toFixed(2)}{' '}
                  <span className="text-sm font-normal text-slate-400">USDC</span>
                </span>
                {hasDiscount && (
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                    Discount applied
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {group.description && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  About
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{group.description}</p>
              </div>
            )}

            {/* ── Size picker (interactive) ── */}
            {showSizePicker && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.sizes.map(sv => (
                    <ModalSizePill
                      key={sv.tokenId}
                      contractAddress={contractAddress}
                      chainId={chainId}
                      sv={sv}
                      isSelected={sv.tokenId === selectedTokenId}
                      onSelect={handleSizeSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Qty + Buy ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {!isSoldOut && variant?.active && (
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      disabled={qty <= 1 || pending}
                      className="px-3 py-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-[2.5rem] px-1 py-2.5 text-center text-sm font-semibold text-white">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(q => Math.min(remaining, q + 1))}
                      disabled={qty >= remaining || pending}
                      className="px-3 py-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={isSoldOut || pending || !canBuy || !variant?.active}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending
                    ? 'Processing…'
                    : !canBuy
                    ? 'Connect Wallet'
                    : isSoldOut
                    ? 'Sold Out'
                    : !variant?.active
                    ? 'Inactive'
                    : `Buy  •  $${(displayPrice * qty).toFixed(2)} USDC`}
                </button>
              </div>

              {txError && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                  {txError}
                </p>
              )}
              {txSuccess && (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400">
                  ✓ Purchase confirmed!
                </p>
              )}
            </div>

            {/* ── Inventory by size ── */}
            {showSizePicker && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Inventory by Size
                </p>
                <div className="space-y-2.5">
                  {group.sizes.map(sv => (
                    <InventoryRow
                      key={sv.tokenId}
                      contractAddress={contractAddress}
                      chainId={chainId}
                      sv={sv}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Attributes ── */}
            {group.baseAttributes.length > 0 && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Attributes
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.baseAttributes.map(a => (
                    <span
                      key={a.trait_type}
                      className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
                    >
                      <span className="text-slate-500">{a.trait_type}: </span>
                      {a.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Royalties ── */}
            {!rLoading && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Royalties
                </p>
                {royalties.length > 0 ? (
                  <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    {royalties.map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <a
                          href={`${explorerBase}/address/${r.recipient}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-mono text-xs text-slate-400 transition-colors hover:text-cyan-400"
                        >
                          {r.recipient.slice(0, 10)}…{r.recipient.slice(-8)}
                          <span className="text-[10px]">↗</span>
                        </a>
                        <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                          {(Number(r.percentage) / 100).toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">No royalties configured</p>
                )}
              </div>
            )}

            {/* ── Active discounts ── */}
            {hasDiscounts && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Active Discounts
                </p>
                <div className="space-y-1.5">
                  {activePoap.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-300"
                    >
                      <span>🎟</span>
                      <span>
                        POAP Event #{Number(d.eventId)} —{' '}
                        <strong>{(Number(d.discountBps) / 100).toFixed(0)}% off</strong>
                      </span>
                    </div>
                  ))}
                  {activeHolder.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300"
                    >
                      <span>🔑</span>
                      <span>
                        Token holder ({d.token.slice(0, 6)}…{d.token.slice(-4)}) —{' '}
                        <strong>
                          {d.discountType === DiscountType.Percentage
                            ? `${(Number(d.value) / 100).toFixed(0)}% off`
                            : `$${(Number(d.value) / 1e6).toFixed(2)} USDC off`}
                        </strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Contract link ── */}
            <div className="border-t border-slate-800/60 pt-4">
              <a
                href={`${explorerBase}/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-500 transition-colors hover:border-slate-700 hover:text-cyan-400"
              >
                <span className="font-mono">
                  {contractAddress.slice(0, 10)}…{contractAddress.slice(-8)}
                </span>
                <span>View contract ↗</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

// ─── GroupedProductCard ────────────────────────────────────────────────────────

function GroupedProductCard({
  group,
  contractAddress,
  chainId,
}: {
  group: ProductGroup;
  contractAddress: string;
  chainId: number;
}) {
  const { wallets } = useWallets();
  const address = wallets?.[0]?.address;

  const [selectedTokenId, setSelectedTokenId] = useState<number>(
    group.sizes[0]?.tokenId ?? 0,
  );
  const [qty, setQty] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const { variant } = useVariant(contractAddress, chainId, selectedTokenId);
  const { remaining } = useVariantRemaining(contractAddress, chainId, selectedTokenId);
  const { discountedPrice, isLoading: isPriceLoading } = useDiscountedPrice(
    contractAddress, chainId, selectedTokenId, address,
  );
  const { buy, canBuy } = useBuy();

  const imageUrl = group.imageUri
    ? getIPFSGatewayUrl(group.imageUri) || '/logo_eth_cali.png'
    : '/logo_eth_cali.png';

  const basePrice = variant ? baseUnitsToPrice(variant.price) : 0;
  const displayPrice = isPriceLoading || !address ? basePrice : baseUnitsToPrice(discountedPrice);
  const hasDiscount = !isPriceLoading && !!address && !!variant && discountedPrice < variant.price;
  const isSoldOut = remaining === 0;
  const showSizePicker =
    group.sizes.length > 1 ||
    (group.sizes.length === 1 && group.sizes[0].size !== 'NA');

  const handleBuy = async () => {
    if (!canBuy || isSoldOut || !variant?.active) return;
    setPending(true);
    setTxError(null);
    try {
      await buy(contractAddress, selectedTokenId, qty);
    } catch (err: unknown) {
      logger.error('Buy error:', err);
      setTxError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setPending(false);
    }
  };

  const handleSizeSelect = (tokenId: number) => {
    setSelectedTokenId(tokenId);
    setQty(1);
    setTxError(null);
  };

  return (
    <>
      <article className="group/card flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/80 hover:shadow-2xl">

        {/* ── Image – click opens modal ── */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative aspect-square w-full overflow-hidden bg-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-label={`View details for ${group.productName}`}
        >
          <Image
            src={imageUrl}
            alt={group.productName}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
          />
          {/* Hover overlay hint */}
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent pb-4 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
            <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              View Details
            </span>
          </div>

          {/* Sold-out overlay */}
          {isSoldOut && variant && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
              <span className="rounded-full border border-red-500/40 bg-red-500/20 px-4 py-1.5 text-sm font-semibold text-red-400">
                Sold Out
              </span>
            </div>
          )}

          {/* Inactive badge */}
          {variant && !variant.active && (
            <div className="absolute right-2 top-2">
              <span className="rounded-full border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-xs text-slate-400">
                Inactive
              </span>
            </div>
          )}
        </button>

        {/* ── Card body ── */}
        <div className="flex flex-1 flex-col gap-3 p-4">

          {/* Name */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-left text-base font-bold leading-snug text-white hover:text-cyan-300 transition-colors"
          >
            {group.productName}
          </button>

          {/* Price */}
          <div className="flex flex-wrap items-end gap-2">
            {hasDiscount && (
              <span className="text-sm text-slate-500 line-through">${basePrice.toFixed(2)}</span>
            )}
            <span className="text-xl font-bold text-white">
              ${displayPrice.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-400">USDC</span>
            </span>
            {hasDiscount && (
              <span className="ml-auto rounded-full border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-300">
                Discount
              </span>
            )}
          </div>

          {/* Size pills (compact) */}
          {showSizePicker && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Size
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.sizes.map(sv => (
                  <SizePill
                    key={sv.tokenId}
                    contractAddress={contractAddress}
                    chainId={chainId}
                    sv={sv}
                    isSelected={sv.tokenId === selectedTokenId}
                    onSelect={handleSizeSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Qty + Buy */}
          <div className="mt-auto flex items-center gap-2 pt-1">
            {!isSoldOut && variant?.active && (
              <div className="flex items-center overflow-hidden rounded-lg border border-slate-700/80 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1 || pending}
                  className="px-2.5 py-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40"
                >
                  −
                </button>
                <span className="min-w-[2rem] px-1 py-2 text-center text-sm font-medium text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.min(remaining, q + 1))}
                  disabled={qty >= remaining || pending}
                  className="px-2.5 py-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40"
                >
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleBuy}
              disabled={isSoldOut || pending || !canBuy || !variant?.active}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending
                ? 'Buying…'
                : !canBuy
                ? 'Connect Wallet'
                : isSoldOut
                ? 'Sold Out'
                : !variant?.active
                ? 'Inactive'
                : `Buy  •  $${(displayPrice * qty).toFixed(2)}`}
            </button>
          </div>

          {txError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {txError}
            </p>
          )}

          {/* View details button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-800 py-2 text-xs font-medium text-slate-500 transition-all hover:border-slate-600 hover:text-slate-300"
          >
            <span>View Details</span>
            <span className="text-[10px]">↗</span>
          </button>
        </div>
      </article>

      {/* Detail modal – portal, only mounted when open */}
      {isModalOpen && (
        <ProductDetailModal
          group={group}
          contractAddress={contractAddress}
          chainId={chainId}
          initialTokenId={selectedTokenId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

// ─── ProductCard  (public container) ─────────────────────────────────────────

interface ProductCardProps {
  designAddress: string;
  chainId: number;
}

export function ProductCard({ designAddress, chainId }: ProductCardProps) {
  const { groups, isLoading, error } = useGroupedProducts(designAddress, chainId);

  if (isLoading) {
    return (
      <>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
          >
            <div className="aspect-square bg-slate-800" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-2/3 rounded bg-slate-800" />
              <div className="h-7 w-1/3 rounded bg-slate-800" />
              <div className="flex gap-2">
                {[0, 1, 2, 3].map(j => (
                  <div key={j} className="h-8 w-10 rounded-lg bg-slate-800" />
                ))}
              </div>
              <div className="h-10 rounded-xl bg-slate-800" />
              <div className="h-8 rounded-lg bg-slate-800/60" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <div className="col-span-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-medium text-red-300">Failed to load products</p>
        <p className="mt-1 text-xs text-red-400/70">{error}</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="col-span-full rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
        <p className="mb-1 font-medium text-yellow-200">No Products Available</p>
        <p className="text-sm text-yellow-300/70">No active variants found in this contract.</p>
      </div>
    );
  }

  return (
    <>
      {groups.map(group => (
        <GroupedProductCard
          key={group.groupKey}
          group={group}
          contractAddress={designAddress}
          chainId={chainId}
        />
      ))}
    </>
  );
}

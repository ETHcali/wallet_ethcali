import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckIcon, CloseIcon } from '../shared/icons';
import type { SwagProduct, SwagSize } from '../../types/swag';
import {
  formatCop,
  formatUsd,
  formatUsdc,
  productAltName,
  productImageUrl,
  productName,
  useBuySwag,
  useSwagLocale,
  useTrm,
} from '../../hooks/swag';
import { formatUnits } from 'viem';
import { SWAG_COLLECTION_BASE } from '../../config/constants';
import { HashChip } from './HashChip';
import { ShippingForm } from './ShippingForm';

interface SwagCheckoutModalProps {
  product: SwagProduct;
  tokenId: number;
  size: SwagSize | null;
  onClose: () => void;
}

const OVERLAY = 'fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4';
const SHEET =
  'flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-card border border-line-hairline bg-surface-slab sm:rounded-card';
const PRIMARY =
  'flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue px-6 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint';

/**
 * The USDC checkout for one design. One primary action at a time:
 * Connect → Switch to Base → Approve → Buy, then the shipping form once the
 * receipt is in. Every button owns its own pending state.
 */
export function SwagCheckoutModal({ product, tokenId, size, onClose }: SwagCheckoutModalProps) {
  const locale = useSwagLocale();
  const { rate } = useTrm();
  const flow = useBuySwag(tokenId, 1);
  const [orderSaved, setOrderSaved] = useState(false);

  // Escape closes, but not mid-transaction: a buyer who dismisses the sheet
  // while the wallet is open should not lose the hash.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !flow.isApproving && !flow.isBuying) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, flow.isApproving, flow.isBuying]);

  const image = productImageUrl(product);
  const name = productName(product, locale);
  const usd = Number(formatUnits(flow.total, SWAG_COLLECTION_BASE.usdcDecimals));
  const busy = flow.isApproving || flow.approveCooldown || flow.isBuying || flow.buyCooldown;

  const header = (
    <div className="flex items-start gap-3 border-b border-line-hairline px-5 py-4 sm:px-6">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-chip border border-line-hairline bg-surface-inset">
        {image && <Image src={image} alt="" fill className="object-cover" sizes="56px" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-content-primary" title={productAltName(product, locale)}>
          {name}
        </p>
        <p className="mt-0.5 font-mono text-xs text-content-muted">
          {flow.total > 0n ? formatUsdc(flow.total) : `${formatUsd(product.price_usd)} list`}
          {rate && flow.total > 0n && <span className="text-content-faint"> · {formatCop(usd * rate)}</span>}
          {size && <span className="text-content-faint"> · {size}</span>}
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-content-faint">Base · USDC</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={flow.isApproving || flow.isBuying}
        className="-m-2 p-2 text-content-faint transition-colors hover:text-content-primary disabled:opacity-40"
        aria-label="Close"
      >
        <CloseIcon />
      </button>
    </div>
  );

  // ── Confirmed: shipping, then done ───────────────────────────────────────
  if (flow.confirmed && flow.txHash) {
    return (
      <div className={OVERLAY}>
        <div className={SHEET}>
          {header}
          <div className="overflow-y-auto px-5 py-5 sm:px-6">
            <div className="mb-4 flex items-center gap-3 rounded-chip border border-signal-confirmed/30 bg-signal-confirmed/10 px-3 py-2">
              <CheckIcon className="h-5 w-5 shrink-0 text-signal-confirmed" strokeWidth={2} />
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-content-primary">Paid. The NFT is in your wallet.</p>
                <p className="text-content-muted">
                  Transaction <HashChip hash={flow.txHash} />
                </p>
              </div>
            </div>

            {orderSaved ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-content-secondary">
                  Shipping details saved. Track it under <span className="font-semibold">My swag</span>.
                </p>
                <button type="button" onClick={onClose} className={PRIMARY}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-content-secondary">Where should we send it?</p>
                <ShippingForm txHash={flow.txHash} size={size} quantity={1} onSaved={() => setOrderSaved(true)} />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── The four-state action ────────────────────────────────────────────────
  let action: React.ReactNode;
  switch (flow.step) {
    case 'connect':
      action = flow.walletPending ? (
        <button type="button" disabled className={PRIMARY}>
          Preparing your wallet…
        </button>
      ) : (
        <button type="button" onClick={flow.connect} className={PRIMARY}>
          Connect wallet
        </button>
      );
      break;
    case 'switch':
      action = (
        <button type="button" onClick={flow.switchToBase} disabled={flow.isSwitching} className={PRIMARY}>
          {flow.isSwitching ? 'Switching…' : 'Switch to Base'}
        </button>
      );
      break;
    case 'approve':
      action = (
        <button
          type="button"
          onClick={flow.approve}
          disabled={flow.isApproving || flow.approveCooldown || Boolean(flow.blocked)}
          className={PRIMARY}
        >
          {flow.isApproving
            ? 'Approving…'
            : flow.approveCooldown
              ? 'Confirming approval…'
              : `Approve ${formatUsdc(flow.total)}`}
        </button>
      );
      break;
    default:
      action = (
        <button
          type="button"
          onClick={flow.buy}
          disabled={flow.isBuying || flow.buyCooldown || Boolean(flow.blocked) || flow.total <= 0n}
          className={PRIMARY}
        >
          {flow.isBuying ? 'Buying…' : flow.buyCooldown ? 'Confirming…' : `Buy for ${formatUsdc(flow.total)}`}
        </button>
      );
  }

  return (
    <div className={OVERLAY} onClick={busy ? undefined : onClose}>
      <div className={SHEET} onClick={(e) => e.stopPropagation()}>
        {header}
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <dl className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-content-muted">Price</dt>
              <dd className="font-mono text-content-primary">
                {flow.total > 0n ? formatUsdc(flow.total) : '—'}
              </dd>
            </div>
            {rate && flow.total > 0n && (
              <div className="flex justify-between">
                <dt className="text-content-muted">In pesos (TRM)</dt>
                <dd className="font-mono text-content-secondary">{formatCop(usd * rate)}</dd>
              </div>
            )}
            {flow.step !== 'connect' && (
              <div className="flex justify-between">
                <dt className="text-content-muted">Your USDC on Base</dt>
                <dd className="font-mono text-content-secondary">{formatUsdc(flow.usdcBalance)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-content-muted">Gas</dt>
              <dd className="text-content-secondary">Sponsored</dd>
            </div>
          </dl>

          {flow.blocked && flow.step !== 'connect' && (
            <p className="mb-3 rounded-chip border border-line-hairline bg-surface-inset px-3 py-2 text-sm text-content-secondary">
              {flow.blocked}
            </p>
          )}

          {flow.error && (
            <p role="alert" className="mb-3 rounded-chip border border-signal-reverted/30 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
              {flow.error}
            </p>
          )}

          {flow.txHash && !flow.confirmed && (
            <p className="mb-3 text-sm text-content-muted">
              Submitted <HashChip hash={flow.txHash} /> — waiting for Base to confirm.
            </p>
          )}

          {action}

          {flow.step === 'approve' && (
            <p className="mt-3 text-xs text-content-faint">
              Approving lets the store pull exactly this amount of USDC once. Then you buy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckIcon, CloseIcon } from '../shared/icons';
import type { SwagProduct, SwagShipping, SwagSize } from '../../types/swag';
import type { SwagShippingQuoteResponse } from '../../types/swag-orders';
import {
  formatCop,
  formatUsd,
  formatUsdc,
  productAltName,
  productImageUrl,
  productName,
  useBuySwag,
  useCreateSwagOrder,
  usePayShipping,
  useShippingQuote,
  useSwagLocale,
  useTrm,
} from '../../hooks/swag';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { formatUnits } from 'viem';
import { SWAG_COLLECTION } from '../../config/constants';
import { HashChip } from '../shared/HashChip';
import { ShippingForm } from './ShippingForm';
import { Sheet, SHEET_BODY } from '../shared/Sheet';

interface SwagCheckoutModalProps {
  product: SwagProduct;
  tokenId: number;
  size: SwagSize | null;
  onClose: () => void;
}

const PRIMARY =
  'flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-6 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint';

const toUsd = (units: bigint) => Number(formatUnits(units, SWAG_COLLECTION.usdcDecimals));

function Row({ label, value, sub, strong = false }: { label: string; value: string; sub?: string | null; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className={strong ? 'font-semibold text-content-primary' : 'text-content-muted'}>{label}</dt>
      <dd className="text-right">
        <span className={`font-mono ${strong ? 'font-bold text-content-primary' : 'text-content-primary'}`}>{value}</span>
        {sub && <span className="block font-mono text-xs text-content-faint">{sub}</span>}
      </dd>
    </div>
  );
}

/**
 * The USDC checkout for one design. Item and shipping are separate lines,
 * both paid in USDC, and the buyer sees both before paying anything:
 *
 *   connect → address → shipping quote → switch chain → approve → buy
 *   → the order is saved (awaiting_shipping_payment) → pay shipping → done
 *
 * The order is saved the moment the buy confirms, so a closed tab after the
 * buy still leaves an order the buyer can finish from "My orders". Every
 * onchain button owns its own pending state.
 */
export function SwagCheckoutModal({ product, tokenId, size, onClose }: SwagCheckoutModalProps) {
  const locale = useSwagLocale();
  const { rate } = useTrm();
  const flow = useBuySwag(tokenId, 1);
  const { address } = useActiveWallet();
  const quoteMutation = useShippingQuote();
  const createOrder = useCreateSwagOrder();
  const payShipping = usePayShipping();

  const [shipping, setShipping] = useState<SwagShipping | null>(null);
  const [quote, setQuote] = useState<SwagShippingQuoteResponse | null>(null);
  const [editingAddress, setEditingAddress] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [shippingPaid, setShippingPaid] = useState(false);

  const image = productImageUrl(product);
  const name = productName(product, locale);
  const shippingUnits = quote ? BigInt(quote.quote.amountUnits) : 0n;
  const grandTotal = flow.total + shippingUnits;
  const cop = (units: bigint) => (rate && units > 0n ? formatCop(toUsd(units) * rate) : null);
  const shortOfShipping = Boolean(quote) && flow.step !== 'connect' && flow.usdcBalance < grandTotal;
  const busy = flow.isApproving || flow.approveCooldown || flow.isBuying || flow.buyCooldown || saving || payShipping.submitting || payShipping.cooldown;

  const requestQuote = useCallback(
    async (addr: SwagShipping) => {
      setQuoteError(null);
      try {
        const q = await quoteMutation.mutateAsync({ country: addr.country, city: addr.city, wallet: address?.toLowerCase() });
        setShipping(addr);
        setQuote(q);
        setEditingAddress(false);
        return q;
      } catch (e) {
        setQuoteError(e instanceof Error ? e.message : 'Could not quote shipping.');
        return null;
      }
    },
    [quoteMutation, address]
  );

  // Save the order as soon as the buy confirms. A quote that expired while
  // the buyer approved and bought is renewed once, for the same address.
  const saveOrder = useCallback(async () => {
    if (!flow.txHash || !shipping || !quote) return;
    setSaving(true);
    setSaveError(null);
    try {
      const input = { txHash: flow.txHash, size, quantity: 1, shipping, shippingQuote: quote.quote };
      let order;
      try {
        order = await createOrder.mutateAsync(input);
      } catch (e) {
        if (!(e instanceof Error) || !/expired/i.test(e.message)) throw e;
        const fresh = await requestQuote(shipping);
        if (!fresh) throw e;
        order = await createOrder.mutateAsync({ ...input, shippingQuote: fresh.quote });
      }
      if (!order) throw new Error('The order was not saved.');
      setOrderId(order.id);
      if (order.shippingPayment?.txHash) setShippingPaid(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save the order.');
    } finally {
      setSaving(false);
    }
  }, [flow.txHash, shipping, quote, size, createOrder, requestQuote]);

  useEffect(() => {
    if (flow.confirmed && flow.txHash && orderId === null && !saving && !saveError) void saveOrder();
  }, [flow.confirmed, flow.txHash, orderId, saving, saveError, saveOrder]);

  const header = (
    <div className="flex shrink-0 items-start gap-3 border-b border-line-hairline px-5 pb-3 pt-1 md:px-6 md:pt-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-chip border border-line-hairline bg-surface-inset">
        {image && <Image src={image} alt="" fill className="object-cover" sizes="56px" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-content-primary" title={productAltName(product, locale)}>
          {name}
        </p>
        <p className="mt-0.5 font-mono text-xs text-content-muted">
          {flow.total > 0n ? formatUsdc(flow.total) : `${formatUsd(product.price_usd)} list`}
          {cop(flow.total) && <span className="text-content-faint"> · {cop(flow.total)}</span>}
          {size && <span className="text-content-faint"> · {size}</span>}
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-content-faint">USDC</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={busy}
        className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-content-faint transition-colors hover:text-content-primary disabled:opacity-40"
        aria-label="Close"
      >
        <CloseIcon />
      </button>
    </div>
  );

  // ── After the buy: save, then pay shipping ───────────────────────────────
  if (flow.confirmed && flow.txHash) {
    let body: React.ReactNode;
    if (shippingPaid) {
      body = (
        <div className="space-y-4 text-center">
          <p className="text-sm text-content-secondary">
            Shipping paid. We print on demand and ship within 1–10 days; track it under <span className="font-semibold">My orders</span>.
          </p>
          <button type="button" onClick={onClose} className={PRIMARY}>Done</button>
        </div>
      );
    } else if (orderId === null) {
      body = saveError ? (
        <div className="space-y-3">
          <p role="alert" className="rounded-chip border border-signal-reverted/30 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
            Your item is paid, but the order was not saved: {saveError}
          </p>
          <button type="button" onClick={() => void saveOrder()} disabled={saving} className={PRIMARY}>
            {saving ? 'Saving…' : 'Try again'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-content-muted">Saving your order…</p>
      );
    } else {
      const pending = payShipping.submitting || payShipping.cooldown;
      body = (
        <div className="space-y-3">
          <dl className="space-y-2 text-sm">
            <Row label={`Shipping · ${locale === 'es' ? quote?.zone.labelEs : quote?.zone.labelEn}`} value={formatUsdc(shippingUnits)} sub={cop(shippingUnits)} />
          </dl>
          <button
            type="button"
            onClick={async () => {
              if (await payShipping.pay({ id: orderId, amountUnits: shippingUnits.toString() })) setShippingPaid(true);
            }}
            disabled={pending || Boolean(payShipping.blocked)}
            className={PRIMARY}
          >
            {payShipping.submitting ? 'Paying shipping…' : payShipping.cooldown ? 'Confirming…' : `Pay shipping ${formatUsdc(shippingUnits)}`}
          </button>
          {payShipping.blocked && !pending && <p className="text-xs text-content-muted">{payShipping.blocked}</p>}
          {payShipping.error && (
            <p role="alert" className="rounded-chip border border-signal-reverted/30 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
              {payShipping.error}
            </p>
          )}
          {payShipping.txHash && <p className="text-xs text-content-muted">Transfer <HashChip hash={payShipping.txHash} /></p>}
          <p className="text-xs text-content-faint">Your order is saved. If you close this, you can pay shipping later from My orders.</p>
        </div>
      );
    }

    return (
      <Sheet onClose={onClose} label={name} dismissable={!busy}>
        {header}
        <div className={`${SHEET_BODY} px-5 py-5 md:px-6`}>
          <div className="mb-4 flex items-center gap-3 rounded-chip border border-signal-confirmed/30 bg-signal-confirmed/10 px-3 py-2">
            <CheckIcon className="h-5 w-5 shrink-0 text-signal-confirmed" strokeWidth={2} />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-content-primary">Item paid. The NFT is in your wallet.</p>
              <p className="text-content-muted">
                Transaction <HashChip hash={flow.txHash} />
              </p>
            </div>
          </div>
          {body}
        </div>
      </Sheet>
    );
  }

  // ── Before the buy ───────────────────────────────────────────────────────
  let action: React.ReactNode;
  switch (flow.step) {
    case 'connect':
      action = flow.walletPending ? (
        <button type="button" disabled className={PRIMARY}>Preparing your wallet…</button>
      ) : (
        <button type="button" onClick={flow.connect} className={PRIMARY}>Connect wallet</button>
      );
      break;
    case 'switch':
      action = (
        <button type="button" onClick={flow.switchChain} disabled={flow.isSwitching} className={PRIMARY}>
          {flow.isSwitching ? 'Switching…' : `Switch to ${flow.chainName}`}
        </button>
      );
      break;
    case 'approve':
      action = (
        <button
          type="button"
          onClick={flow.approve}
          disabled={flow.isApproving || flow.approveCooldown || Boolean(flow.blocked) || shortOfShipping}
          className={PRIMARY}
        >
          {flow.isApproving ? 'Approving…' : flow.approveCooldown ? 'Confirming approval…' : `Approve ${formatUsdc(flow.total)}`}
        </button>
      );
      break;
    default:
      action = (
        <button
          type="button"
          onClick={flow.buy}
          disabled={flow.isBuying || flow.buyCooldown || Boolean(flow.blocked) || flow.total <= 0n || shortOfShipping}
          className={PRIMARY}
        >
          {flow.isBuying ? 'Buying…' : flow.buyCooldown ? 'Confirming…' : `Buy for ${formatUsdc(flow.total)}`}
        </button>
      );
  }

  const needsAddress = flow.step !== 'connect' && (editingAddress || !quote);

  return (
    <Sheet onClose={onClose} label={name} dismissable={!busy}>
      {header}
      <div className={`${SHEET_BODY} px-5 py-5 md:px-6`}>
        {needsAddress ? (
          <>
            <p className="mb-3 text-sm text-content-secondary">Where should we send it? You’ll see the shipping cost before paying.</p>
            {quoteError && (
              <p role="alert" className="mb-3 rounded-chip border border-signal-reverted/30 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
                {quoteError}
              </p>
            )}
            <ShippingForm
              initial={shipping}
              submitLabel="See shipping cost"
              pendingLabel="Quoting…"
              pending={quoteMutation.isPending}
              onSubmit={(addr) => void requestQuote(addr)}
            />
          </>
        ) : (
          <>
            <dl className="mb-4 space-y-2 text-sm">
              <Row label="Item" value={flow.total > 0n ? formatUsdc(flow.total) : '—'} sub={cop(flow.total)} />
              {quote && (
                <Row
                  label={`Shipping · ${locale === 'es' ? quote.zone.labelEs : quote.zone.labelEn}`}
                  value={formatUsdc(shippingUnits)}
                  sub={cop(shippingUnits)}
                />
              )}
              {quote && <Row label="Total" value={formatUsdc(grandTotal)} sub={cop(grandTotal)} strong />}
              {flow.step !== 'connect' && <Row label="Your USDC" value={formatUsdc(flow.usdcBalance)} />}
              <Row label="Gas" value="Sponsored" />
            </dl>

            {quote && shipping && (
              <div className="mb-4 rounded-chip border border-line-hairline bg-surface-inset/50 px-3 py-2 text-xs text-content-muted">
                <p className="text-content-secondary">{shipping.name} · {shipping.city}, {shipping.region}</p>
                <p className="mt-1">
                  Printed on demand, ships within 1–10 days, then {quote.zone.etaMinDays}–{quote.zone.etaMaxDays} business days in transit.
                </p>
                <button type="button" onClick={() => setEditingAddress(true)} disabled={busy} className="mt-1 font-semibold text-eth-blue-text hover:underline disabled:text-content-faint">
                  Change address
                </button>
              </div>
            )}

            {shortOfShipping && (
              <p className="mb-3 rounded-chip border border-line-hairline bg-surface-inset px-3 py-2 text-sm text-content-secondary">
                You need {formatUsdc(grandTotal)} for the item and shipping; this wallet has {formatUsdc(flow.usdcBalance)}.
              </p>
            )}
            {flow.blocked && flow.step !== 'connect' && (
              <p className="mb-3 rounded-chip border border-line-hairline bg-surface-inset px-3 py-2 text-sm text-content-secondary">{flow.blocked}</p>
            )}
            {flow.error && (
              <p role="alert" className="mb-3 rounded-chip border border-signal-reverted/30 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
                {flow.error}
              </p>
            )}
            {flow.txHash && !flow.confirmed && (
              <p className="mb-3 text-sm text-content-muted">
                Submitted <HashChip hash={flow.txHash} /> — waiting for confirmation.
              </p>
            )}

            {action}

            {flow.step === 'approve' && (
              <p className="mt-3 text-xs text-content-faint">
                Approving lets the store pull exactly the item price once. Then you buy, then you pay shipping — three signatures, no gas.
              </p>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}

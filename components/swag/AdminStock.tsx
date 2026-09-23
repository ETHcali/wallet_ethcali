/**
 * Stock: one row per live token, read from getVariant() on the collection.
 *
 * The two caps and the active flag are edited inline and written together
 * with setVariant(tokenId, onchainCap, voucherCap, active) — the contract has
 * no partial setter. The USDC price is a separate call, setPaymentOption, with
 * its own button and its own pending state.
 *
 * The contract's two refusals — a cap below what is already minted, and both
 * caps at zero — are checked here first so the button says why before anyone
 * signs; if a race gets past that, the decoded revert says the same thing.
 */
import { useEffect, useState } from 'react';
import { encodeFunctionData, formatUnits, parseUnits } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import {
  SWAG,
  formatCop,
  formatUsd,
  formatUsdc,
  useSwagCatalogue,
  useSwagCollectionState,
  useSwagStock,
  useSwagAdminTx,
  useTrm,
  type SwagTokenStock,
} from '../../hooks/swag';
import type { SwagProduct } from '../../types/swag';
import { CARD, ChainGate, FIELD, LABEL, Pill, TxButton } from './AdminPrimitives';

const UINT128_MAX = (1n << 128n) - 1n;

function parseCap(value: string): bigint | null {
  if (!/^\d{1,30}$/.test(value.trim())) return null;
  const n = BigInt(value.trim());
  return n > UINT128_MAX ? null : n;
}

function StockRow({ product, stock, rate, canWrite }: { product: SwagProduct; stock: SwagTokenStock | undefined; rate: number | null; canWrite: string | null }) {
  const tokenId = product.variant!.token_id;
  const saveTx = useSwagAdminTx();
  const priceTx = useSwagAdminTx();

  const [onchainCap, setOnchainCap] = useState('');
  const [voucherCap, setVoucherCap] = useState('');
  const [active, setActive] = useState(true);
  const [price, setPrice] = useState('');

  // Follow the chain: when a refetch lands (ours or someone else's), the
  // drafts show the new truth. The user's typing survives because this only
  // runs when the on-chain values themselves change.
  useEffect(() => {
    if (!stock) return;
    setOnchainCap(stock.onchainCap.toString());
    setVoucherCap(stock.voucherCap.toString());
    setActive(stock.active);
    setPrice(stock.priceUsdc > 0n ? formatUnits(stock.priceUsdc, SWAG.usdcDecimals) : '');
  }, [stock]);

  const oc = parseCap(onchainCap);
  const vc = parseCap(voucherCap);
  const capReason = !stock
    ? 'Reading the chain…'
    : canWrite
      ? canWrite
      : oc === null || vc === null
        ? 'Caps must be whole numbers.'
        : oc === 0n && vc === 0n
          ? 'At least one cap must be above zero.'
          : oc < stock.onchainMinted
            ? `On-chain cap cannot go below ${stock.onchainMinted.toString()} already minted.`
            : vc < stock.voucherMinted
              ? `Voucher cap cannot go below ${stock.voucherMinted.toString()} already minted.`
              : oc === stock.onchainCap && vc === stock.voucherCap && active === stock.active
                ? 'Nothing changed.'
                : null;

  let priceUnits: bigint | null = null;
  try {
    priceUnits = /^\d+(\.\d{1,6})?$/.test(price.trim()) ? parseUnits(price.trim(), SWAG.usdcDecimals) : null;
  } catch {
    priceUnits = null;
  }
  const priceReason = !stock
    ? 'Reading the chain…'
    : canWrite
      ? canWrite
      : priceUnits === null || priceUnits <= 0n
        ? 'Enter a USDC amount above zero, up to 6 decimals.'
        : priceUnits === stock.priceUsdc
          ? 'Price unchanged.'
          : null;

  const save = () => {
    if (oc === null || vc === null) return;
    return saveTx.run(
      encodeFunctionData({ abi: swag1155Abi, functionName: 'setVariant', args: [BigInt(tokenId), oc, vc, active] })
    );
  };
  const setPriceOnChain = () => {
    if (priceUnits === null) return;
    return priceTx.run(
      encodeFunctionData({ abi: swag1155Abi, functionName: 'setPaymentOption', args: [BigInt(tokenId), SWAG.usdc, priceUnits] })
    );
  };

  const remainingOnchain = stock ? stock.onchainCap - stock.onchainMinted : 0n;
  const remainingVoucher = stock ? stock.voucherCap - stock.voucherMinted : 0n;
  const priceUsd = stock ? Number(formatUnits(stock.priceUsdc, SWAG.usdcDecimals)) : 0;

  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-content-primary" title={product.name_es}>{product.name_en}</p>
          <p className="mt-1 font-mono text-xs text-content-muted">token {tokenId} · {product.sku} · {product.category}</p>
        </div>
        {stock && <Pill tone={stock.active ? 'confirmed' : 'muted'}>{stock.active ? 'Active' : 'Inactive'}</Pill>}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">On-chain</dt>
          <dd className="font-mono text-content-primary">{stock ? `${stock.onchainMinted.toString()} / ${stock.onchainCap.toString()}` : '…'}</dd>
          <dd className="text-[11px] text-content-faint">{stock ? `${remainingOnchain.toString()} left to buy` : ''}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Voucher</dt>
          <dd className="font-mono text-content-primary">{stock ? `${stock.voucherMinted.toString()} / ${stock.voucherCap.toString()}` : '…'}</dd>
          <dd className="text-[11px] text-content-faint">{stock ? `${remainingVoucher.toString()} left to claim` : ''}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">USDC price</dt>
          <dd className="font-mono text-content-primary">
            {stock ? (stock.priceUsdc > 0n ? formatUsdc(stock.priceUsdc) : 'Not set') : '…'}
            {stock && stock.priceUsdc > 0n && (
              <span className="ml-2 font-sans text-xs text-content-faint">
                {formatUsd(priceUsd)}{rate ? ` · ${formatCop(priceUsd * rate)}` : ''}
              </span>
            )}
          </dd>
          {stock && Math.abs(priceUsd - product.price_usd) > 0.000001 && (
            <dd className="text-[11px] text-signal-pending">Catalogue lists {formatUsd(product.price_usd)}.</dd>
          )}
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-line-hairline pt-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={LABEL}>On-chain cap</span>
              <input type="text" inputMode="numeric" value={onchainCap} onChange={(e) => setOnchainCap(e.target.value)} className={`${FIELD} font-mono`} disabled={!stock || saveTx.submitting || saveTx.cooldown} />
            </label>
            <label className="block">
              <span className={LABEL}>Voucher cap</span>
              <input type="text" inputMode="numeric" value={voucherCap} onChange={(e) => setVoucherCap(e.target.value)} className={`${FIELD} font-mono`} disabled={!stock || saveTx.submitting || saveTx.cooldown} />
            </label>
          </div>
          <label className="flex min-h-[36px] items-center gap-2 text-sm text-content-secondary">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-eth-blue" disabled={!stock || saveTx.submitting || saveTx.cooldown} />
            On sale
          </label>
          <TxButton label="Save caps" pendingLabel="Saving caps…" tx={saveTx} onClick={save} reason={capReason} />
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className={LABEL}>USDC price per unit</span>
            <input type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="25.00" className={`${FIELD} font-mono`} disabled={!stock || priceTx.submitting || priceTx.cooldown} />
          </label>
          {priceUnits !== null && priceUnits > 0n && rate && (
            <p className="text-[11px] text-content-faint">{formatCop(Number(formatUnits(priceUnits, SWAG.usdcDecimals)) * rate)} at today&apos;s TRM</p>
          )}
          <TxButton label="Set price" pendingLabel="Setting price…" tx={priceTx} onClick={setPriceOnChain} reason={priceReason} variant="secondary" />
        </div>
      </div>
    </li>
  );
}

export function AdminStock() {
  const { products, tokenIds, isLoading, error } = useSwagCatalogue();
  const { stock, error: stockError } = useSwagStock(tokenIds);
  const { rate } = useTrm();
  const { isAdmin, isLoading: rolesLoading } = useSwagCollectionState();

  const canWrite = rolesLoading ? 'Reading your roles…' : !isAdmin ? 'Needs ADMIN_ROLE on the collection.' : null;
  const live = products.filter((p) => p.variant !== null);

  return (
    <div className="space-y-4">
      <ChainGate />
      {isLoading && <p className="text-sm text-content-faint">Loading the catalogue…</p>}
      {error && <p className="text-sm text-signal-reverted">{error}</p>}
      {stockError && <p className="text-sm text-signal-reverted">Could not read the collection: {stockError}</p>}
      {!isLoading && live.length === 0 && (
        <div className={`${CARD} text-center`}>
          <p className="text-sm text-content-muted">No design is live on chain yet.</p>
        </div>
      )}
      <ul className="space-y-3">
        {live.map((product) => (
          <StockRow key={product.id} product={product} stock={stock[product.variant!.token_id]} rate={rate} canWrite={canWrite} />
        ))}
      </ul>
    </div>
  );
}

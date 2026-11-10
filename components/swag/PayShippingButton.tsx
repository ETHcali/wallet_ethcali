/**
 * "Pay shipping" on an order that was saved after the item was bought but
 * before its shipping transfer went through. One primary action at a time:
 * the right wallet → the right chain → pay. The transfer and the server's
 * check live in usePayShipping; this component only decides which button.
 */
import { formatUnits } from 'viem';
import { formatCop, formatUsdc, SWAG, usePayShipping, useSwagLocale, useTrm } from '../../hooks/swag';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useRequireChain } from '../../hooks/useRequireChain';
import SwitchChainButton from '../shared/SwitchChainButton';
import { HashChip } from '../shared/HashChip';
import type { SwagOrderView } from '../../types/swag-orders';

const BUTTON =
  'flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint';

export function PayShippingButton({ order }: { order: SwagOrderView }) {
  const locale = useSwagLocale();
  const { rate } = useTrm();
  const { address } = useActiveWallet();
  const chain = useRequireChain(SWAG.chainId);
  const pay = usePayShipping();
  const due = order.shippingPayment;
  if (!due || due.txHash || order.status !== 'awaiting_shipping_payment') return null;

  const units = BigInt(due.amountUnits);
  const usd = Number(formatUnits(units, 6));
  const pending = pay.submitting || pay.cooldown;
  const wrongWallet = !address || address.toLowerCase() !== due.wallet;
  const es = locale === 'es';

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-content-muted">
        {es ? 'Falta el envío' : 'Shipping due'}: <span className="font-mono text-content-primary">{formatUsdc(units)}</span>
        {rate && <span className="font-mono text-content-faint"> · {formatCop(usd * rate)}</span>}
      </p>
      {wrongWallet ? (
        <p className="text-xs text-content-secondary">
          {es ? 'Paga desde la wallet que compró' : 'Pay from the wallet that bought it'}: <HashChip hash={due.wallet} kind="address" />
        </p>
      ) : !chain.ready ? (
        <SwitchChainButton chain={chain} />
      ) : (
        <button type="button" onClick={() => void pay.pay({ id: order.id, amountUnits: due.amountUnits })} disabled={pending || Boolean(pay.blocked)} className={BUTTON}>
          {pay.submitting ? (es ? 'Pagando envío…' : 'Paying shipping…') : pay.cooldown ? (es ? 'Confirmando…' : 'Confirming…') : `${es ? 'Pagar envío' : 'Pay shipping'} ${formatUsdc(units)}`}
        </button>
      )}
      {pay.error && <p role="alert" className="text-xs text-signal-reverted">{pay.error}</p>}
      {pay.txHash && <p className="text-xs text-content-muted">{es ? 'Transferencia' : 'Transfer'} <HashChip hash={pay.txHash} /></p>}
    </div>
  );
}

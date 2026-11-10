/**
 * One screen's worth of numbers for the swag admin.
 *
 *   GET /api/swag/admin/summary
 *
 * Two sources, kept apart in the payload because they answer different
 * questions. `counts` and `voucherCancelQueue` come from swag_orders — the
 * fulfilment record, which is what this table is authoritative for. `collection`
 * is read from the chain in one multicall: paused, treasury, and every live
 * token's caps, minted counts and USDC price. Nothing about stock or money is
 * taken from the database.
 *
 * The queue carries the chain's own verdict per row (`orderClaimed(orderRef)`)
 * so an operator can see at a glance whether cancelOrder() already ran from
 * somewhere else — the flag in notes is a reminder, not the truth.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { swag1155Abi } from '../../../../frontend/abis/swag';
import { SWAG_COLLECTION } from '../../../../config/constants';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { getSwagClient, getSwagCollection, SWAG_CHAIN_ID } from '../../../../lib/swag/onchain';
import { ATTENTION_COLUMNS, countAttention, listVoucherCancelQueue, OrderError, type AttentionRow } from '../../../../lib/swag/orders';
import { requireSwagStaff } from '../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { logger } from '../../../../utils/logger';
import type {
  SwagAdminSummary,
  SwagAdminTokenStock,
  SwagCurrency,
  SwagOrderChannel,
  SwagOrderStatus,
} from '../../../../types/swag-orders';

type Reply = SwagAdminSummary | { error: string };

type VariantTuple = {
  onchainCap: bigint;
  onchainMinted: bigint;
  voucherCap: bigint;
  voucherMinted: bigint;
  active: boolean;
};

async function readCollection(): Promise<SwagAdminSummary['collection']> {
  const client = getSwagClient();
  const address = getSwagCollection();
  const target = { address, abi: swag1155Abi } as const;

  const [paused, treasury, tokenIds] = await Promise.all([
    client.readContract({ ...target, functionName: 'paused' }),
    client.readContract({ ...target, functionName: 'treasury' }),
    client.readContract({ ...target, functionName: 'listTokenIds' }),
  ]);

  const ids = [...tokenIds];
  const results = await client.multicall({
    allowFailure: true,
    contracts: ids.flatMap((id) => [
      { ...target, functionName: 'getVariant', args: [id] },
      { ...target, functionName: 'getTokenPrice', args: [id, SWAG_COLLECTION.usdc] },
    ]),
  });

  const stock: SwagAdminTokenStock[] = ids.map((id, i) => {
    const variant = results[i * 2];
    const price = results[i * 2 + 1];
    const v = variant.status === 'success' ? (variant.result as VariantTuple) : null;
    return {
      tokenId: Number(id),
      onchainCap: (v?.onchainCap ?? 0n).toString(),
      onchainMinted: (v?.onchainMinted ?? 0n).toString(),
      voucherCap: (v?.voucherCap ?? 0n).toString(),
      voucherMinted: (v?.voucherMinted ?? 0n).toString(),
      active: v?.active ?? false,
      priceUsdc: (price.status === 'success' ? (price.result as bigint) : 0n).toString(),
    };
  });

  return { address, chainId: SWAG_CHAIN_ID, paused, treasury, stock };
}

type LedgerRow = AttentionRow & {
  item_amount: number | string | null;
  item_currency: SwagCurrency | null;
  shipping_amount: number | string | null;
  shipping_currency: SwagCurrency | null;
  shipping_quote: { amountUnits?: string } | null;
};

async function readCounts(): Promise<Pick<SwagAdminSummary, 'counts' | 'revenue' | 'shippingDue' | 'attention'>> {
  const { data, error } = await getSupabaseAdmin()
    .from('swag_orders')
    .select(`${ATTENTION_COLUMNS}, item_amount, item_currency, shipping_amount, shipping_currency, shipping_quote`);
  if (error) throw new OrderError(error.message, 500);

  // Amounts are copies of the payment of record (see the ledger migration);
  // summed here for the desk, never used to decide anything.
  const revenue: SwagAdminSummary['revenue'] = {
    USDC: { item: 0, shipping: 0, orders: 0 },
    COP: { item: 0, shipping: 0, orders: 0 },
  };
  const shippingDue = { orders: 0, usdc: 0 };
  for (const row of (data ?? []) as LedgerRow[]) {
    if (row.status === 'cancelled') continue;
    if (row.item_currency) {
      revenue[row.item_currency].item += Number(row.item_amount ?? 0);
      revenue[row.item_currency].orders += 1;
    }
    if (row.shipping_currency) revenue[row.shipping_currency].shipping += Number(row.shipping_amount ?? 0);
    if (row.status === 'awaiting_shipping_payment' && row.shipping_quote?.amountUnits) {
      shippingDue.orders += 1;
      shippingDue.usdc += Number(row.shipping_quote.amountUnits) / 1e6;
    }
  }

  const byStatus: Record<SwagOrderStatus, number> = { awaiting_shipping_payment: 0, paid: 0, in_production: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const byChannel: Record<SwagOrderChannel, number> = { onchain: 0, shopify: 0, event: 0 };
  for (const row of (data ?? []) as Array<{ status: SwagOrderStatus; channel: SwagOrderChannel }>) {
    if (row.status in byStatus) byStatus[row.status] += 1;
    if (row.channel in byChannel) byChannel[row.channel] += 1;
  }
  return {
    counts: { byStatus, byChannel, total: data?.length ?? 0 },
    revenue,
    shippingDue,
    attention: countAttention((data ?? []) as LedgerRow[]),
  };
}

async function readQueue(): Promise<SwagAdminSummary['voucherCancelQueue']> {
  const rows = await listVoucherCancelQueue(getSupabaseAdmin());
  if (rows.length === 0) return [];

  const address = getSwagCollection();
  const claimed = await getSwagClient().multicall({
    allowFailure: true,
    contracts: rows.map((row) => ({
      address,
      abi: swag1155Abi,
      functionName: 'orderClaimed' as const,
      args: [row.order_ref] as const,
    })),
  });

  return rows.map((row, i) => ({
    id: row.id,
    orderRef: row.order_ref,
    buyerEmail: row.buyer_email,
    tokenId: row.variant.token_id,
    closedOnChain: claimed[i].status === 'success' ? Boolean(claimed[i].result) : false,
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let viewer: SwagAdminSummary['viewer'];
  try {
    const staff = await requireSwagStaff(req);
    viewer = { role: staff.role, superAdmin: staff.superAdmin, wallet: staff.admin };
  } catch (e) {
    return sendAuthError(res, e);
  }

  try {
    const [ledger, collection, voucherCancelQueue] = await Promise.all([
      readCounts(),
      readCollection(),
      readQueue(),
    ]);
    // The notes flag is a reminder; the chain says whether cancelOrder() already ran.
    const attention = { ...ledger.attention, voucher_cancel: voucherCancelQueue.filter((q) => !q.closedOnChain).length };
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ viewer, ...ledger, attention, collection, voucherCancelQueue });
  } catch (e) {
    if (e instanceof OrderError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/summary] failed', e);
    return res.status(500).json({ error: 'Could not build the summary' });
  }
}

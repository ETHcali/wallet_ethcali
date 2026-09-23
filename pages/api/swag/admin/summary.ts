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
import { listVoucherCancelQueue, OrderError } from '../../../../lib/swag/orders';
import { requireSwagAdmin } from '../../../../lib/swag/requireSwagAdmin';
import { sendAuthError } from '../../../../lib/swag/requireUser';
import { logger } from '../../../../utils/logger';
import type {
  SwagAdminSummary,
  SwagAdminTokenStock,
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

async function readCounts(): Promise<SwagAdminSummary['counts']> {
  const { data, error } = await getSupabaseAdmin().from('swag_orders').select('status, channel');
  if (error) throw new OrderError(error.message, 500);

  const byStatus: Record<SwagOrderStatus, number> = { paid: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const byChannel: Record<SwagOrderChannel, number> = { onchain: 0, shopify: 0, event: 0 };
  for (const row of (data ?? []) as Array<{ status: SwagOrderStatus; channel: SwagOrderChannel }>) {
    if (row.status in byStatus) byStatus[row.status] += 1;
    if (row.channel in byChannel) byChannel[row.channel] += 1;
  }
  return { byStatus, byChannel, total: data?.length ?? 0 };
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

  try {
    await requireSwagAdmin(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  try {
    const [counts, collection, voucherCancelQueue] = await Promise.all([
      readCounts(),
      readCollection(),
      readQueue(),
    ]);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ counts, collection, voucherCancelQueue });
  } catch (e) {
    if (e instanceof OrderError) return res.status(e.status).json({ error: e.message });
    logger.error('[swag/admin/summary] failed', e);
    return res.status(500).json({ error: 'Could not build the summary' });
  }
}

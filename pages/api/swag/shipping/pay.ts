/**
 * POST /api/swag/shipping/pay { orderId, txHash } — the buyer has sent the
 * shipping USDC; check it on chain and release the order to the desk.
 *
 * Nothing is taken from the client but the two identifiers:
 *   - the order must belong to the caller (buyer_wallet is a linked wallet)
 *     and still be awaiting_shipping_payment;
 *   - its stored quote must still carry our signature (it was checked at
 *     creation; this catches a row edited by hand);
 *   - the receipt must hold USDC Transfers from the quote's wallet to the
 *     collection's treasury — read from the collection now — summing to at
 *     least the quoted amount;
 *   - the transaction may pay one order only (unique shipping_tx_hash);
 *   - the transaction must not be a purchase or claim on the collection:
 *     buy() itself moves USDC from the buyer to the treasury, so without this
 *     an item's own receipt (always larger than a shipping quote) would pass
 *     as its shipping payment. A real shipping payment is a bare transfer.
 * Then awaiting_shipping_payment → paid, conditional on the status so two
 * racing requests cannot both win.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Address } from 'viem';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { requireUser, sendAuthError, type VerifiedUser } from '../../../../lib/swag/requireUser';
import { findClaimed, findPurchased, isTxHash, readSwagTreasury, ReceiptError, usdcTransferred } from '../../../../lib/swag/onchain';
import { getOrderById, getOrderByTxHash, OrderError, toOrderView } from '../../../../lib/swag/orders';
import { ShippingError, verifyQuote } from '../../../../lib/swag/shipping';
import { logger } from '../../../../utils/logger';
import type { SwagOrderView } from '../../../../types/swag-orders';

type Reply = { order: SwagOrderView } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user: VerifiedUser;
  try {
    user = await requireUser(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  const orderId = Number(req.body?.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) return res.status(400).json({ error: 'orderId must be a positive integer' });
  if (!isTxHash(req.body?.txHash)) return res.status(400).json({ error: 'txHash must be a 32-byte hex hash' });
  const txHash = (req.body.txHash as string).toLowerCase() as `0x${string}`;

  const db = getSupabaseAdmin();
  try {
    const order = await getOrderById(db, orderId);
    if (!order || !order.buyer_wallet || !user.wallets.includes(order.buyer_wallet)) {
      return res.status(404).json({ error: 'No such order on this account' });
    }
    if (order.shipping_tx_hash === txHash) return res.status(200).json({ order: toOrderView(order) });
    if (order.status !== 'awaiting_shipping_payment' || !order.shipping_quote) {
      return res.status(409).json({ error: 'This order is not waiting for a shipping payment' });
    }

    // An item purchase is not a shipping payment, however much USDC it moved.
    if ((await getOrderByTxHash(db, txHash)) || (await findPurchased(txHash)) || (await findClaimed(txHash))) {
      return res.status(422).json({ error: 'That transaction paid for an item, not shipping. Send the shipping transfer on its own.' });
    }

    const quote = verifyQuote(order.shipping_quote, { checkExpiry: false });
    const treasury = await readSwagTreasury();
    const paid = await usdcTransferred(txHash, quote.wallet as Address, treasury);
    if (paid < BigInt(quote.amountUnits)) {
      return res.status(422).json({
        error: paid === 0n ? 'That transaction does not pay shipping to the store.' : 'That transaction pays less than the shipping quote.',
      });
    }

    const { data, error } = await db
      .from('swag_orders')
      .update({
        shipping_tx_hash: txHash,
        status: 'paid',
        // The quoted amount, which the transfer was just checked to cover.
        shipping_amount: Number(quote.amountUnits) / 1e6,
        shipping_currency: 'USDC',
      })
      .eq('id', orderId)
      .eq('status', 'awaiting_shipping_payment')
      .select('id');
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'That transaction already paid shipping for another order' });
      throw new OrderError(error.message, 500);
    }
    if (!data || data.length === 0) {
      const now = await getOrderById(db, orderId);
      if (now?.shipping_tx_hash === txHash) return res.status(200).json({ order: toOrderView(now) });
      return res.status(409).json({ error: 'This order is not waiting for a shipping payment' });
    }

    logger.info(`[swag/shipping/pay] order ${orderId} shipping paid in ${txHash}`);
    const updated = await getOrderById(db, orderId);
    return res.status(200).json({ order: toOrderView(updated ?? order) });
  } catch (e) {
    if (e instanceof OrderError || e instanceof ReceiptError || e instanceof ShippingError) {
      return res.status(e.status).json({ error: e.message });
    }
    logger.error('[swag/shipping/pay] failed', e);
    return res.status(500).json({ error: 'Could not record the shipping payment' });
  }
}

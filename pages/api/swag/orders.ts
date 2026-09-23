/**
 * Swag orders for the signed-in buyer.
 *
 *   GET  /api/swag/orders   everything I bought, through either channel
 *   POST /api/swag/orders   record the shipping details for a buy() I just made
 *
 * Both need a Privy session (Authorization: Bearer <access token>). Who "I"
 * am is decided entirely by lib/swag/requireUser: my linked wallets own my
 * onchain orders, my verified emails own my Shopify orders.
 *
 * POST is where the architecture rule bites. The client sends a transaction
 * hash and an address to ship to; it does not get to say what it bought. The
 * server reads the receipt on the collection's chain, finds the Purchased log the collection
 * emitted, and takes buyer, tokenId and quantity from there. If the buyer in
 * the log is not one of the caller's wallets, there is no order — someone is
 * trying to attach a shipping address to a purchase that is not theirs.
 *
 * Once the row exists it is mirrored into Shopify (lib/swag/shopifyMirror.ts)
 * so the parcel is packed from the same queue as a card order. The mirror is
 * best-effort: a Shopify failure is reported in the response (`mirror`) and
 * flagged on the row, but the order — a paid order — is never lost over it.
 *
 * Idempotent on tx_hash: a second POST for the same receipt returns the row
 * that exists, so a retried request after a flaky response does not produce
 * two parcels. If that row is still missing its mirror, the retry mirrors it.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { requireUser, sendAuthError, UserAuthError } from '../../../lib/swag/requireUser';
import { findPurchased, isTxHash, ReceiptError } from '../../../lib/swag/onchain';
import {
  getOrderByTxHash,
  insertOrder,
  listOrdersFor,
  mirrorOnchainOrder,
  OrderError,
  parseShipping,
  parseSize,
  resolveVariantByToken,
  toOrderView,
  type OrderJoined,
} from '../../../lib/swag/orders';
import { logger } from '../../../utils/logger';
import type {
  CreateSwagOrderBody,
  CreateSwagOrderResponse,
  SwagMirrorResult,
  SwagOrdersResponse,
} from '../../../types/swag-orders';

type Reply = SwagOrdersResponse | CreateSwagOrderResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user;
  try {
    user = await requireUser(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  const db = getSupabaseAdmin();
  // The email Shopify shows on the mirrored order, when Privy has verified one.
  const email = user.emails[0] ?? null;

  try {
    if (req.method === 'GET') {
      const orders = await listOrdersFor(db, user);
      return res.status(200).json({ orders });
    }

    // ── POST ────────────────────────────────────────────────────────────
    const body = (req.body ?? {}) as Partial<CreateSwagOrderBody>;

    if (!isTxHash(body.txHash)) {
      return res.status(400).json({ error: 'txHash must be a 32-byte hex hash' });
    }
    const txHash = body.txHash.toLowerCase() as `0x${string}`;
    const shipping = parseShipping(body.shipping);
    const size = parseSize(body.size);

    // Already on file? Then this is a retry, and the answer is the row we have
    // — but only to the person it belongs to.
    const existing = await getOrderByTxHash(db, txHash);
    if (existing) {
      if (!existing.buyer_wallet || !user.wallets.includes(existing.buyer_wallet)) {
        return res.status(409).json({ error: 'This purchase is already recorded to another account' });
      }
      const mirror = await mirrorExisting(db, existing, txHash, email);
      return res.status(200).json({ order: toOrderView(existing), existing: true, mirror });
    }

    const purchased = await findPurchased(txHash);
    if (!purchased) {
      return res.status(422).json({ error: 'That transaction is not a purchase on the swag collection' });
    }

    const buyer = purchased.buyer.toLowerCase();
    if (!user.wallets.includes(buyer)) {
      return res.status(403).json({ error: 'That purchase was made by a wallet not linked to this account' });
    }

    const quantity = Number(purchased.quantity);
    if (body.quantity !== undefined && Number(body.quantity) !== quantity) {
      return res.status(400).json({ error: `The receipt says quantity ${quantity}` });
    }

    const variant = await resolveVariantByToken(db, Number(purchased.tokenId));
    if (!variant) {
      logger.error(`[swag/orders] tokenId ${purchased.tokenId} in ${txHash} is not in the catalogue`);
      return res.status(422).json({ error: 'That token is not in the catalogue. Contact the team.' });
    }

    if (variant.sized) {
      if (!size) return res.status(400).json({ error: 'size is required for this design' });
      if (!variant.sizes.includes(size)) {
        return res.status(400).json({ error: `size must be one of ${variant.sizes.join(', ')}` });
      }
    } else if (size) {
      return res.status(400).json({ error: 'This design has no sizes' });
    }

    let row: OrderJoined;
    try {
      row = await insertOrder(db, {
        channel: 'onchain',
        product_id: variant.productId,
        variant_id: variant.variantId,
        quantity,
        size,
        buyer_wallet: buyer,
        shipping,
        tx_hash: txHash,
        // A crypto order needs no claim key, but the column is the table's
        // idempotency spine, so it gets the receipt's own identity.
        order_ref: txHash,
      });
    } catch (e) {
      // Two requests for the same receipt raced past the check above. The
      // unique constraint decided; hand back the winner.
      if (e instanceof OrderError && e.status === 409) {
        const winner = await getOrderByTxHash(db, txHash);
        if (winner) {
          const mirror = await mirrorExisting(db, winner, txHash, email);
          return res.status(200).json({ order: toOrderView(winner), existing: true, mirror });
        }
      }
      throw e;
    }

    // The row is safe. Whatever Shopify says next, the answer is 201.
    const mirror = await mirrorOnchainOrder(db, row, purchased, email);
    return res.status(201).json({ order: toOrderView(row), existing: false, mirror });
  } catch (e) {
    if (e instanceof UserAuthError || e instanceof OrderError || e instanceof ReceiptError) {
      return res.status(e.status).json({ error: e.message });
    }
    logger.error('[swag/orders] failed', e);
    return res.status(500).json({ error: 'Could not process the order' });
  }
}

/**
 * A retry for a row that exists. If it already has its mirror, say so; if
 * not, read the receipt again (the amount paid comes from the log, never the
 * row) and mirror it now. A receipt that cannot be read is a mirror failure,
 * not an order failure — the row is already on file.
 */
async function mirrorExisting(
  db: ReturnType<typeof getSupabaseAdmin>,
  row: OrderJoined,
  txHash: `0x${string}`,
  email: string | null
): Promise<SwagMirrorResult> {
  if (row.shopify_order_id) return { ok: true, shopifyOrderId: row.shopify_order_id, skipped: true };
  try {
    const purchased = await findPurchased(txHash);
    if (!purchased) return { ok: false, error: 'Purchased log not found on the receipt' };
    return await mirrorOnchainOrder(db, row, purchased, email);
  } catch (e) {
    const reason = (e as Error).message;
    logger.error(`[swag/orders] order ${row.id}: mirror retry could not read the receipt: ${reason}`);
    return { ok: false, error: reason };
  }
}

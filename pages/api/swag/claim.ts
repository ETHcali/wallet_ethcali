/**
 * Claim the NFT behind a Shopify order.
 *
 *   POST /api/swag/claim  { orderId, to? }        → issue a voucher
 *   POST /api/swag/claim  { orderId, txHash }     → confirm the mint
 *
 * One route, two modes, told apart by `txHash`. Both need a Privy session.
 *
 * Issue: the caller's verified emails must include the order's buyer_email.
 * The server picks tokenId (catalogue), quantity (Shopify), orderRef (the
 * order's own key) and deadline (now + 7 days); the caller only picks which of
 * their linked wallets receives the token, defaulting to the embedded one. The
 * signed voucher is stored on the row and returned. Asking again re-signs with
 * a fresh deadline and overwrites — same orderRef, so the contract's
 * orderClaimed[] still allows exactly one mint however many vouchers exist.
 *
 * Confirm: the caller names the transaction that redeemed it. The server reads
 * the receipt, finds the collection's Claimed log, and only records
 * claim_tx_hash when the log's orderRef and recipient are this order's. The
 * chain decided that the mint happened; the row just remembers where.
 *
 * Status: a cancelled (refunded) order cannot be claimed. Any other status can
 * — the parcel being marked shipped or delivered by the warehouse is not a
 * reason to withhold the token the buyer paid for.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { requireUser, sendAuthError, UserAuthError } from '../../../lib/swag/requireUser';
import {
  findClaimed,
  getSwagCollection,
  isTxHash,
  ReceiptError,
  SWAG_CHAIN_ID,
} from '../../../lib/swag/onchain';
import { getOrderById, OrderError } from '../../../lib/swag/orders';
import { signClaimVoucher, VOUCHER_TTL_SECONDS } from '../../../lib/swag/voucher';
import { logger } from '../../../utils/logger';
import type {
  ClaimConfirmResponse,
  ClaimIssueResponse,
  StoredVoucher,
} from '../../../types/swag-orders';

type Reply = ClaimIssueResponse | ClaimConfirmResponse | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reply>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user;
  try {
    user = await requireUser(req);
  } catch (e) {
    return sendAuthError(res, e);
  }

  const body = (req.body ?? {}) as { orderId?: unknown; to?: unknown; txHash?: unknown };
  const orderId = Number(body.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  const db = getSupabaseAdmin();

  try {
    const order = await getOrderById(db, orderId);

    // "Not yours" and "does not exist" read the same from outside. Order ids
    // are sequential, and confirming which ones exist is information too.
    const owned =
      order !== null &&
      order.channel === 'shopify' &&
      order.buyer_email !== null &&
      user.emails.includes(order.buyer_email.toLowerCase());
    if (!order || !owned) {
      return res.status(404).json({ error: 'No such order' });
    }

    if (order.status === 'cancelled') {
      return res.status(409).json({ error: 'This order was refunded and cannot be claimed' });
    }

    // ── Confirm ─────────────────────────────────────────────────────────
    if (body.txHash !== undefined) {
      if (!isTxHash(body.txHash)) {
        return res.status(400).json({ error: 'txHash must be a 32-byte hex hash' });
      }
      const txHash = body.txHash.toLowerCase();

      if (order.claim_tx_hash) {
        if (order.claim_tx_hash === txHash) {
          return res.status(200).json({ orderId, claimTxHash: txHash });
        }
        return res.status(409).json({ error: 'This order was already claimed in another transaction' });
      }
      if (!order.voucher) {
        return res.status(409).json({ error: 'No voucher was issued for this order' });
      }

      const claimed = await findClaimed(txHash as `0x${string}`);
      if (!claimed) {
        return res.status(422).json({ error: 'That transaction did not claim anything on the swag collection' });
      }
      const stored = order.voucher as StoredVoucher;
      const matches =
        claimed.orderRef.toLowerCase() === order.order_ref.toLowerCase() &&
        claimed.to.toLowerCase() === stored.voucher.to.toLowerCase() &&
        claimed.tokenId.toString() === stored.voucher.tokenId;
      if (!matches) {
        return res.status(422).json({ error: 'That transaction claimed a different order' });
      }

      const { error } = await db
        .from('swag_orders')
        .update({ claim_tx_hash: txHash })
        .eq('id', orderId)
        .is('claim_tx_hash', null);
      if (error) {
        // 23505: the same hash is already on another row, which cannot happen
        // for a matching orderRef; anything else is an outage.
        throw new OrderError(error.message, error.code === '23505' ? 409 : 500);
      }
      return res.status(200).json({ orderId, claimTxHash: txHash });
    }

    // ── Issue ───────────────────────────────────────────────────────────
    if (order.claim_tx_hash) {
      return res.status(409).json({ error: 'This order has already been claimed' });
    }

    let to: string | null;
    if (body.to !== undefined) {
      if (typeof body.to !== 'string' || !isAddress(body.to)) {
        return res.status(400).json({ error: 'to must be an address' });
      }
      to = body.to.toLowerCase();
      if (!user.wallets.includes(to)) {
        return res.status(403).json({ error: 'That wallet is not linked to this account' });
      }
    } else {
      to = user.embeddedWallet ?? user.wallets[0] ?? null;
    }
    if (!to) {
      return res.status(400).json({ error: 'Link a wallet to this account before claiming' });
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + VOUCHER_TTL_SECONDS);
    const signed = await signClaimVoucher({
      tokenId: BigInt(order.variant.token_id),
      to: to as `0x${string}`,
      quantity: BigInt(order.quantity),
      orderRef: order.order_ref,
      deadline,
    });

    const stored: StoredVoucher = {
      voucher: signed.voucher,
      signature: signed.signature,
      issuedAt: new Date().toISOString(),
    };
    const { error } = await db
      .from('swag_orders')
      .update({ voucher: stored })
      .eq('id', orderId)
      .is('claim_tx_hash', null);
    if (error) throw new OrderError(error.message, 500);

    return res.status(200).json({
      orderId,
      voucher: signed.voucher,
      signature: signed.signature,
      collection: getSwagCollection(),
      chainId: SWAG_CHAIN_ID,
    });
  } catch (e) {
    if (e instanceof UserAuthError || e instanceof OrderError || e instanceof ReceiptError) {
      return res.status(e.status).json({ error: e.message });
    }
    logger.error('[swag/claim] failed', e);
    return res.status(500).json({ error: 'Could not process the claim' });
  }
}

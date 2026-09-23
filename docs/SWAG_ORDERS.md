# Swag orders

How a piece of merch gets from "paid" to "shipped, and the NFT is in the buyer's
wallet", through either channel. The table is `public.swag_orders`
(`supabase/migrations/20260923100000_swag_orders.sql`); the code is `lib/swag/*`,
`pages/api/swag/*`, `pages/api/shopify/webhook.ts` and `pages/swag/claim.tsx`.

The architecture rule applies in full. The chain is the receipt for a crypto
purchase and the proof of every mint; Shopify is the payment of record for a card
purchase. `swag_orders` is authoritative only for what neither of those knows:
size, shipping address, fulfilment status, and which voucher was issued.

## Who owns an order

`lib/swag/requireUser.ts` verifies the Privy access token against Privy's JWKS
and resolves the DID to its linked accounts with the app secret. Nothing about
the caller is read from a request body.

| Channel | Belongs to the caller when |
|---|---|
| `onchain` | `buyer_wallet` is one of their linked wallets |
| `shopify` | `lower(buyer_email)` is one of their verified emails (Privy `email` or `google_oauth`) |

## Flow 1 — crypto purchase

1. The app calls `buy(tokenId, qty, USDC)` on the collection (Base, sponsored).
2. After the receipt, the app shows a shipping form and `POST /api/swag/orders`
   `{ txHash, shipping, size?, quantity? }` with the Privy token.
3. The server reads the receipt on Base (`lib/swag/onchain.ts › findPurchased`):
   `status === 'success'`, a `Purchased` log emitted **by the collection**.
4. The log's `buyer` must be one of the caller's linked wallets, else 403.
5. `tokenId` → `swag_variants` on 8453 for this collection → the design.
   Size is required for sized designs and must be one of the product's sizes.
6. Insert `channel='onchain'`, `status='paid'`, `tx_hash`, `order_ref = tx_hash`.
   Idempotent: a second POST for the same hash returns the existing row.

## Flow 2 — card purchase (Shopify)

1. Buyer pays on `qpsxyq-9g.myshopify.com`; Shopify sends `orders/paid` to
   `POST /api/shopify/webhook`.
2. Raw-body HMAC (`X-Shopify-Hmac-Sha256`, `SHOPIFY_WEBHOOK_SECRET`, `timingSafeEqual`)
   and `X-Shopify-Shop-Domain === SHOPIFY_STORE_DOMAIN`, else 401.
3. Per line item: SKU → `swag_shopify_variants` (exact, knows the size) or the
   convention `<designSku>-<SIZE>` → `swag_products` → `swag_variants` on 8453.
   Unknown SKUs are logged and skipped.
4. Insert `channel='shopify'`, `status='paid'`, `buyer_email` (lowercased),
   `shipping` from `shipping_address`, `shopify_order_id` (order GID),
   `shopify_line_item_id`, `order_ref = keccak256("<order gid>:<line item id>")`.
   Idempotent on `(shopify_order_id, shopify_line_item_id)`.
5. No voucher yet — `to` is unknown until the buyer signs in.
6. Always answers 200 (`{ ok: false }` on a database error) so Shopify never
   disables the subscription. Only a bad signature or shop returns 401.

`refunds/create`: matching rows go to `cancelled`. If a voucher was issued and
not claimed, `notes` gets `voucher_needs_cancel=true` — an operator must call
`cancelOrder(orderRef)` from the ops key to burn it on chain. If the token was
already claimed, `notes` gets `refunded_after_claim=true`. Partial refunds only
annotate (`partial_refund=<n>`).

## Flow 3 — claim (`/swag/claim`)

1. Buyer signs in with Privy using the email they paid with.
2. `GET /api/swag/orders` lists their orders; the page shows `claimable` ones
   (`shopify`, not `cancelled`, no `claim_tx_hash`).
3. **Claim** → `POST /api/swag/claim { orderId, to? }`. The server re-checks the
   email match, picks `to` (must be a linked wallet; default the embedded one),
   sets `deadline = now + 7 days`, signs the EIP-712 `Claim` struct
   (`lib/swag/voucher.ts`) and stores `{ voucher, signature, issuedAt }` on the
   row. Re-issuing overwrites with the same `orderRef`, so it can never double-mint.
4. The app sends `claim(voucher, signature)` to the collection on Base,
   sponsored, and waits for the receipt.
5. `POST /api/swag/claim { orderId, txHash }`. The server finds the `Claimed`
   log from the collection, checks `orderRef`, `to` and `tokenId` match the
   stored voucher, and records `claim_tx_hash`.

### The voucher, exactly

- Domain: `{ name: 'ETHCaliSwag', version: '1', chainId: 8453, verifyingContract: <collection> }`
- Primary type **`Claim`** — not `ClaimVoucher`. The Solidity struct is named
  `ClaimVoucher`, but `CLAIM_TYPEHASH` hashes `Claim(uint256 tokenId,address to,uint256 quantity,bytes32 orderRef,uint256 deadline)`.
- `scripts/swag-voucher-selftest.mjs` proves the local digest equals the
  contract's `hashVoucher()` on Base and that the signer recovers. Run it with
  `--env-file=.env` to also confirm the real key holds `SIGNER_ROLE`.

## Status

`paid → shipped → delivered`; `cancelled` from `paid` or `shipped`. The trigger
`swag_orders_guard_status` refuses everything else, including `paid → delivered`
and any move out of `cancelled`.

## Register the webhook in Shopify

Shopify admin → **Settings → Notifications → Webhooks** (or the app's
subscriptions in the Dev Dashboard):

| Field | Value |
|---|---|
| URL | `https://app.ethcali.org/api/shopify/webhook` |
| Format | JSON |
| API version | `2026-07` (same as `SHOPIFY_API_VERSION`) |
| Events | `Order payment` (`orders/paid`) and `Refund create` (`refunds/create`) |

Then copy the signing secret shown at the bottom of that page into
`SHOPIFY_WEBHOOK_SECRET` on Vercel. Webhooks created from the app's own
subscriptions are signed with `SHOPIFY_CLIENT_SECRET` instead — set whichever
applies. Use **Send test notification** and expect `200 { ok: true, topic, … }`
in the Vercel function log.

## Environment (Vercel, production)

| Variable | Notes |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` | already set for the indexer |
| `NEXT_PUBLIC_PRIVY_APP_ID`, `PRIVY_APP_SECRET` | already set for admin routes |
| `SHOPIFY_STORE_DOMAIN` | `qpsxyq-9g.myshopify.com` |
| `SHOPIFY_WEBHOOK_SECRET` | from the Notifications page (see above) |
| `SWAG_VOUCHER_SIGNER_KEY` | **new** — the signer's private key; address must hold `SIGNER_ROLE` |
| `SWAG_COLLECTION_ADDRESS` | optional; defaults to `0xA5C02Ee3029Ce7f0FdD147734D11905E3cA99479` |
| `NEXT_PUBLIC_BASE_RPC_URL` | optional; the server reads receipts through it |

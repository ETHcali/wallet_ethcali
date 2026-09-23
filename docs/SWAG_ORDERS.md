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

1. The app calls `buy(tokenId, qty, USDC)` on the collection (Ethereum mainnet, sponsored).
2. After the receipt, the app shows a shipping form and `POST /api/swag/orders`
   `{ txHash, shipping, size?, quantity? }` with the Privy token.
3. The server reads the receipt on Ethereum (`lib/swag/onchain.ts › findPurchased`):
   `status === 'success'`, a `Purchased` log emitted **by the collection**.
4. The log's `buyer` must be one of the caller's linked wallets, else 403.
5. `tokenId` → `swag_variants` on chain 1 for this collection → the design.
   Size is required for sized designs and must be one of the product's sizes.
6. Insert `channel='onchain'`, `status='paid'`, `tx_hash`, `order_ref = tx_hash`.
   Idempotent: a second POST for the same hash returns the existing row.
7. **Mirrored into Shopify (tag `usdc-onchain`).** `lib/swag/shopifyMirror.ts`
   runs `orderCreate` (Admin API 2026-07) with the `swag_shopify_variants`
   variant for (design, size), `financialStatus: PAID`, one `SALE`/`SUCCESS`
   transaction with gateway **`USDC on Ethereum`**, the shipping address, the buyer's
   Privy-verified email when there is one, a note
   `USDC on Ethereum · tx <hash> · token #<id>`, tags `usdc-onchain`, `swag-2026`,
   and options `inventoryBehaviour: BYPASS` (the unit came from on-chain stock),
   `sendReceipt: false`, `sendFulfillmentReceipt: false`. The COP amounts are the
   USDC `paid` from the Purchased log × the TRM of the day (`fetchTrm()` in
   `lib/shopify.mjs`, the same source as `/api/fx/trm`), computed per unit so
   line × quantity equals the transaction. The order GID lands in
   `swag_orders.shopify_order_id` (allowed on onchain rows since
   `20260923120000_swag_usdc_price_and_fulfilment_mirror.sql`).
   - Idempotent: a row with `shopify_order_id` is skipped; the write is
     conditional on `shopify_order_id IS NULL`, so a raced duplicate is logged,
     never silently overwritten.
   - Best-effort: a Shopify failure still answers **201** with
     `mirror: { ok: false, error }`, and `notes` gets `mirror_failed=true` plus
     `mirror_error=<reason>` (the admin view exposes `mirrorFailed`). The next
     POST for the same hash retries the mirror and clears both lines on success.
   - If Shopify refuses the address (phone format, unknown province) the mirror
     retries once with the minimal address and writes the dropped fields into
     the order note.
   - `scripts/swag-mirror-selftest.mjs --dry-run --variant <gid>` prints the
     exact variables for a fake receipt without creating anything.

## Flow 2 — card purchase (Shopify)

1. Buyer pays on `store.ethcali.org` (Shopify's primary domain; the API host stays
   `qpsxyq-9g.myshopify.com`); Shopify sends `orders/paid` to
   `POST /api/shopify/webhook`.
2. Raw-body HMAC (`X-Shopify-Hmac-Sha256` against `SHOPIFY_WEBHOOK_SECRET` or
   `SHOPIFY_CLIENT_SECRET`, whichever is set, `timingSafeEqual`) and
   `X-Shopify-Shop-Domain === SHOPIFY_STORE_DOMAIN`, else 401.
3. Per line item: SKU → `swag_shopify_variants` (exact, knows the size) or the
   convention `<designSku>-<SIZE>` → `swag_products` → `swag_variants` on chain 1.
   Unknown SKUs are logged and skipped.
4. Insert `channel='shopify'`, `status='paid'`, `buyer_email` (lowercased),
   `shipping` from `shipping_address`, `shopify_order_id` (order GID),
   `shopify_line_item_id`, `order_ref = keccak256("<order gid>:<line item id>")`.
   Idempotent on `(shopify_order_id, shopify_line_item_id)`.
5. No voucher yet — `to` is unknown until the buyer signs in.
6. Always answers 200 (`{ ok: false }` on a database error) so Shopify never
   disables the subscription. Only a bad signature or shop returns 401.
7. An order whose `tags` include `usdc-onchain` or whose gateway is
   `USDC on Ethereum` is **our own mirror** of a USDC purchase (Flow 1, step 7) and
   is skipped: the onchain row already exists and already points at it.

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
4. The app sends `claim(voucher, signature)` to the collection on Ethereum,
   sponsored, and waits for the receipt.
5. `POST /api/swag/claim { orderId, txHash }`. The server finds the `Claimed`
   log from the collection, checks `orderRef`, `to` and `tokenId` match the
   stored voucher, and records `claim_tx_hash`.

### The voucher, exactly

- Domain: `{ name: 'ETHCaliSwag', version: '1', chainId: 1, verifyingContract: <collection> }` — the chain id comes from `frontend/swag-collection.json`, never typed by hand
- Primary type **`Claim`** — not `ClaimVoucher`. The Solidity struct is named
  `ClaimVoucher`, but `CLAIM_TYPEHASH` hashes `Claim(uint256 tokenId,address to,uint256 quantity,bytes32 orderRef,uint256 deadline)`.
- `scripts/swag-voucher-selftest.mjs` proves the local digest equals the
  contract's `hashVoucher()` on Ethereum, that the contract's own `eip712Domain()` agrees, and that the signer recovers. Run it with
  `--env-file=.env` to also confirm the real key holds `SIGNER_ROLE`.

## Fulfilment — shipping happens in Shopify and flows back

Every order, card or USDC, is a Shopify order (the card one natively, the USDC
one as its mirror), so **Shopify is the single fulfilment queue**. The team
fulfils there — Orders → Fulfil item, tracking number and carrier — and the
result comes back through the webhook:

| Topic | Payload | What happens |
|---|---|---|
| `orders/fulfilled` | the order, `fulfillments[]` nested | every `swag_orders` row with that `shopify_order_id` goes `paid → shipped`; `shipping.tracking = { number, url, company }` |
| `fulfillments/update` | one fulfillment with `order_id` | same rows: tracking merged; a `paid` row also moves to `shipped` |
| `fulfillments/create` | one fulfillment with `order_id` | handled identically if ever subscribed (not registered by default — `orders/fulfilled` covers it) |

Rows already `shipped` only pick up new tracking; `delivered` and `cancelled`
rows are never touched; a fulfillment whose status is `cancelled`, `error` or
`failure` is ignored. The status trigger still has the last word.
`GET /api/swag/orders` then carries `tracking` on the row, and the admin view
carries `trackingDetail` beside the flattened `shipping.tracking` string the
order page renders.

The admin page keeps **Mark shipped** / **Mark delivered** for exceptions
(a parcel handed over at an event, a USDC order whose mirror failed), but the
normal path is Shopify.

## Status

`paid → shipped → delivered`; `cancelled` from `paid` or `shipped`. The trigger
`swag_orders_guard_status` refuses everything else, including `paid → delivered`
and any move out of `cancelled`.

## Operations (`/swag/admin`)

The order desk is `app.ethcali.org/swag/admin`. The menu shows it to a wallet
that `isAdmin()` on the collection says yes for; every call behind it is checked
again — `pages/api/swag/admin/*` by `lib/swag/requireSwagAdmin.ts` (Privy token
→ linked wallets → `isAdmin()` on the collection), and every onchain
button by the contract itself. Nothing on the page grants anything.

| Route | What it does |
|---|---|
| `GET /api/swag/admin/orders?status=&channel=&q=&cursor=` | every order, newest first, 50 per page, address and email included; `q` matches SKU, email or wallet |
| `PATCH /api/swag/admin/orders/[id]` `{ status?, tracking?, notes? }` | status through the transition trigger (refusal → 409 with its sentence); `tracking` stored in `shipping.tracking`; `notes` replaced |
| `GET /api/swag/admin/summary` | counts by status and channel, `getVariant` + USDC price per live token, `paused`, `treasury`, and the voucher-cancel queue with `orderClaimed(orderRef)` per row |

**Ship a parcel.** In Shopify: the order (card orders natively; USDC orders are
the ones tagged `usdc-onchain`) → fulfil, with tracking. The `orders/fulfilled`
webhook moves the row to `shipped` and records the tracking. The buttons here —
Orders → the row → *Shipping address* → **Mark shipped** → **Confirm shipped**,
then **Mark delivered** — are for exceptions and for a USDC order flagged
*mirror failed* (create its Shopify order by hand from the note's tx hash, or
ship it from here). The trigger refuses `paid → delivered`, so a row cannot skip
the shipped step either way.

**Cancel an order.** **Cancel order** on a `paid` or `shipped` row closes the
fulfilment record. It does not move money: a card refund is issued in Shopify
(and the `refunds/create` webhook would have cancelled the row itself); a USDC
refund is a transfer from the treasury Safe.

**Cancel a voucher on chain.** A row tagged *Voucher needs cancel* is a refunded
card order whose voucher was issued and never redeemed — the buyer could still
mint. **Cancel voucher on chain** sends `cancelOrder(orderRef)` from your wallet
(ADMIN_ROLE, Ethereum, sponsored); after the receipt the page writes
`voucher_cancelled_tx=<hash>` to notes and the row leaves the queue. The summary
tile counts the queue by the chain's answer (`orderClaimed`), not by the note, so
a voucher cancelled from a Safe or a script still drops off. `VoucherAlreadyClaimed`
means it was already claimed or already cancelled; check `claim_tx_hash`.

**Change stock or price.** Stock → the token → edit *On-chain cap*, *Voucher cap*,
*On sale* → **Save caps** (`setVariant`). The button explains a refusal before you
sign: a cap cannot go below what is already minted, and both caps cannot be zero.
**Set price** calls `setPaymentOption(tokenId, USDC, parseUnits(price, 6))`; the
catalogue's `price_usd` is shown beside it when the two disagree. The USDC price
is what `buy()` charges; the catalogue price is what the daily job turns into
pesos for the card channel — keep them equal.

**Pause.** Collection → **Pause store** / **Unpause store** (ADMIN_ROLE). Paused,
`buy()` and `claim()` revert `EnforcedPause`.

**Roles.** Collection shows which of ADMIN_ROLE, DEFAULT_ADMIN_ROLE and
SIGNER_ROLE the connected wallet holds. Add/remove admin and add/remove signer
are DEFAULT_ADMIN calls: the buttons stay disabled unless the connected wallet
holds DEFAULT_ADMIN_ROLE (`isSuperAdmin()`). The UI copy calls that holder "the
Safe", but on chain (verified 2026-09-23) DEFAULT_ADMIN_ROLE is held by the ops
EOA `0x3B89…415B` — the `itemAdmin` the seed passed to `deployCollection` — and
the Safe holds nothing on the collection except the treasury seat. Moving the
role to the Safe is an open item in the spec's Status block. Rotating the
voucher signer: grant the new address SIGNER_ROLE, swap `SWAG_VOUCHER_SIGNER_KEY`
on Vercel, then revoke the old one. `setTreasury` is deliberately not in the UI.

**Re-price the card channel.** `pages/api/cron/swag-prices.ts` runs daily at
12:00 UTC (`vercel.json`), gated by `Authorization: Bearer $CRON_SECRET`. For
every active design with a Shopify product it computes
`round(price_usd × TRM / 1000) × 1000` and pushes it with one
`productVariantsBulkUpdate` per design, then writes `price_cop` and
`price_synced_at` on `swag_shopify_variants`. By hand:
`node --env-file=.env scripts/shopify-sync.mjs --prices-only` does the same from
the catalogue file; both call `repriceDesign()` in `lib/shopify.mjs`. A variant
whose `price_synced_at` is older than a day was skipped or failed — the cron's
JSON response lists the reason per design in the Vercel function log.

## The webhook subscriptions

They are **app-owned**, created through the Admin API by
`scripts/shopify-webhooks.mjs`, and were registered on 2026-09-23:

| Topic | Format | URL | Since |
|---|---|---|---|
| `ORDERS_PAID` (`orders/paid`) | JSON | `https://app.ethcali.org/api/shopify/webhook` | 2026-09-23 |
| `REFUNDS_CREATE` (`refunds/create`) | JSON | `https://app.ethcali.org/api/shopify/webhook` | 2026-09-23 |
| `ORDERS_FULFILLED` (`orders/fulfilled`) | JSON | `https://app.ethcali.org/api/shopify/webhook` | Phase 2 — **run `create` once after deploy** |
| `FULFILLMENTS_UPDATE` (`fulfillments/update`) | JSON | `https://app.ethcali.org/api/shopify/webhook` | Phase 2 — **run `create` once after deploy**; needs the `read_fulfillments` scope |

```bash
node --env-file=.env scripts/shopify-webhooks.mjs list            # what Shopify has now
node --env-file=.env scripts/shopify-webhooks.mjs create [url]    # register every topic in TOPICS; skips ones already there
node --env-file=.env scripts/shopify-webhooks.mjs delete <gid>
```

`create` is per-topic idempotent, so after the Phase 2 deploy it adds the two
fulfilment topics and reports the first two as already subscribed. A topic
Shopify refuses (a missing scope) is printed and the rest still go through;
the command exits 1 so the gap is not missed. The mirror itself needs
`write_orders` on the app (validate.mjs lists `write_orders, read_orders` for
the `orderCreate` document).

App-owned subscriptions are signed with `SHOPIFY_CLIENT_SECRET`; the route
accepts that or `SHOPIFY_WEBHOOK_SECRET`, so `SHOPIFY_WEBHOOK_SECRET` is only
needed if a subscription is ever created by hand under **Settings →
Notifications → Webhooks** (which signs with the secret shown on that page).
Run `create` only against a live URL: Shopify retries a failing endpoint for
48 hours and then drops the subscription. A test delivery should log
`200 { ok: true, topic, … }` in the Vercel function log.

## Environment (Vercel, production)

| Variable | Notes |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` | already set for the indexer |
| `NEXT_PUBLIC_PRIVY_APP_ID`, `PRIVY_APP_SECRET` | already set for admin routes |
| `SHOPIFY_STORE_DOMAIN` | `qpsxyq-9g.myshopify.com` |
| `SHOPIFY_WEBHOOK_SECRET` | only for hand-made subscriptions (see above); app-owned ones verify with `SHOPIFY_CLIENT_SECRET` |
| `SWAG_VOUCHER_SIGNER_KEY` | the signer's private key; its address (`0x3977…62e6`) holds `SIGNER_ROLE` — `scripts/swag-voucher-selftest.mjs` checks both |
| `SWAG_COLLECTION_ADDRESS` | optional; defaults to `0xA5C02Ee3029Ce7f0FdD147734D11905E3cA99479` |
| `NEXT_PUBLIC_BASE_RPC_URL` | optional; the server reads receipts through it |
| `CRON_SECRET` | bearer token Vercel sends to `/api/cron/swag-prices`; the route refuses everything when unset |
| `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_API_VERSION` (`2026-07`) | the cron, the scripts **and `POST /api/swag/orders` (the mirror)** exchange them for a 24h Admin API token; the client secret also verifies app-owned webhooks |

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

### Shipping on a USDC order

`buy()` charges the item only, and the contract is not changed for this.
Shipping is a separate USDC transfer from the buyer to the collection's
`treasury()` (the Safe), priced by zone and paid in the same checkout:

1. **Address first.** The checkout asks for the address before anything is
   paid. `POST /api/swag/shipping/quote { country, city, wallet }` resolves
   the zone (`lib/swag/shipping.ts › resolveZone`: a zone that lists the city
   wins, otherwise the country's catch-all) and returns a **signed quote**
   `{ zone, amountUnits, wallet, country, exp, sig }`. The signature is an
   HMAC with `SWAG_QUOTE_SECRET`, or a key derived from `PRIVY_APP_SECRET`
   when that is unset. The quote is valid for 30 minutes.
2. The buyer sees **item, shipping and total** as separate lines, in USDC and
   pesos, then approves and buys the item.
3. `POST /api/swag/orders` now requires `shippingQuote`. The server checks
   that it is ours, unexpired, for the buying wallet, and for the zone this
   address resolves to (a Cali quote cannot ship to Bogotá). It then inserts
   the row as **`awaiting_shipping_payment`** with the quote stored. A quote
   that expired during checkout is renewed once, automatically.
4. **Pay shipping**: `transfer(treasury, amountUnits)` on USDC, sponsored.
   Then `POST /api/swag/shipping/pay { orderId, txHash }`. The server
   re-verifies the stored quote's signature and reads the receipt: USDC
   `Transfer` logs from the quote's wallet to `treasury()`, which must add up
   to at least the quoted amount. One transaction pays one order (unique
   `shipping_tx_hash`). Then `awaiting_shipping_payment → paid`, and the order
   joins the batch.
5. If the buyer closes the checkout after buying, the order is still saved,
   and **My orders** shows **Pay shipping** for it. The batch never prints an
   order whose shipping is unpaid.

Zone prices are edited in `/swag/admin` → **Shipping** (ADMIN_ROLE). A change
applies to new quotes; a quote already stored on an order is honoured at its
signed price. `GET /api/swag/shipping/zones` is the public list.

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

## The order desk (`/swag/admin`)

**Needs attention** sits on top of the page and on the admin overview. Each line counts orders
waiting on one reason and opens the list filtered to exactly those orders
(`?tab=orders&attention=<reason>`). One predicate, `attentionOf` in `lib/swag/orders.ts`, both
counts and filters, so a line that says 3 opens 3 orders.

| Reason | Rule |
|---|---|
| `stale` | `paid` or `in_production`, created more than `SWAG_STALE_DAYS` (7) days ago |
| `no_document` | open, Colombian address, no cédula / NIT: Envia cannot print the label |
| `mirror_failed` | not cancelled, notes carry `mirror_failed=true`: create the Shopify order by hand |
| `no_tracking` | `shipped` with no tracking number |
| `shipping_unpaid` | `awaiting_shipping_payment` |
| `voucher_cancel` | admin only; counted only where the chain's `orderClaimed(orderRef)` is still false |

- **Filters live in the URL**: `status`, `channel`, `attention`, `q`. The summary tiles link to them.
- **Search** matches the order number (`#12` or `12`), SKU, buyer email and wallet, recipient
  name and city, and tracking (string or object).
- **Bulk moves**: tick orders in the same stage, then *Start production*, *Mark shipped* (one
  sheet with a tracking field per parcel) or *Mark delivered*. `POST /api/swag/admin/orders/bulk
  { ids, status, tracking? }` (fulfilment or admin, at most 100) runs each order through the same
  update as a single PATCH, so the status trigger rules every row. Refusals come back per id
  and stay on screen. **Cancelling is never bulk**: it is one order at a time, behind a confirmation.
- Only *Cancel voucher on chain* signs a transaction, so the network check sits inside that
  block. The status moves are database writes and never ask anyone to switch network.

## Status

`awaiting_shipping_payment → paid` (USDC orders, until the shipping transfer
is proven), then `paid → in_production → shipped → delivered`, with `paid → shipped` allowed (a
unit already in stock, an event handover); `cancelled` from `paid`,
`in_production` or `shipped`. The trigger `swag_orders_guard_status` refuses
everything else, including `paid → delivered` and any move out of `cancelled`
(`20260928120000_swag_order_desk_and_staff.sql`). The Shopify fulfilment
webhooks move `paid` and `in_production` rows to `shipped`.

## Amounts and timeline (the ledger)

`20260928160000_swag_order_ledger.sql`. Each row carries what it was charged,
copied by the server from the payment of record at the moment it verifies it:

- `item_amount` / `item_currency`: USDC from `Purchased.paid`, or COP from the
  Shopify line (price × quantity).
- `shipping_amount` / `shipping_currency`: USDC from the verified quote, or
  the Shopify order's shipping in COP, recorded **on the order's first line
  only** so a sum over rows counts it once.

`swag_order_events` is written by trigger on every status change. The admin
row shows payment and timeline under **Address, payment and timeline**, and
the summary sums revenue per currency (cancelled orders excluded) plus the
USDC shipping still owed. Nothing here is ever typed by hand or decides
anything.

**Colombian addresses need the recipient's cédula or NIT** (`shipping.document`,
digits only). Envia will not print a Colombian label without it. The USDC
checkout requires it. Shopify's checkout does not collect it, so a card order
arrives without it until the store's checkout asks for it (Envia's own
Shopify guidance: relabel the Company field "Nit/CC").

## The weekly batch

Merch is printed on demand. `lib/swag/batch.ts` fixes the week, in Bogotá time:

| When | What |
|---|---|
| Tuesday 12:00 | cutoff: orders created before it are this week's batch |
| Tuesday–Wednesday | print and pack |
| Thursday | carrier pickup (Coordinadora takes same-day requests before 11:00) |

The worst case, paid Tuesday 12:01, leaves nine days later, inside the store's
"ships in 1–10 days". **This week** in `/swag/admin` shows the dispatch date,
the paid / in production / next-week counts, and:

- **Send N paid orders to production**: `POST /api/swag/admin/batch
  { action: 'start' }`. Every `paid` order before the cutoff goes to
  `in_production` in one statement. The server computes the cutoff; the
  request cannot name one.
- **Print sheet**: units per design × size, for the printer.
- **Print packing slips**: one per order with the address, the item and size,
  and for card orders a QR code to `/swag/claim?email=<checkout email>`.

## The team

Three levels, all AccessControl on the collection:

| Level | Role | Can |
|---|---|---|
| Super admin | `DEFAULT_ADMIN_ROLE` (the ops key `0x3B89…415B`) | add and remove people |
| Admin | `ADMIN_ROLE` | everything below, plus Stock, Collection, Team (read), cancelling orders, the voucher cancel |
| Fulfilment | `FULFILLMENT_ROLE` = `keccak256("FULFILLMENT_ROLE")` | This week and Orders: addresses, start production, shipped, delivered |

`FULFILLMENT_ROLE` gates no function in `Swag1155`. It is a plain AccessControl
role whose admin is `DEFAULT_ADMIN_ROLE` (`getRoleAdmin` reads `0x00` on the
live clone, checked 2026-09-28), so `grantRole` / `hasRole` work without a
redeploy. `lib/swag/requireSwagAdmin.ts` reads all three across every wallet the
caller has linked: `requireSwagStaff` (admin or fulfilment),
`requireSwagAdmin`, `requireSwagSuperAdmin`.

**Adding someone**: Team → email or wallet, name, level → **Add to team**:

1. An email goes to `POST /api/swag/admin/staff/resolve`
   (`lib/swag/privyUsers.ts`). This finds the Privy account or creates it with
   an embedded Ethereum wallet, and returns that wallet. A `0x` or `name.eth`
   is used as is.
2. The connected wallet (it must hold `DEFAULT_ADMIN_ROLE`) sends `addAdmin`
   or `grantRole(FULFILLMENT_ROLE, …)`. This is skipped if the chain already
   shows the role.
3. `POST /api/swag/admin/staff` writes the name into `public.swag_staff`,
   **only after the role reads true on chain**.

Someone added by email then opens `app.ethcali.org/swag/admin`, signs in with
the one-time code, and is recognised through their embedded wallet. They
install nothing. **Remove** is the reverse: the revoke transaction, then
`DELETE /api/swag/admin/staff?address=`, which refuses while a role is still
held. `swag_staff` is a display registry with no client access; it never
decides anything.

## Card buyers and the claim email

On `orders/paid`, when the delivery created rows, `lib/swag/email.ts` sends one
email per Shopify order through Resend. It says the order is printed on demand
and ships in 1–10 days, and links the claim page with the email pre-filled.
The idempotency key is `swag-claim-invite/<order id>`. It is a logged no-op
until `RESEND_API_KEY` and `EMAIL_FROM` are set, and a failure never fails
the webhook.

`/swag/claim?email=…` opens Privy's login with that email typed in
(`login({ prefill })`). One code creates the account and the wallet. The
parameter only fills the form: ownership is still the server matching the email
Privy verified.

## Operations (`/swag/admin`)

The order desk is `app.ethcali.org/swag/admin`. The page opens for anyone
holding ADMIN_ROLE or FULFILLMENT_ROLE through any linked wallet, as read by
`GET /api/swag/admin/summary` (which returns `viewer.role`). Every call behind it
is checked again: `pages/api/swag/admin/*` by `lib/swag/requireSwagAdmin.ts`
(Privy token → linked wallets → the role on the collection), and every onchain
button by the contract itself. Nothing on the page grants anything. Tabs: This
week and Orders for everyone; Stock, Collection and Team for admins.

| Route | What it does |
|---|---|
| `GET /api/swag/admin/orders?status=&channel=&q=&cursor=` | every order, newest first, 50 per page, address and email included; `q` matches SKU, email or wallet |
| `PATCH /api/swag/admin/orders/[id]` `{ status?, tracking?, notes? }` | status through the transition trigger (refusal → 409 with its sentence); `tracking` stored in `shipping.tracking`; `notes` replaced. Fulfilment may set `in_production`, `shipped`, `delivered` and tracking; `cancelled` and `notes` need ADMIN_ROLE |
| `GET` / `POST /api/swag/admin/batch` | this week's window and open orders / send the paid ones to production (staff) |
| `GET` / `POST` / `DELETE /api/swag/admin/staff`, `POST …/staff/resolve` | the team: list (admin), record, forget and resolve an email (DEFAULT_ADMIN) |
| `GET /api/swag/admin/summary` | the caller's `viewer` level, counts by status and channel, `getVariant` + USDC price per live token, `paused`, `treasury`, and the voucher-cancel queue with `orderClaimed(orderRef)` per row |

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
| `SWAG_COLLECTION_ADDRESS` | optional, for a staging collection; defaults to the live clone in `frontend/swag-collection.json` (Ethereum `0x5a10…79E7`) |
| `RESEND_API_KEY` | optional; the claim invite is off without it |
| `EMAIL_FROM` | optional; e.g. `ETH Cali <hola@ethcali.org>`, on a domain verified in Resend. `SWAG_EMAIL_FROM` still works as a fallback. Shared with the certificate email (`lib/email/resend.ts`) |
| `SWAG_APP_URL` | optional; defaults to `https://app.ethcali.org` |
| `SWAG_QUOTE_SECRET` | optional; HMAC key for shipping quotes. Unset = derived from `PRIVY_APP_SECRET`. Rotating it voids unpaid quotes (the checkout re-quotes) |
| `CRON_SECRET` | bearer token Vercel sends to `/api/cron/swag-prices`; the route refuses everything when unset |
| `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_API_VERSION` (`2026-07`) | the cron, the scripts **and `POST /api/swag/orders` (the mirror)** exchange them for a 24h Admin API token; the client secret also verifies app-owned webhooks |

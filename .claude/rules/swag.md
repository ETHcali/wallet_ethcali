---
paths:
  - "components/swag/**"
  - "hooks/swag/**"
  - "lib/swag/**"
  - "lib/shopify.mjs"
  - "pages/swag/**"
  - "pages/api/swag/**"
  - "pages/api/shopify/**"
  - "pages/api/cron/**"
  - "scripts/swag-*"
  - "scripts/shopify-*"
  - "docs/SWAG_ORDERS.md"
---

# Swag store

Runbook: `docs/SWAG_ORDERS.md`. Design record: `../docs/swag-rebuild-spec.md` (workspace root).

## Three layers, each owning one thing

| Layer | Owns |
|---|---|
| Chain — `ETHCALI-SWAG-2026` `0x5a1012486764c217a20B5D1b97508E1de83179E7`, Ethereum | money and ownership: caps, USDC prices, `buy()`, `claim()`, roles |
| Supabase — `swag_products`, `swag_variants`, `swag_shopify_variants`, `swag_orders` | catalogue and fulfilment: copy, `price_usd`, CIDs, size, address, status, vouchers |
| Shopify — `store.ethcali.org` (API host `qpsxyq-9g.myshopify.com`), COP, Stripe | card checkout, per-size inventory, `orders/paid` and `refunds/create` webhooks |

## Contract rules

- The live clone is `SWAG_COLLECTION` (from the generated `frontend/swag-collection.json`); swag
  code names a chain only through `SWAG_COLLECTION.chainId` / `SWAG_CHAIN`. The Base clone
  `0xF602…5442` is paused; its 8453 `swag_variants` rows are ignored by `(chain_id, collection_address)`.
- **One tokenId = one design**; size is a Shopify option, never on chain. Append ids, never renumber.
- **Split caps**: `remainingOnchain(id)` is crypto stock, `remainingVoucher(id)` card/event stock.
  Never show one channel's count for the other.
- **USDC only, 6 decimals.** `canBuy(id, qty, USDC)` returns `(allowed, reason)` — disable with
  the reason. Approve exact `price × qty`, then `buy`. Decode custom errors with the typed ABI
  (`hooks/swag/swagErrors.ts`).
- Card and event orders mint by **claim voucher**: EIP-712 `ETHCaliSwag` v1, chainId 1, checked
  by `scripts/swag-voucher-selftest.mjs`. `cancelOrder(orderRef)` voids one after a refund.
- **Gone from chain**: royalties, discounts, POAP whitelist, `redeem`, `markFulfilled`,
  `buyBatch`. Do not reintroduce hooks for them.

## Admin

`/swag/admin` (`components/swag/Admin*.tsx`, `hooks/swag/useSwagAdmin.ts`); API under
`pages/api/swag/admin/*` behind `lib/swag/requireSwagAdmin.ts`, whose authority is the
collection's roles: `requireSwagStaff` (ADMIN or FULFILLMENT), `requireSwagAdmin`,
`requireSwagSuperAdmin` (DEFAULT_ADMIN). `swag_staff` names people and grants nothing.
Onchain writes go through `useSwagAdminTx`, one instance per button. "Needs attention" counts
and the `?attention=` filter share one predicate (`attentionOf`); bulk moves
(`/api/swag/admin/orders/bulk`) never cancel. Only the voucher cancel shows `ChainGate`. Card prices re-push daily
from `pages/api/cron/swag-prices.ts` (`CRON_SECRET`).

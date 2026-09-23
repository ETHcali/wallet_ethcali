-- Phase 2 of the swag store: one purchase experience.
--
-- 1. price_usdc: the on-chain USDC price, which from today is the list price
--    minus the USDC discount (10 %). The site shows both prices without an RPC
--    call; the chain remains the price of record for buy().
-- 2. USDC orders are mirrored into Shopify so deliveries are managed in one
--    place. An onchain row may therefore carry shopify_order_id (the mirror),
--    but never a line item id or a voucher — those belong to the card channel.

alter table public.swag_products
  add column price_usdc numeric(10,2);

comment on column public.swag_products.price_usdc is
  'On-chain USDC price per unit: price_usd minus the USDC discount. Set by the catalogue sync; the chain (getTokenPrice) is what buy() charges.';

update public.swag_products set price_usdc = round(price_usd * 0.90, 2);

alter table public.swag_products
  add constraint swag_products_price_usdc_positive check (price_usdc is null or price_usdc > 0);

alter table public.swag_orders drop constraint swag_orders_channel_shape;
alter table public.swag_orders add constraint swag_orders_channel_shape check (
  case channel
    when 'onchain' then
      buyer_wallet is not null and tx_hash is not null
      and shopify_line_item_id is null
      and voucher is null and claim_tx_hash is null
    when 'shopify' then
      buyer_email is not null and tx_hash is null
      and shopify_order_id is not null and shopify_line_item_id is not null
    else
      tx_hash is null and shopify_order_id is null and shopify_line_item_id is null
  end
);

comment on column public.swag_orders.shopify_order_id is
  'The Shopify order. For the card channel it is the payment of record; for an onchain row it is the fulfilment mirror created by POST /api/swag/orders (tag usdc-onchain, gateway "USDC on Base"), so deliveries are handled in one queue.';

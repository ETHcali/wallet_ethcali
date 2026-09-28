-- What each order was charged, and when it moved.
--
-- The desk has to answer "how much did this order bring in, and how much went
-- to shipping" without opening a block explorer or Shopify. The payment of
-- record stays where it is — the Purchased log and the shipping Transfer for
-- USDC, the Shopify order for cards — and these columns copy the amounts from
-- there at the moment the server verifies them, so the admin can list and sum
-- them. They are never typed by hand and never decide anything.
--
--   item_amount / item_currency          USDC (from Purchased.paid) or COP (line price × qty)
--   shipping_amount / shipping_currency  USDC (the verified quote) or COP (the Shopify order's
--                                        shipping, on the order's first line only, so a sum
--                                        over rows counts it once)
--
-- swag_order_events is the timeline: one row per status the order entered,
-- written by trigger, so "paid Tuesday, on the press Wednesday, shipped
-- Thursday" is on record rather than overwritten by updated_at.

alter table public.swag_orders
  add column item_amount        numeric(14,2),
  add column item_currency      text,
  add column shipping_amount    numeric(14,2),
  add column shipping_currency  text;

alter table public.swag_orders
  add constraint swag_orders_item_currency_known
    check (item_currency is null or item_currency in ('USDC', 'COP')),
  add constraint swag_orders_shipping_currency_known
    check (shipping_currency is null or shipping_currency in ('USDC', 'COP')),
  add constraint swag_orders_amounts_nonnegative
    check ((item_amount is null or item_amount >= 0) and (shipping_amount is null or shipping_amount >= 0)),
  add constraint swag_orders_item_amount_has_currency
    check ((item_amount is null) = (item_currency is null)),
  add constraint swag_orders_shipping_amount_has_currency
    check ((shipping_amount is null) = (shipping_currency is null));

comment on column public.swag_orders.item_amount is
  'What the buyer paid for the item, copied by the server from the payment of record: Purchased.paid (USDC) or the Shopify line price × quantity (COP). Display and totals only.';
comment on column public.swag_orders.shipping_amount is
  'What the buyer paid for shipping: the verified USDC quote, or the Shopify order''s shipping in COP on the order''s first line only (so a sum over rows counts it once). Display and totals only.';

create table public.swag_order_events (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references public.swag_orders (id) on delete cascade,
  from_status text,
  to_status   text not null,
  at          timestamptz not null default now()
);

comment on table public.swag_order_events is
  'The status timeline of each swag order, one row per status entered, written by trigger on swag_orders. Service role only.';

create index swag_order_events_order_idx on public.swag_order_events (order_id, at);

create or replace function public.swag_orders_log_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.swag_order_events (order_id, from_status, to_status) values (new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.swag_order_events (order_id, from_status, to_status) values (new.id, old.status, new.status);
  end if;
  return null;
end;
$$;

create trigger swag_orders_log_status
  after insert or update of status on public.swag_orders
  for each row execute function public.swag_orders_log_status();

alter table public.swag_order_events enable row level security;
alter table public.swag_order_events force row level security;
revoke all on public.swag_order_events from anon, authenticated;

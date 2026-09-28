-- Shipping as its own line, paid in USDC like the item.
--
-- 1. swag_shipping_zones: what a parcel costs to where. Flat rate per zone
--    (Cali metro, main cities, the rest of Colombia, international regions),
--    in USD, edited from /swag/admin → Shipping. The quote route resolves an
--    address to a zone and signs the price; nothing here is a payment.
--
-- 2. swag_orders gains the shipping half of a USDC order. buy() on the
--    collection charges the item only and cannot be changed, so shipping is a
--    second transfer — USDC from the buyer to the collection's treasury —
--    proven by its own receipt:
--
--      shipping_quote     the signed quote the buyer accepted (zone, amount, expiry)
--      shipping_tx_hash   the Transfer that paid it, read from the chain
--
--    A USDC order is saved the moment the item is bought, so a buyer who paid
--    for a shirt is never lost. Until the shipping transfer is confirmed it
--    waits in awaiting_shipping_payment, which the batch does not print:
--
--      awaiting_shipping_payment → paid | cancelled

-- ── 1. Zones ────────────────────────────────────────────────────────────────

create table public.swag_shipping_zones (
  code          text primary key,
  label_es      text not null,
  label_en      text not null,
  -- ISO-2 countries this zone covers. For Colombia the city list decides
  -- between the Colombian zones; see resolveZone() in lib/swag/shipping.ts.
  countries     text[] not null,
  -- Normalised city names (lowercase, no accents). Empty = the zone's catch-all.
  cities        text[] not null default '{}',
  price_usd     numeric(10,2) not null,
  -- Business days from dispatch (Thursday) to the door.
  eta_min_days  integer not null,
  eta_max_days  integer not null,
  active        boolean not null default true,
  sort          integer not null default 0,
  updated_at    timestamptz not null default now(),

  constraint swag_shipping_zones_code_shape check (code ~ '^[a-z0-9_]{2,32}$'),
  constraint swag_shipping_zones_price_positive check (price_usd > 0),
  constraint swag_shipping_zones_eta_order check (eta_min_days >= 0 and eta_max_days >= eta_min_days),
  constraint swag_shipping_zones_countries_nonempty check (cardinality(countries) > 0)
);

comment on table public.swag_shipping_zones is
  'Flat shipping rate per zone, in USD. Read by POST /api/swag/shipping/quote through the service role, edited from /swag/admin → Shipping (ADMIN_ROLE). Prices are what the buyer is quoted, not what a carrier charges.';

create trigger swag_shipping_zones_touch_updated_at
  before update on public.swag_shipping_zones
  for each row execute function public.touch_updated_at();

alter table public.swag_shipping_zones enable row level security;
alter table public.swag_shipping_zones force row level security;
revoke all on public.swag_shipping_zones from anon, authenticated;

-- Starting prices are PLACEHOLDERS from third-party carrier quotes
-- (≈ COP 5–11k per 0.5 kg nationally); replace them with real Envia quotes
-- from the admin before relying on them. International starts inactive until
-- a DHL account exists.
insert into public.swag_shipping_zones (code, label_es, label_en, countries, cities, price_usd, eta_min_days, eta_max_days, active, sort) values
  ('cali',        'Cali y área metropolitana', 'Cali metro area',        '{CO}', '{cali,santiago de cali,jamundi,yumbo,palmira,candelaria}', 2.50, 1, 2, true, 10),
  ('co_main',     'Ciudades principales',      'Main Colombian cities',  '{CO}', '{bogota,medellin,barranquilla,cartagena,bucaramanga,pereira,manizales,armenia,ibague,santa marta,cucuta,villavicencio,pasto,neiva,popayan,monteria,valledupar,envigado,itagui,bello,sabaneta,soacha,chia,floridablanca,dosquebradas,tulua,buga,cartago}', 4.00, 1, 3, true, 20),
  ('co_rest',     'Resto de Colombia',         'Rest of Colombia',       '{CO}', '{}', 6.00, 3, 8, true, 30),
  ('intl_americas','Américas (DHL)',           'Americas (DHL)',         '{US,CA,MX,BR,AR,CL,PE,EC,PA,CR,UY,PY,BO,VE,GT,DO}', '{}', 35.00, 3, 6, false, 40),
  ('intl_europe', 'Europa (DHL)',              'Europe (DHL)',           '{ES,PT,FR,DE,IT,NL,BE,AT,CH,IE,GB,DK,SE,NO,FI,PL,CZ}', '{}', 45.00, 3, 7, false, 50),
  ('intl_rest',   'Resto del mundo (DHL)',     'Rest of world (DHL)',    '{AE,AU,HK,IL,JP,KR,MY,NZ,SG}', '{}', 55.00, 4, 9, false, 60);

-- ── 2. Orders ───────────────────────────────────────────────────────────────

alter table public.swag_orders
  add column shipping_quote   jsonb,
  add column shipping_tx_hash text;

alter table public.swag_orders
  add constraint swag_orders_shipping_tx_hash_shape
    check (shipping_tx_hash is null or shipping_tx_hash ~ '^0x[0-9a-f]{64}$'),
  add constraint swag_orders_shipping_tx_hash_unique unique (shipping_tx_hash),
  -- Only the USDC channel pays shipping on chain; a card order's shipping is
  -- part of its Shopify payment.
  add constraint swag_orders_shipping_onchain_only
    check (channel = 'onchain' or (shipping_quote is null and shipping_tx_hash is null)),
  -- The item's own buy() receipt moves USDC to the treasury too; it can never
  -- double as the shipping payment. The API refuses any purchase receipt;
  -- this is the last line for the same row.
  add constraint swag_orders_shipping_tx_not_item_tx
    check (shipping_tx_hash is null or tx_hash is null or shipping_tx_hash <> tx_hash),
  -- Paid shipping implies the quote it paid.
  add constraint swag_orders_shipping_tx_needs_quote
    check (shipping_tx_hash is null or shipping_quote is not null);

comment on column public.swag_orders.shipping_quote is
  'USDC orders: the signed quote the buyer accepted — { zone, amountUnits (USDC, 6 decimals), wallet, exp, sig }. Re-verified by the server before a shipping payment is accepted.';
comment on column public.swag_orders.shipping_tx_hash is
  'USDC orders: the transaction whose USDC Transfer from the buyer to the collection treasury paid shipping. Read from the receipt by the server, never trusted from the client.';

alter table public.swag_orders drop constraint swag_orders_status_known;
alter table public.swag_orders add constraint swag_orders_status_known
  check (status in ('awaiting_shipping_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled'));

create or replace function public.swag_orders_guard_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if (old.status = 'awaiting_shipping_payment' and new.status in ('paid', 'cancelled'))
  or (old.status = 'paid'          and new.status in ('in_production', 'shipped', 'cancelled'))
  or (old.status = 'in_production' and new.status in ('shipped', 'cancelled'))
  or (old.status = 'shipped'       and new.status in ('delivered', 'cancelled'))
  then
    return new;
  end if;

  raise exception 'swag_orders %: % → % is not an allowed transition', old.id, old.status, new.status
    using errcode = 'check_violation';
end;
$$;
comment on function public.swag_orders_guard_status() is
  'Enforces awaiting_shipping_payment → paid → in_production → shipped → delivered (paid → shipped allowed), with cancelled reachable from any open state. delivered and cancelled are terminal.';

comment on column public.swag_orders.status is
  'awaiting_shipping_payment (USDC item paid, shipping not yet) → paid → in_production → shipped → delivered (paid → shipped allowed), or cancelled from any open state. swag_orders_guard_status refuses every other move.';

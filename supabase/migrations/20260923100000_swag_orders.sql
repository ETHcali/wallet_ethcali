-- Swag orders: the fulfilment record behind every piece of merch that leaves.
--
-- Two channels sell the same designs. A crypto buyer calls buy() on the Base
-- collection and the chain has the receipt; a card buyer pays Shopify in pesos
-- and Shopify has the order. Neither of those knows a shirt size or a street
-- address, and neither one knows about the other. This table does: one row per
-- unit-line sold, whichever door it came through, carrying what the warehouse
-- needs and, for the fiat channel, the key that lets the buyer mint later.
--
-- The chain rule, stated for this table. Nothing here is authoritative for
-- money or for ownership:
--
--   onchain  the Purchased log on Base is the receipt. tx_hash points at it and
--            the API route re-reads the receipt before it writes the row.
--   shopify  Shopify's order is the payment of record. shopify_order_id and
--            shopify_line_item_id point at it. The NFT is minted only when the
--            buyer redeems a voucher; until claim_tx_hash is set they hold a
--            promise, not a token, and the contract's orderClaimed[order_ref]
--            is what decides whether that promise has been kept.
--
-- What this table IS authoritative for: the size, the shipping address, the
-- fulfilment status, and which voucher (if any) was issued. Those exist nowhere
-- else.
--
-- No client can read or write it. There are no RLS policies at all: the only
-- reader is pages/api/swag/* through the service role after a Privy token has
-- been verified, and the only writers are that route and the Shopify webhook.
-- A row carries a named person's address and email; "who may see this" is a
-- question the API answers per request, not one a policy can answer statically.

create table public.swag_orders (
  id                    bigint generated always as identity primary key,

  -- Which door the order came through.
  --   onchain  buy() on the collection, paid in USDC
  --   shopify  card, in COP, through the store
  --   event    free swag handed out at an event as a signed voucher
  channel               text not null,

  -- The design, and its deployment on Base. variant_id is the swag_variants
  -- row on chain 8453: it is what turns a Shopify SKU into a tokenId at claim
  -- time, so it is resolved when the row is written, not when it is needed.
  product_id            bigint not null references public.swag_products (id),
  variant_id            bigint not null references public.swag_variants (id),
  quantity              integer not null,
  size                  text,

  -- Who. Wallet for the crypto channel (the Purchased log's buyer, lowercase);
  -- email for the fiat channel (what Shopify collected at checkout). The claim
  -- page matches buyer_email against the emails Privy has verified for the
  -- signed-in user, so this is stored as received and compared lowercased.
  buyer_wallet          text,
  buyer_email           text,

  -- Where to send it. Free-form on purpose: name, phone, address1, address2,
  -- city, region, country, notes. Validated at the API, not here — an address
  -- format constraint that is right for Cali is wrong for Buenos Aires.
  shipping              jsonb not null default '{}'::jsonb,

  -- paid → shipped → delivered, or cancelled from paid or shipped. The trigger
  -- below enforces the order; the check only enforces the vocabulary.
  status                text not null default 'paid',

  -- The receipt, per channel.
  tx_hash               text,
  shopify_order_id      text,
  shopify_line_item_id  text,

  -- The claim key. bytes32 as lowercase hex. For a Shopify line item it is
  -- keccak256(order gid || ':' || line item id); for an event handout it is
  -- keccak256('event:<slug>:<attendee>'). Unique here and burned on chain by
  -- claim() or cancelOrder(), so the same order can never mint twice however
  -- many times a webhook is replayed or a voucher re-issued.
  order_ref             text not null,

  -- The signed voucher once issued: { voucher: {...}, signature, issuedAt }.
  -- Null until the buyer signs in and asks for it. Re-issuing overwrites this
  -- (same order_ref, new deadline); the contract, not this column, is what
  -- prevents a double mint.
  voucher               jsonb,
  claim_tx_hash         text,

  -- Operator notes. The refund webhook writes voucher_needs_cancel=true here
  -- when a voucher was issued and not yet claimed, because the on-chain
  -- cancelOrder() needs the ops key and is a human's call.
  notes                 text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint swag_orders_channel_known
    check (channel in ('onchain', 'shopify', 'event')),
  constraint swag_orders_status_known
    check (status in ('paid', 'shipped', 'delivered', 'cancelled')),
  constraint swag_orders_quantity_positive
    check (quantity > 0),
  constraint swag_orders_size_known
    check (size is null or size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  constraint swag_orders_wallet_lowercase_hex
    check (buyer_wallet is null or buyer_wallet ~ '^0x[0-9a-f]{40}$'),
  constraint swag_orders_email_shape
    check (buyer_email is null or buyer_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint swag_orders_tx_hash_shape
    check (tx_hash is null or tx_hash ~ '^0x[0-9a-f]{64}$'),
  constraint swag_orders_claim_tx_hash_shape
    check (claim_tx_hash is null or claim_tx_hash ~ '^0x[0-9a-f]{64}$'),
  constraint swag_orders_order_ref_shape
    check (order_ref ~ '^0x[0-9a-f]{64}$'),
  constraint swag_orders_order_ref_unique unique (order_ref),
  constraint swag_orders_tx_hash_unique unique (tx_hash),
  constraint swag_orders_claim_tx_hash_unique unique (claim_tx_hash),

  -- Each channel names its receipt and its buyer, and only its own.
  constraint swag_orders_channel_shape check (
    case channel
      when 'onchain' then
        buyer_wallet is not null and tx_hash is not null
        and shopify_order_id is null and shopify_line_item_id is null
        and voucher is null and claim_tx_hash is null
      when 'shopify' then
        buyer_email is not null and tx_hash is null
        and shopify_order_id is not null and shopify_line_item_id is not null
      else
        tx_hash is null and shopify_order_id is null and shopify_line_item_id is null
    end
  ),
  -- A claim transaction implies a voucher was issued.
  constraint swag_orders_claim_needs_voucher
    check (claim_tx_hash is null or voucher is not null)
);

comment on table public.swag_orders is
  'One row per merch line sold through any channel. Authoritative for size, shipping and fulfilment status only: the Purchased log (onchain) or the Shopify order (shopify) is the payment of record, and the collection''s orderClaimed[order_ref] decides whether a voucher was spent. No client access; read and written by pages/api/swag/* and the Shopify webhook through the service role.';
comment on column public.swag_orders.channel is
  'onchain (buy() in USDC), shopify (card in COP) or event (free voucher). Decides which receipt columns must be set; see swag_orders_channel_shape.';
comment on column public.swag_orders.variant_id is
  'The design''s swag_variants row on Base (8453). Resolved at write time so the claim knows its tokenId without a second lookup.';
comment on column public.swag_orders.buyer_wallet is
  'Lowercase address from the Purchased log. Never taken from the request body.';
comment on column public.swag_orders.buyer_email is
  'Email Shopify collected at checkout. Matched, lowercased, against the signed-in user''s Privy-verified emails at claim time.';
comment on column public.swag_orders.shipping is
  'name, phone, address1, address2, city, region, country (ISO-2), notes. Validated by the API.';
comment on column public.swag_orders.status is
  'paid → shipped → delivered, or cancelled from paid/shipped. swag_orders_guard_status refuses every other move.';
comment on column public.swag_orders.order_ref is
  'bytes32 claim key as lowercase hex. keccak256(shopify order gid || '':'' || line item id) for the fiat channel. Unique here and burned on chain, so a replayed webhook or a re-issued voucher cannot mint twice.';
comment on column public.swag_orders.voucher is
  '{ voucher: { tokenId, to, quantity, orderRef, deadline }, signature, issuedAt } once issued. Overwritten on re-issue while unclaimed.';
comment on column public.swag_orders.claim_tx_hash is
  'The Base transaction whose Claimed log matched order_ref. Set by the API after reading the receipt, never by the client.';
comment on column public.swag_orders.notes is
  'Operator notes. The refund webhook appends voucher_needs_cancel=true when an issued voucher must be cancelled on chain by hand.';

-- One row per Shopify line item, however many times the webhook is delivered.
-- A partial index rather than a nulls-not-distinct constraint: every onchain
-- and event row has both columns null, and nulls-not-distinct would let only
-- one of those exist.
create unique index swag_orders_shopify_line_unique
  on public.swag_orders (shopify_order_id, shopify_line_item_id)
  where shopify_order_id is not null;

-- The API's three lookups: my crypto orders, my card orders, the ops queue.
create index swag_orders_buyer_wallet_idx on public.swag_orders (buyer_wallet);
create index swag_orders_buyer_email_idx  on public.swag_orders (lower(buyer_email));
create index swag_orders_status_idx       on public.swag_orders (status);

create trigger swag_orders_touch_updated_at
  before update on public.swag_orders
  for each row execute function public.touch_updated_at();

-- Status is a path, not a set. A check constraint sees one row and cannot know
-- where it came from, so the transition rule is a trigger:
--
--   paid      → shipped | cancelled
--   shipped   → delivered | cancelled
--   delivered → (nothing)
--   cancelled → (nothing)
--
-- paid → delivered is refused because "delivered" with no shipment on record
-- is how a lost parcel becomes an argument. Nothing leaves cancelled because a
-- refund has already happened by then, and un-cancelling would need a new
-- payment, which is a new order.

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

  if (old.status = 'paid'    and new.status in ('shipped', 'cancelled'))
  or (old.status = 'shipped' and new.status in ('delivered', 'cancelled'))
  then
    return new;
  end if;

  raise exception 'swag_orders %: % → % is not an allowed transition', old.id, old.status, new.status
    using errcode = 'check_violation';
end;
$$;
comment on function public.swag_orders_guard_status() is
  'Enforces paid → shipped → delivered, with cancelled reachable from paid or shipped only. delivered and cancelled are terminal.';

create trigger swag_orders_guard_status
  before update of status on public.swag_orders
  for each row execute function public.swag_orders_guard_status();

-- ── RLS ─────────────────────────────────────────────────────────────────────
--
-- Enabled and forced, and then deliberately given no policy. There is no
-- static rule that says who may read an order: it is "the person whose wallet
-- bought it or whose verified email paid for it", and that person is only
-- known after a Privy token has been checked server-side. So the service role
-- is the only role that can touch the table, and pages/api/swag/* is the only
-- code that holds it.

alter table public.swag_orders enable row level security;
alter table public.swag_orders force row level security;

revoke all on public.swag_orders from anon, authenticated;

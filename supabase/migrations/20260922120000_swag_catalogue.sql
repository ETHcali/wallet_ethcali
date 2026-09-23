-- Swag catalogue: the design is the unit, and it lives here.
--
-- Until now swag-catalogue.json in scs-ethcali was the catalogue and
-- swag_variants was only the artwork pipeline beside it. Three readers now need
-- the same list — ethcali.org at build time (anon key), the wallet app (reads,
-- plus admin edits through server routes) and the contract seeder — and a JSON
-- file checked into a third repo cannot be the source of truth for all of them.
-- From this migration on, the catalogue is:
--
--   swag_products          one row per DESIGN. Name, copy, price, artwork CIDs.
--   swag_variants          one row per (design, chain): where that design is on
--                          chain, and how far its artwork pipeline has got.
--   swag_shopify_variants  one row per Shopify variant: the fiat channel's
--                          handle on a design, sized or not.
--
-- The chain rule still holds. Nothing here is authoritative for a price paid or
-- an item minted: Swag1155 holds the on-chain price, the supply and the receipts,
-- and Shopify holds the fiat order. These tables are the catalogue and the map
-- between the two channels, and the map is what a webhook needs:
--
--   Shopify line item SKU  ETHCALI-TEE-DOGE-MERKLE-2026-M
--     strip the size        ETHCALI-TEE-DOGE-MERKLE-2026     -> swag_products.sku
--     pick the chain        (product_id, 8453)               -> swag_variants
--     mint                  (collection_address, token_id)
--
-- Size is a Shopify concern only. One design is one tokenId on every chain; the
-- NFT says which design you bought, the fulfilment record says which size.

-- ── swag_products ───────────────────────────────────────────────────────────

create table public.swag_products (
  id             bigint generated always as identity primary key,

  -- The design SKU from the catalogue (ETHCALI-<CAT>-<DESIGN>-<YEAR>). Also the
  -- Shopify SKU for an unsized design; a sized design's Shopify SKUs append
  -- -<SIZE>. Never a size in here.
  sku            text not null unique,
  category       text not null,

  -- Bilingual copy. Spanish is the site's default locale; English is required
  -- too because it is what goes into the NFT metadata.
  name_es        text not null,
  name_en        text not null,
  description_es text not null,
  description_en text not null,

  -- Site path under public/, e.g. 'swags/cap-pepe.png'. The website renders
  -- this; the NFT never does.
  image_path     text,

  -- The immutable assets, once pinned. Bare CIDs, no gateway prefix — gateways
  -- change and a stored gateway URL rots. These live on the design, not the
  -- per-chain row: the same metadata is set on every chain's collection, and a
  -- per-chain copy is a per-chain chance to drift.
  image_cid      text,
  metadata_cid   text,

  -- USD is the list price. COP is derived live from the TRM
  -- (pages/api/fx/trm.ts) and cached per Shopify variant, never stored here.
  price_usd      numeric(10,2) not null,

  sized          boolean not null default false,
  sizes          text[]  not null default '{}',

  -- Set by the Shopify sync once the product exists there. Text, not bigint:
  -- Shopify ids are GIDs and we never do arithmetic on them.
  shopify_product_id text,
  shopify_handle     text,

  sort_order     integer not null,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint swag_products_sku_shape     check (sku ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'),
  constraint swag_products_category_known check (category in ('Cap', 'Mug', 'Hoodie', 'T-shirt')),
  constraint swag_products_price_positive check (price_usd > 0),
  -- A sized design lists its sizes; an unsized one lists none. Half of either
  -- produces a Shopify product with a phantom variant.
  constraint swag_products_sizes_match_sized
    check (sized = (cardinality(sizes) > 0)),
  constraint swag_products_cid_shape
    check ((image_cid    is null or image_cid    ~ '^[a-zA-Z0-9]+$')
       and (metadata_cid is null or metadata_cid ~ '^[a-zA-Z0-9]+$')),
  constraint swag_products_shopify_product_id_unique unique (shopify_product_id)
);

comment on table public.swag_products is
  'The swag catalogue: one row per design. Source of truth for name, copy, price and artwork CIDs across the website, the wallet app and the contract seeder. Never authoritative for on-chain price or supply — Swag1155 is.';
comment on column public.swag_products.sku is
  'Design SKU. A Shopify line-item SKU maps back to it by stripping a trailing -<SIZE>.';
comment on column public.swag_products.image_path is
  'Path under the website''s public/ directory. For the site only; the NFT points at image_cid.';
comment on column public.swag_products.image_cid is
  'Bare IPFS CID of the product image. No gateway prefix; gateways rot. Per design: the same asset is used on every chain.';
comment on column public.swag_products.metadata_cid is
  'Bare IPFS CID of the ERC-1155 metadata JSON. The on-chain URI is ipfs://<this>. Per design, same reason as image_cid.';
comment on column public.swag_products.price_usd is
  'List price in USD. COP is derived from the TRM at request time and cached on swag_shopify_variants.price_cop.';
comment on column public.swag_products.sizes is
  'Shopify variant sizes, e.g. {S,M,L,XL}. Empty for unsized designs. Not on chain.';
comment on column public.swag_products.sort_order is
  'Display order on the site and in the admin. Seeded from the catalogue''s array position.';

create index swag_products_listing_idx on public.swag_products (active, sort_order);

create trigger swag_products_touch_updated_at
  before update on public.swag_products
  for each row execute function public.touch_updated_at();

-- ── swag_variants: from catalogue-with-pipeline to per-chain record ─────────
--
-- Written as ALTERs on purpose, so the diff reads as what changed rather than
-- as a new table. The table is empty in production; the truncate is a no-op
-- there and makes the NOT NULL adds below safe on a dev database that has
-- seeded rows.

truncate public.swag_variants;

alter table public.swag_variants
  add column product_id bigint not null references public.swag_products (id);

-- A variant is now a design on a chain, so the chain is part of its identity.
alter table public.swag_variants
  alter column chain_id set not null;

-- Identity moved to the product.
alter table public.swag_variants drop constraint swag_variants_unique;
drop index if exists public.swag_variants_sku_idx;
alter table public.swag_variants drop column sku;
alter table public.swag_variants drop column label;

-- The CIDs moved to the product. Kept here they would have to agree across
-- five chains by convention, and conventions drift; one row per design cannot.
alter table public.swag_variants drop constraint swag_variants_live_needs_metadata;
alter table public.swag_variants drop column image_cid;
alter table public.swag_variants drop column metadata_cid;

alter table public.swag_variants
  add constraint swag_variants_product_chain_unique unique (product_id, chain_id);

-- nulls not distinct: before the collection is deployed collection_address is
-- null on every row of a chain, and two undeployed designs must still not
-- claim the same token_id. Once deployed the address is set and the
-- constraint says the ordinary thing: one token id per collection.
alter table public.swag_variants
  add constraint swag_variants_token_unique
  unique nulls not distinct (chain_id, collection_address, token_id);

comment on table public.swag_variants is
  'One row per (design, chain): the deployment record of a swag_products row on a Swag1155 collection, plus the artwork pipeline state for it. Holds references and state, never image bytes. Drive columns are working links for the admin UI.';
comment on column public.swag_variants.product_id is
  'The design. Name, copy, price and CIDs live there.';
comment on column public.swag_variants.token_id is
  'ERC-1155 token id of this design in this chain''s collection. Same on every chain by convention; the constraint only guarantees it per collection.';
comment on column public.swag_variants.collection_address is
  'Lowercase hex address of the Swag1155 clone on chain_id. Null until deployed; required for status live.';

-- The per-table touch function is superseded by the shared one from the site
-- content migration. Same behaviour, one fewer function to keep.
drop trigger swag_variants_touch_updated_at on public.swag_variants;
drop function public.touch_swag_variants_updated_at();
create trigger swag_variants_touch_updated_at
  before update on public.swag_variants
  for each row execute function public.touch_updated_at();

-- The guard that matters, now across two tables. A CHECK constraint cannot
-- read another row, let alone another table, so the rule "nothing reaches
-- pinned or live without a real metadata CID" becomes a pair of triggers:
--
--   1. a variant may not be promoted past artwork_ready while its product has
--      no metadata_cid;
--   2. a product's metadata_cid may not be cleared while any variant of it is
--      pinned or live.
--
-- Either one alone leaves a door open. Without (2), clearing the CID on the
-- product silently strands a 'pinned' row with nothing pinned — which is
-- exactly how a drop ships 17 NFTs that all render broken.

create or replace function public.swag_variants_guard_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cid text;
begin
  if new.status in ('pinned', 'live') then
    select metadata_cid into cid from public.swag_products where id = new.product_id;
    if cid is null then
      raise exception 'swag_variants % cannot be % — its product has no metadata_cid', new.id, new.status
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;
comment on function public.swag_variants_guard_status() is
  'Half of the cross-table guard: a variant is pinned/live only if its product has a metadata_cid. See swag_products_guard_metadata_cid for the other half.';

create trigger swag_variants_guard_status
  before insert or update of status, product_id on public.swag_variants
  for each row execute function public.swag_variants_guard_status();

create or replace function public.swag_products_guard_metadata_cid()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.metadata_cid is null and old.metadata_cid is not null
     and exists (
       select 1 from public.swag_variants
       where product_id = new.id and status in ('pinned', 'live')
     )
  then
    raise exception 'swag_products % has pinned or live variants — metadata_cid cannot be cleared', new.id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
comment on function public.swag_products_guard_metadata_cid() is
  'Other half of the cross-table guard: metadata_cid stays while a variant depends on it. Replacing it with a new CID is allowed — that is a re-pin, not a removal.';

create trigger swag_products_guard_metadata_cid
  before update of metadata_cid on public.swag_products
  for each row execute function public.swag_products_guard_metadata_cid();

-- The FK lookup and the webhook's mint lookup. The unique constraints above
-- already index (product_id, chain_id) and (chain_id, collection_address,
-- token_id); this one serves the join from the product side alone.
create index swag_variants_product_id_idx on public.swag_variants (product_id);

-- ── swag_shopify_variants ───────────────────────────────────────────────────

create table public.swag_shopify_variants (
  id                        bigint generated always as identity primary key,
  product_id                bigint not null references public.swag_products (id),

  -- Shopify's ids, as GIDs. Text for the same reason as on swag_products.
  shopify_variant_id        text not null unique,
  shopify_inventory_item_id text,

  -- What the webhook actually receives. <designSku> for an unsized design,
  -- <designSku>-<SIZE> for a sized one.
  sku                       text not null unique,
  size                      text,

  -- What the daily price push last wrote to Shopify, and when. COP has no
  -- cents in practice; numeric(12,0) holds up to 999,999,999,999 pesos.
  price_cop                 numeric(12,0),
  price_synced_at           timestamptz,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint swag_shopify_variants_sku_shape  check (sku ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'),
  constraint swag_shopify_variants_size_known check (size is null or size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  constraint swag_shopify_variants_price_positive check (price_cop is null or price_cop > 0),
  -- One row per size per design, and exactly one row for an unsized design.
  constraint swag_shopify_variants_product_size_unique unique nulls not distinct (product_id, size)
);

comment on table public.swag_shopify_variants is
  'One row per Shopify variant of a swag design. The fiat channel''s handle on a product: what the order webhook matches a line item against, and where the daily TRM price push records what it wrote.';
comment on column public.swag_shopify_variants.sku is
  'The Shopify variant SKU. Equal to swag_products.sku for an unsized design; swag_products.sku || ''-'' || size otherwise.';
comment on column public.swag_shopify_variants.price_cop is
  'Last COP price pushed to Shopify, derived from swag_products.price_usd and the TRM of the day. A cache of what Shopify was told, never the price of record — Shopify''s order is.';
comment on column public.swag_shopify_variants.price_synced_at is
  'When price_cop was last pushed. The price job uses it to spot a variant the push skipped.';

create index swag_shopify_variants_product_id_idx on public.swag_shopify_variants (product_id);

create trigger swag_shopify_variants_touch_updated_at
  before update on public.swag_shopify_variants
  for each row execute function public.touch_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
--
-- Writes come exclusively from pages/api/swag/* behind requireAdmin()
-- (lib/adminAuth.ts), which checks ADMIN_ROLE on chain, and from the seed and
-- sync scripts with the service role. anon and authenticated get SELECT on the
-- public shape and nothing else — a public writer could reprice the shop.

alter table public.swag_products         enable row level security;
alter table public.swag_shopify_variants enable row level security;
alter table public.swag_products         force row level security;
alter table public.swag_shopify_variants force row level security;
-- swag_variants was enabled and forced in 20260820120000 and keeps its policy:
-- "live swag variants are public".

create policy "active swag products are public" on public.swag_products
  for select to anon, authenticated using (active);

-- The storefront needs the variant id to build a cart link, and Shopify shows
-- the same ids to anyone on the store, so these follow their product.
create policy "shopify variants of active products are public" on public.swag_shopify_variants
  for select to anon, authenticated
  using (exists (select 1 from public.swag_products p where p.id = product_id and p.active));

revoke all on public.swag_products, public.swag_shopify_variants from anon, authenticated;
grant select on public.swag_products, public.swag_shopify_variants to anon, authenticated;

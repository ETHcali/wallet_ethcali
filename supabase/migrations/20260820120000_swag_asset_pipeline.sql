-- Swag artwork pipeline.
--
-- Three homes for three different things, and the split is deliberate:
--
--   Drive     where designers work. We keep a reference, never a dependency.
--   this table the pipeline state — what stage each variant's artwork is at.
--   IPFS      the immutable asset the NFT actually points to.
--
-- A Google Drive share link must never reach NFT metadata. It returns an HTML
-- sign-in interstitial rather than image bytes, so wallets and marketplaces
-- render nothing, and the file can be moved or unshared at any time — which
-- would break the NFT permanently. Drive columns here are for the admin UI to
-- link out to while artwork is still being worked on.

create table public.swag_variants (
  id            bigint generated always as identity primary key,

  -- Catalogue identity. Matches swag-catalogue.json, which is the seed input.
  sku           text    not null,
  token_id      integer not null check (token_id >= 1),
  label         text    not null,

  -- Where the artwork is being worked on. Reference only.
  drive_file_id text,
  drive_url     text,

  -- The immutable asset, once pinned. Bare CIDs, no gateway prefix — gateways
  -- change and a stored gateway URL rots.
  image_cid     text,
  metadata_cid  text,

  -- Where it ended up on chain, once the collection is deployed.
  chain_id           bigint references public.chains (chain_id),
  collection_address text,

  status        text not null default 'draft',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint swag_variants_unique unique (sku, token_id),
  constraint swag_variants_status_known
    check (status in ('draft', 'artwork_ready', 'pinned', 'live')),
  constraint swag_variants_collection_lowercase_hex
    check (collection_address is null or collection_address ~ '^0x[0-9a-f]{40}$'),

  -- The guard that matters. Nothing reaches 'pinned' or 'live' without a real
  -- metadata CID, so the ipfs://REPLACE placeholders in the catalogue cannot
  -- be promoted by accident — which is exactly how a drop ships 18 NFTs that
  -- all render broken.
  constraint swag_variants_live_needs_metadata
    check (status not in ('pinned', 'live') or metadata_cid is not null),
  constraint swag_variants_live_needs_collection
    check (status <> 'live' or collection_address is not null)
);

comment on table public.swag_variants is
  'Artwork pipeline for swag variants. Holds references and state, never image bytes. Drive columns are working links for the admin UI; only *_cid may be used in NFT metadata.';
comment on column public.swag_variants.drive_url is
  'Working link for humans. NEVER put this in NFT metadata — Drive serves an HTML interstitial, not an image.';
comment on column public.swag_variants.image_cid is
  'Bare IPFS CID of the product image. No gateway prefix; gateways rot.';
comment on column public.swag_variants.status is
  'draft -> artwork_ready (Drive art exists) -> pinned (CID exists) -> live (on chain).';

create index swag_variants_status_idx on public.swag_variants (status);
create index swag_variants_sku_idx on public.swag_variants (sku, token_id);

create or replace function public.touch_swag_variants_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger swag_variants_touch_updated_at
  before update on public.swag_variants
  for each row execute function public.touch_swag_variants_updated_at();

alter table public.swag_variants enable row level security;
alter table public.swag_variants force row level security;

-- Anyone may read a variant that is actually live; the rest is internal
-- production state and stays server-side.
create policy "live swag variants are public" on public.swag_variants
  for select to anon, authenticated using (status = 'live');

revoke all on public.swag_variants from anon, authenticated;
grant select on public.swag_variants to anon, authenticated;

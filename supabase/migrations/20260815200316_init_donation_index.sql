-- ETH Cali donation index — initial schema.
-- The chain is the source of truth for money. This database is an index and a
-- presentation layer. Nothing here is ever authoritative for a balance.

create table public.chains (
  chain_id          bigint primary key,
  name              text   not null,
  native_symbol     text   not null,
  explorer_base_url text   not null,
  created_at        timestamptz not null default now()
);
comment on table public.chains is 'Supported chains. Reference data.';

create table public.tokens (
  chain_id   bigint not null references public.chains (chain_id),
  address    text   not null,
  symbol     text   not null,
  name       text,
  decimals   smallint not null check (decimals between 0 and 36),
  is_native  boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (chain_id, address),
  constraint tokens_address_lowercase_hex check (address ~ '^0x[0-9a-f]{40}$')
);
comment on table public.tokens is 'Per-chain token registry. decimals is the single source for formatting: USDC=6, COPm=18. verified_at records when symbol()/decimals() were last read on-chain — NULL means UNVERIFIED, do not trust it in the UI.';

create table public.campaigns (
  id                  bigint generated always as identity primary key,
  chain_id            bigint not null references public.chains (chain_id),
  vault_address       text   not null,
  onchain_campaign_id numeric(78,0) not null,
  slug                text   not null unique,
  title               text   not null,
  summary             text,
  story               text,
  image_url           text,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint campaigns_vault_lowercase_hex check (vault_address ~ '^0x[0-9a-f]{40}$'),
  constraint campaigns_onchain_unique unique (chain_id, vault_address, onchain_campaign_id)
);
comment on table public.campaigns is 'Editorial layer for a DonationVault campaign: copy, images, story. Holds no amounts and no authorization state. Totals come from the chain.';

create table public.donations (
  id                  bigint generated always as identity primary key,
  chain_id            bigint not null references public.chains (chain_id),
  tx_hash             text   not null,
  log_index           integer not null check (log_index >= 0),
  block_number        bigint not null check (block_number >= 0),
  block_time          timestamptz not null,
  vault_address       text   not null,
  onchain_campaign_id numeric(78,0) not null,
  campaign_id         bigint references public.campaigns (id),
  donor_address       text   not null,
  token_address       text   not null,
  amount              numeric(78,0) not null check (amount >= 0),
  indexed_at          timestamptz not null default now(),
  constraint donations_tx_hash_lowercase_hex check (tx_hash ~ '^0x[0-9a-f]{64}$'),
  constraint donations_donor_lowercase_hex check (donor_address ~ '^0x[0-9a-f]{40}$'),
  constraint donations_vault_lowercase_hex check (vault_address ~ '^0x[0-9a-f]{40}$'),
  constraint donations_token_lowercase_hex check (token_address ~ '^0x[0-9a-f]{40}$'),
  constraint donations_onchain_identity unique (chain_id, tx_hash, log_index),
  foreign key (chain_id, token_address) references public.tokens (chain_id, address)
);
comment on table public.donations is 'One row per donation event on chain. amount is in token base units — format with tokens.decimals, never a hardcoded 18. Totals shown to users must reconcile against the vault totalRaised().';
comment on column public.donations.amount is 'uint256 base units. numeric(78,0), not bigint.';
comment on column public.donations.campaign_id is 'Nullable on purpose: a donation must never be dropped because its editorial campaign row does not exist yet. Chain first, copy later.';

create table public.receipt_mints (
  id               bigint generated always as identity primary key,
  chain_id         bigint not null references public.chains (chain_id),
  tx_hash          text   not null,
  log_index        integer not null check (log_index >= 0),
  block_number     bigint not null check (block_number >= 0),
  block_time       timestamptz not null,
  contract_address text   not null,
  recipient        text   not null,
  token_id         numeric(78,0) not null,
  quantity         numeric(78,0) not null check (quantity > 0),
  donation_id      bigint references public.donations (id),
  indexed_at       timestamptz not null default now(),
  constraint receipt_mints_tx_hash_lowercase_hex check (tx_hash ~ '^0x[0-9a-f]{64}$'),
  constraint receipt_mints_recipient_lowercase_hex check (recipient ~ '^0x[0-9a-f]{40}$'),
  constraint receipt_mints_contract_lowercase_hex check (contract_address ~ '^0x[0-9a-f]{40}$'),
  constraint receipt_mints_onchain_identity unique (chain_id, tx_hash, log_index)
);
comment on table public.receipt_mints is 'Indexed soulbound donor receipt mints. Tier is derived from token_id via the contract admin-configured tiers — do not infer tiers from amounts here.';

create table public.ens_names (
  address     text primary key,
  name        text,
  resolved_at timestamptz not null default now(),
  constraint ens_names_address_lowercase_hex check (address ~ '^0x[0-9a-f]{40}$')
);
comment on table public.ens_names is 'Forward-resolution cache only. NULL name means resolved-with-no-name, which is a real answer, not a miss. Note ethcali.eth has no reverse record.';

create table public.fx_rates (
  id           bigint generated always as identity primary key,
  base_symbol  text not null,
  quote_symbol text not null,
  rate         numeric(38,18) not null check (rate > 0),
  source       text not null,
  observed_at  timestamptz not null,
  created_at   timestamptz not null default now(),
  constraint fx_rates_pair_observation_unique unique (base_symbol, quote_symbol, source, observed_at)
);
comment on table public.fx_rates is 'Point-in-time FX snapshots for showing fiat context next to token amounts. Presentation only — never used to compute or settle an on-chain amount.';

create table public.admins (
  address    text primary key,
  label      text,
  note       text,
  created_at timestamptz not null default now(),
  constraint admins_address_lowercase_hex check (address ~ '^0x[0-9a-f]{40}$')
);
comment on table public.admins is 'DISPLAY REGISTRY ONLY — CONFERS ZERO AUTHORITY. Decides who is shown the admin UI. Contract AccessControl is the only authority; the contract still rejects the call. Never gate a write on this table.';

create table public.indexer_cursors (
  chain_id          bigint not null references public.chains (chain_id),
  contract_address  text   not null,
  last_block_number bigint not null check (last_block_number >= 0),
  updated_at        timestamptz not null default now(),
  primary key (chain_id, contract_address),
  constraint indexer_cursors_contract_lowercase_hex check (contract_address ~ '^0x[0-9a-f]{40}$')
);
comment on table public.indexer_cursors is 'Per (chain, contract) watermark. Advance only after the batch commits, or a crash mid-batch silently skips events.';

create index donations_campaign_feed_idx on public.donations (campaign_id, block_time desc, id desc);
create index donations_donor_idx on public.donations (donor_address, block_time desc);
create index donations_chain_block_idx on public.donations (chain_id, block_number);
create index donations_token_idx on public.donations (chain_id, token_address);
create index receipt_mints_recipient_idx on public.receipt_mints (recipient, block_time desc);
create index receipt_mints_donation_idx on public.receipt_mints (donation_id);
create index campaigns_published_idx on public.campaigns (is_published, created_at desc) where is_published;
create index fx_rates_lookup_idx on public.fx_rates (base_symbol, quote_symbol, observed_at desc);

alter table public.chains          enable row level security;
alter table public.tokens          enable row level security;
alter table public.campaigns       enable row level security;
alter table public.donations       enable row level security;
alter table public.receipt_mints   enable row level security;
alter table public.ens_names       enable row level security;
alter table public.fx_rates        enable row level security;
alter table public.admins          enable row level security;
alter table public.indexer_cursors enable row level security;

create policy "chains are public" on public.chains for select to anon, authenticated using (true);
create policy "tokens are public" on public.tokens for select to anon, authenticated using (true);
create policy "published campaigns are public" on public.campaigns for select to anon, authenticated using (is_published);
create policy "donations are public" on public.donations for select to anon, authenticated using (true);
create policy "receipt mints are public" on public.receipt_mints for select to anon, authenticated using (true);
create policy "ens names are public" on public.ens_names for select to anon, authenticated using (true);
create policy "fx rates are public" on public.fx_rates for select to anon, authenticated using (true);
create policy "admin display registry is public" on public.admins for select to anon, authenticated using (true);

grant usage on schema public to anon, authenticated;

revoke all on public.chains, public.tokens, public.campaigns, public.donations,
  public.receipt_mints, public.ens_names, public.fx_rates, public.admins,
  public.indexer_cursors from anon, authenticated;

grant select on public.chains, public.tokens, public.campaigns, public.donations,
  public.receipt_mints, public.ens_names, public.fx_rates, public.admins
  to anon, authenticated;

create view public.donation_feed with (security_invoker = true) as
select
  d.id, d.chain_id, d.tx_hash, d.block_time, d.campaign_id,
  c.slug     as campaign_slug,
  d.donor_address,
  e.name     as donor_ens,
  d.token_address,
  t.symbol   as token_symbol,
  t.decimals as token_decimals,
  d.amount
from public.donations d
left join public.campaigns c on c.id = d.campaign_id
left join public.tokens    t on t.chain_id = d.chain_id and t.address = d.token_address
left join public.ens_names e on e.address = d.donor_address;

comment on view public.donation_feed is 'Donor wall read model. Returns amount in BASE UNITS plus token_decimals — the client formats with formatUnits(amount, token_decimals). Deliberately sums nothing; totals come from totalRaised().';

grant select on public.donation_feed to anon, authenticated;

insert into public.chains (chain_id, name, native_symbol, explorer_base_url) values
  (1,     'Ethereum', 'ETH',  'https://etherscan.io'),
  (10,    'Optimism', 'ETH',  'https://optimistic.etherscan.io'),
  (130,   'Unichain', 'ETH',  'https://uniscan.xyz'),
  (8453,  'Base',     'ETH',  'https://basescan.org'),
  (42220, 'Celo',     'CELO', 'https://celoscan.io');

insert into public.tokens (chain_id, address, symbol, name, decimals, is_native, verified_at) values
  (42220, '0x8a567e2ae79ca692bd748ab832081c45de4041ea', 'COPm', 'Mento Colombian Peso', 18, false, now()),
  (42220, '0xceba9300f2b948710d2653dd7b07f33a8b32118c', 'USDC', 'USD Coin',              6, false, now());

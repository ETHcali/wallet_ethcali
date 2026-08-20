-- Three gaps the initial schema left, all found when wiring the indexer and the
-- donor wall against it.
--
-- 1. `Donated(campaignId, donor, token, amount, message)` carries a donor
--    message. There was nowhere to put it, so the wall could only ever show
--    amounts.
-- 2. `donations.token_address` references `tokens`, and the vault accepts the
--    native gas token through the ETH sentinel. With no row for it, the FK
--    would reject every native donation — the indexer would drop real money
--    off the wall.
-- 3. The wall queries by (chain, vault, onchain campaign, token) ordered by
--    time. No index covered that shape.

alter table public.donations add column message text;
comment on column public.donations.message is 'Donor-supplied message from the Donated event. Untrusted user input — escape at render, never interpolate into HTML or SQL.';

-- The vault's ETH_TOKEN sentinel means "this chain's native token", which on
-- Celo is CELO, not ETH. Decimals and symbol for a native token come from the
-- chain's own parameters rather than a contract, so verified_at records that
-- they are known-good, not that a symbol() call was made.
insert into public.tokens (chain_id, address, symbol, name, decimals, is_native, verified_at) values
  (42220, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'CELO', 'Celo', 18, true, now())
on conflict (chain_id, address) do nothing;

-- Donor wall: filters on chain + vault + campaign + token, newest first.
create index donations_vault_campaign_feed_idx
  on public.donations (chain_id, vault_address, onchain_campaign_id, token_address, block_time desc);

-- Republish the read model with the columns the wall actually filters on, plus
-- the message. Existing columns keep their position so this stays a replace.
create or replace view public.donation_feed with (security_invoker = true) as
select
  d.id, d.chain_id, d.tx_hash, d.block_time, d.campaign_id,
  c.slug     as campaign_slug,
  d.donor_address,
  e.name     as donor_ens,
  d.token_address,
  t.symbol   as token_symbol,
  t.decimals as token_decimals,
  d.amount,
  d.vault_address,
  d.onchain_campaign_id,
  d.message
from public.donations d
left join public.campaigns c on c.id = d.campaign_id
left join public.tokens    t on t.chain_id = d.chain_id and t.address = d.token_address
left join public.ens_names e on e.address = d.donor_address;

revoke all on public.donation_feed from anon, authenticated;
grant select on public.donation_feed to anon, authenticated;

-- ShanHaiWoo quest requests — an inbox, not content.
--
-- A business proposes a mission to be executed in Shenzhen, Hong Kong or Mumbai
-- during the ShanHaiWoo popup city, and someone from ETH Cali picks it up.
--
-- This is the first table in the project that `anon` may write to, so the shape
-- is deliberate and narrow:
--
--   INSERT only. No SELECT, no UPDATE, no DELETE for anon or authenticated.
--   A submitter cannot read back their own row, let alone anyone else's — which
--   matters because these rows carry a named person's email and phone number.
--
-- That is a different thing from the content tables, where a public writer could
-- forge our own history. Nothing here is ever published; it is read by an
-- operator through the service role and acted on off-site.

create table public.quest_requests (
  id            bigint generated always as identity primary key,

  -- contact
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  phone         text not null,
  role          text,

  -- the business
  company       text not null,
  website       text,
  instagram     text,
  linkedin      text,
  x_handle      text,

  -- the quest
  city          text not null,
  kind          text not null,
  brief         text not null,

  -- 1000 USD is the posted value. A proposer may counter, and the counter is
  -- worth capturing: a cluster of counters at the same number is the real price.
  value_accepted boolean not null,
  value_proposed_usd integer check (value_proposed_usd is null or value_proposed_usd >= 0),

  -- operator state. Never set by the submitter.
  status        text not null default 'new',
  notes         text,

  created_at    timestamptz not null default now(),

  constraint quest_requests_email_shape check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint quest_requests_city_known check (city in ('shenzhen', 'hong-kong', 'mumbai', 'any')),
  constraint quest_requests_kind_known check (kind in ('vendor', 'product', 'counterpart', 'connections', 'other')),
  constraint quest_requests_status_known check (status in ('new', 'reviewing', 'accepted', 'declined', 'done')),
  -- Either they accepted the posted value, or they named their own. A row that
  -- says neither tells an operator nothing.
  constraint quest_requests_value_answered
    check (value_accepted or value_proposed_usd is not null),
  -- Long enough to be a brief rather than a placeholder.
  constraint quest_requests_brief_substantive check (length(btrim(brief)) >= 40)
);

comment on table public.quest_requests is
  'Inbound quest proposals from businesses for the ShanHaiWoo popup city. anon may INSERT and nothing else — rows carry personal contact details and are never published. Read by operators through the service role.';

create index quest_requests_triage_idx on public.quest_requests (status, created_at desc);

alter table public.quest_requests enable row level security;
alter table public.quest_requests force row level security;

-- The only public capability on this table.
create policy "anyone may submit a quest request" on public.quest_requests
  for insert to anon, authenticated with check (true);

revoke all on public.quest_requests from anon, authenticated;
grant insert on public.quest_requests to anon, authenticated;

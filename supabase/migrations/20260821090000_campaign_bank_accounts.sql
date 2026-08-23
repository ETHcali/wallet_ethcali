-- Bank accounts a campaign publishes for fiat donations.
--
-- Not every donor in Cali has a wallet. A campaign can therefore publish one or
-- more bank accounts (COP savings, Nequi, a USD account for donors abroad)
-- alongside its on-chain currencies.
--
-- These rows are DISPLAY ONLY and deliberately carry no amounts. Nothing here
-- is authoritative for what was raised: on-chain totals come from the vault,
-- and fiat deposits will be reconciled from bank notifications in their own
-- table. Keeping money out of this table keeps the one architecture rule intact
-- — Postgres indexes and presents, it never decides a balance.
--
-- Account details are public on purpose: a donor cannot transfer to an account
-- they cannot read. Only service_role writes them, so the published numbers can
-- only ever be changed by an operator, never by a client.

create table public.campaign_bank_accounts (
  id                     bigint generated always as identity primary key,
  campaign_id            bigint not null references public.campaigns (id) on delete cascade,

  -- What the donor sees
  label                  text not null,
  bank_name              text not null,
  account_type           text not null,
  account_number         text not null,
  currency               text not null,

  -- Who receives it. This is the ESAL, and it must match the entity that signs
  -- the donation certificate, or the donor's tax claim will not reconcile.
  account_holder         text not null,
  holder_document_type   text not null default 'NIT',
  holder_document_number text not null,

  -- International donors only; null for a domestic Colombian account.
  swift_bic              text,
  iban                   text,

  -- How the donor should tag the transfer so it can be matched to them later.
  reference_note         text,

  is_active              boolean not null default true,
  sort_order             integer not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- Nequi and Daviplata are wallet-style accounts keyed on a phone number and
  -- are how a large share of Colombians actually move money. They are account
  -- types here rather than a separate concept.
  constraint campaign_bank_accounts_type_valid
    check (account_type in ('ahorros', 'corriente', 'nequi', 'daviplata', 'internacional')),
  constraint campaign_bank_accounts_currency_valid
    check (currency in ('COP', 'USD')),
  constraint campaign_bank_accounts_document_type_valid
    check (holder_document_type in ('NIT', 'CC', 'CE')),
  -- An international account is useless without a routing identifier.
  constraint campaign_bank_accounts_international_routable
    check (account_type <> 'internacional' or swift_bic is not null or iban is not null),
  constraint campaign_bank_accounts_no_duplicates
    unique (campaign_id, bank_name, account_number)
);

-- Every read is "the active accounts for this campaign, in display order", and
-- the FK needs its own index regardless: Postgres does not create one, so an
-- unindexed FK turns a campaign delete into a sequential scan.
create index campaign_bank_accounts_campaign_active_idx
  on public.campaign_bank_accounts (campaign_id, sort_order)
  where is_active;

comment on table public.campaign_bank_accounts is
  'Fiat donation accounts shown on a campaign page. Display only — never authoritative for amounts raised.';

alter table public.campaign_bank_accounts enable row level security;

-- Visible only when the account is active AND its campaign is published, so an
-- unpublished draft cannot leak an account number through this table.
create policy "active bank accounts of published campaigns are public"
  on public.campaign_bank_accounts
  for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1
      from public.campaigns c
      where c.id = campaign_bank_accounts.campaign_id
        and c.is_published
    )
  );

revoke all on public.campaign_bank_accounts from anon, authenticated;
grant select on public.campaign_bank_accounts to anon, authenticated;

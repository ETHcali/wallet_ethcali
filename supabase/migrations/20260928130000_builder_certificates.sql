-- Builder certificates — who built what at an event, and where to send the proof.
--
-- One row per person per project, not per team: a certificate is issued to a
-- builder, and a team of four is four rows. The first event is the EAG Global
-- Buildathon, Colombia track (Cali, 20 September 2026): every project published
-- on Devfolio, winners or not.
--
-- The roster is loaded by an operator through the service role from the
-- Devfolio export, and is NOT in this migration: it is a list of named people's
-- email addresses, and this repository is not the place for it.
--
-- The claim is the whole point, and it follows /swag/claim exactly:
--
--   a row belongs to you if its `email` is one of the emails Privy verified for
--   your session. The server sets `wallet` to one of your linked wallets. The
--   client never names an email and never names a wallet it does not own.
--
-- No client role has any grant. The app reads and writes through the service
-- role in pages/api/certificates.ts, after checking the Privy session.

create table public.builder_certificates (
  id            bigint generated always as identity primary key,

  -- the event, so a second hackathon is new rows rather than a new table
  event         text not null,

  -- the project, as Devfolio has it
  project_slug  text not null,
  project_name  text not null,

  -- the person, as Devfolio has them. Lowercase: it is compared against the
  -- lowercased emails Privy returns.
  member_name   text not null,
  email         text not null,

  -- set by the claim; null until then
  wallet        text,
  claimed_at    timestamptz,

  -- set when the certificate is actually issued on chain. Once it is, the
  -- wallet no longer changes: the proof already went to that address.
  issued_tx     text,

  created_at    timestamptz not null default now(),

  constraint builder_certificates_email_lower check (email = lower(email)),
  constraint builder_certificates_email_shape check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint builder_certificates_wallet_shape check (wallet is null or wallet ~ '^0x[0-9a-f]{40}$'),
  constraint builder_certificates_issued_tx_shape check (issued_tx is null or issued_tx ~ '^0x[0-9a-f]{64}$'),
  constraint builder_certificates_claim_complete check ((wallet is null) = (claimed_at is null)),
  constraint builder_certificates_issued_needs_wallet check (issued_tx is null or wallet is not null),
  constraint builder_certificates_one_per_person unique (event, project_slug, email)
);

comment on table public.builder_certificates is
  'Event builder certificates, one row per person per project. Claimed through the app by a Privy-verified email; wallet set server-side. No client grants — service role only.';

-- The claim looks rows up by the caller's verified emails.
create index builder_certificates_email_idx on public.builder_certificates (email);

alter table public.builder_certificates enable row level security;
alter table public.builder_certificates force row level security;

revoke all on public.builder_certificates from anon, authenticated;

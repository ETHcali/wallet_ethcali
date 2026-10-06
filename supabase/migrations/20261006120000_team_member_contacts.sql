-- How to reach the team — private, beside the public team table.
--
-- team_members is what ethcali.org shows (and reads with select *, with the
-- anon key, at build time), so an email column there would be published.
-- This table holds the contact side: the email(s) a member uses, their
-- Telegram, the wallet they told us is theirs. RLS on, no policies, no client
-- grants — only the service role reads it, which in practice means the admin
-- routes behind an on-chain ADMIN_ROLE check. First filled from the "Intención
-- de Core" form responses; edited from /admin/certificates → Team.
--
-- builder_certificates.team_member_id ties a team member's certificate to
-- their public profile, so the admin can see at a glance who on the team has
-- which certificate for which event. Nullable: builders are not team.

create table public.team_member_contacts (
  team_member_id bigint primary key references public.team_members (id) on delete cascade,
  email          text,
  emails         text[] not null default '{}',
  telegram       text,
  wallet         text,
  updated_at     timestamptz not null default now(),
  constraint team_member_contacts_email_lower  check (email is null or email = lower(email)),
  constraint team_member_contacts_email_shape  check (email is null or email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint team_member_contacts_emails_lower check (array_to_string(emails, ',') = lower(array_to_string(emails, ','))),
  constraint team_member_contacts_emails_has_primary check (email is null or email = any (emails)),
  constraint team_member_contacts_wallet_shape check (wallet is null or wallet ~ '^0x[0-9a-f]{40}$')
);
comment on table public.team_member_contacts is
  'Private contact details for team_members: emails, Telegram, self-reported wallet. Service role only — never exposed to the site.';

create trigger team_member_contacts_touch_updated_at
  before update on public.team_member_contacts
  for each row execute function public.touch_updated_at();

alter table public.team_member_contacts enable row level security;
alter table public.team_member_contacts force row level security;
revoke all on public.team_member_contacts from anon, authenticated;

alter table public.builder_certificates
  add column team_member_id bigint references public.team_members (id) on delete set null;
create index builder_certificates_team_member_idx on public.builder_certificates (team_member_id) where team_member_id is not null;

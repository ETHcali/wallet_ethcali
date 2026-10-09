-- Certificates hang off the events the site already has.
--
-- Until now everything a certificate says about its event — title, venue,
-- dates, sponsors — was a constant in lib/certificates/events.ts, so the next
-- event meant a code change. It now lives here, next to `events`, `venues` and
-- `partners`, and is edited from /admin/certificates.
--
--   certificate_events          one row per event that issues certificates;
--                               `key` is what builder_certificates.event holds
--   certificate_event_sponsors  which partners the diploma prints, in order
--   partners.print_logo_path    the logo as it reads on white paper (the site's
--                               logos are made for a dark page); a path under
--                               the app's /public, or ipfs://<cid>
--
-- Public facts only: the site may read them like the rest of its content.

create table public.certificate_events (
  key               text primary key,
  event_id          bigint not null unique references public.events (id) on delete restrict,
  credential_prefix text not null unique,
  credential_name   text not null,
  title             text not null,
  headline          text not null,
  chapter           text,
  diploma_location  text not null,
  event_dates       text not null,
  event_name        text,
  event_url         text,
  venue_label       text,
  skills            text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint certificate_events_key_format check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint certificate_events_prefix_format check (credential_prefix ~ '^[A-Z0-9]{2,16}$')
);
comment on table public.certificate_events is
  'Events that issue certificates, and what their diplomas, credential pages and LinkedIn entries say. Edited from /admin/certificates.';

create table public.certificate_event_sponsors (
  event_key    text not null references public.certificate_events (key) on delete cascade,
  partner_id   bigint not null references public.partners (id) on delete restrict,
  sort_order   integer not null default 0,
  print_height integer not null default 30,
  primary key (event_key, partner_id),
  constraint certificate_event_sponsors_height check (print_height between 10 and 60)
);

alter table public.partners add column print_logo_path text;

create trigger certificate_events_touch_updated_at
  before update on public.certificate_events
  for each row execute function public.touch_updated_at();

alter table public.certificate_events enable row level security;
alter table public.certificate_events force row level security;
alter table public.certificate_event_sponsors enable row level security;
alter table public.certificate_event_sponsors force row level security;
revoke all on public.certificate_events, public.certificate_event_sponsors from anon, authenticated;
grant select on public.certificate_events, public.certificate_event_sponsors to anon, authenticated;
create policy "certificate events are public" on public.certificate_events for select using (true);
create policy "certificate sponsors are public" on public.certificate_event_sponsors for select using (true);

-- The Buildathon, exactly as lib/certificates/events.ts had it: its 29
-- diplomas are already pinned, and a re-render must match them.
insert into public.certificate_events
  (key, event_id, credential_prefix, credential_name, title, headline, chapter, diploma_location,
   event_dates, event_name, event_url, venue_label, skills)
values
  ('eag-cali-2026', 52, 'EAGCALI26', 'Builder at EAG Global Buildathon 2026',
   'EAG Global Buildathon · Ethereum Builders Tour', 'EAG Global Buildathon 2026',
   'Ethereum Builders Tour · Colombia chapter', 'Universidad Icesi, Cali', 'Sep 19–20, 2026',
   'EAG Global Buildathon · Colombia', 'https://www.ethcali.org/builders-tour',
   'Auditorio SIDOC — Universidad Icesi, Cali',
   array['Ethereum', 'Smart Contracts', 'Web3', 'Blockchain', 'Hackathon']);

-- Ekinoxis Labs sponsored the tour but was never on the site's partner wall;
-- unpublished, so the home page does not change.
insert into public.partners (slug, name, kind, logo_path, url, sort_order, is_published)
values ('ekinoxis-labs', 'Ekinoxis Labs', 'sponsor', '/tour/ekinoxis.png', 'https://www.ekinoxis.xyz', 100, false)
on conflict (slug) do nothing;

update public.partners set print_logo_path = '/certificates/logos/hashkey-chain.png'      where slug = 'hashkey-chain';
update public.partners set print_logo_path = '/certificates/logos/eag-light.png'          where slug = 'eag';
update public.partners set print_logo_path = '/certificates/logos/devcon-viii.png'        where slug = 'devcon';
update public.partners set print_logo_path = '/certificates/logos/universidad_icesi.png'  where slug = 'universidad-icesi';
update public.partners set print_logo_path = '/certificates/logos/ekinoxis-light.png'     where slug = 'ekinoxis-labs';

insert into public.certificate_event_sponsors (event_key, partner_id, sort_order, print_height)
select 'eag-cali-2026', p.id, s.ord, s.h
from (values ('hashkey-chain', 1, 30), ('eag', 2, 26), ('devcon', 3, 36), ('universidad-icesi', 4, 26), ('ekinoxis-labs', 5, 34)) as s(slug, ord, h)
join public.partners p on p.slug = s.slug;

alter table public.builder_certificates
  add constraint builder_certificates_event_fk foreign key (event) references public.certificate_events (key) on update cascade;

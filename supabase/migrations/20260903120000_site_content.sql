-- ETH Cali site content — events, venues, team, partners.
--
-- This is the CMS layer for ethcali.org. It holds editorial content only: what an
-- event was, where it happened, who we did it with. It holds no money, no balances
-- and no authorization state, in keeping with the architecture rule that Postgres is
-- an index and a presentation layer.
--
-- Where this content lived before: CSV files committed in ethcaliorg/databases/ and
-- fetched by the browser at runtime. That worked, but it meant editing history
-- required a commit, and it gave every event a row in a grid rather than a URL.
--
-- Writes come exclusively from pages/api/cms/* behind requireAdmin() (lib/adminAuth.ts),
-- which checks ADMIN_ROLE on chain. anon and authenticated get SELECT and nothing else:
-- a public writer could forge our own history page, the same way a public writer on
-- public.donations could forge the donor wall.

-- ── shared ──────────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
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
comment on function public.touch_updated_at() is
  'Generic updated_at trigger for the site content tables. The donation index predates this and keeps its own per-table function.';

-- ── venues ──────────────────────────────────────────────────────────────────

create table public.venues (
  id             bigint generated always as identity primary key,
  slug           text not null unique,
  name           text not null,
  kind           text,
  status         text not null default 'active',
  maps_url       text,
  -- numeric, not float: these are fixed coordinates, and the venue map draws
  -- markers straight from them.
  lat            numeric(9,6),
  lng            numeric(9,6),
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint venues_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint venues_status_known check (status in ('active', 'inactive', 'closed')),
  -- Either both coordinates or neither. One alone silently drops a marker at the
  -- equator instead of failing.
  constraint venues_coords_paired check ((lat is null) = (lng is null))
);
comment on table public.venues is 'Places we have run events. lat/lng drive the venues map. Imported from databases/venuesethcali.csv.';

-- ── partners ────────────────────────────────────────────────────────────────

create table public.partners (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  name         text not null,
  kind         text not null,
  logo_path    text,
  url          text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint partners_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint partners_kind_known check (kind in ('host', 'university', 'supporter', 'sponsor', 'venue_partner'))
);
comment on table public.partners is 'Hosts, universities, supporters and sponsors shown on the home page. These were hardcoded into ethcali.html markup (#official-hosts, #partner-universities, #supporters) until this table existed.';

-- ── team ────────────────────────────────────────────────────────────────────

create table public.team_members (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  name          text not null,
  role_es       text,
  role_en       text,
  status        text,
  since         date,
  image_path    text,
  linkedin_url  text,
  twitter_url   text,
  github_url    text,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint team_members_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
comment on table public.team_members is 'The people on the about page. Imported from databases/teamaboutus.csv.';

-- ── events ──────────────────────────────────────────────────────────────────

create table public.events (
  id                bigint generated always as identity primary key,

  -- The slug is a permanent public identifier: it is the URL, and it goes into
  -- og:url. Generate it once at import and never recompute it — a recomputed slug
  -- turns every link anyone has shared into a 404.
  slug              text not null unique,

  kind              text not null,
  role              text not null,
  scope             text not null,

  starts_on         date not null,
  ends_on           date,

  city              text,
  country           text,
  venue_id          bigint references public.venues (id) on delete set null,
  location_url      text,

  -- Spanish is the primary language and is required; English is optional and the
  -- site falls back to Spanish when it is missing. That is deliberate: a half
  -- translated event should read as Spanish, never as a blank page.
  name_es           text not null,
  name_en           text,
  summary_es        text,
  summary_en        text,
  body_es           text,
  body_en           text,

  poster_path       text,
  luma_slug         text,
  registration_url  text,
  rsvp_count        integer check (rsvp_count >= 0),
  social_url        text,
  recap_url         text,
  photos_url        text,
  drive_folder_url  text,
  youtube_url       text,

  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint events_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint events_kind_known check (kind in (
    'meetup', 'workshop', 'hackathon', 'conference', 'hacker_house', 'volunteering', 'other'
  )),
  constraint events_role_known check (role in (
    'host', 'cohost', 'colab', 'participant', 'volunteering'
  )),
  constraint events_scope_known check (scope in ('local', 'international')),
  -- A multi-day event that ends before it starts is a data-entry slip that would
  -- otherwise sort into the wrong year and quietly vanish from the timeline.
  constraint events_dates_ordered check (ends_on is null or ends_on >= starts_on)
);
comment on table public.events is 'Every ETH Cali event, local and international. One row per event, one URL per row (/events/<slug>). Imported from databases/Eventos historicos ethcali - historic.csv. scope=international is OUR participation abroad, not the public worldwide calendar the old site rendered there.';

-- POAPs and NFTs are child rows rather than columns because a single event can
-- mint more than one, which the source CSV could not express: it had one
-- "POAP LINK" column and lost anything beyond the first.

-- The natural keys below exist so the import is replayable. `nulls not distinct`
-- is the point: protocol and nft_url are frequently null in the source data, and
-- under the default NULL semantics two identical all-null rows never conflict, so
-- re-running the seed silently doubled these tables.

create table public.event_poaps (
  id           bigint generated always as identity primary key,
  event_id     bigint not null references public.events (id) on delete cascade,
  poap_url     text not null,
  chain        text,
  collectors   integer check (collectors >= 0),
  created_at   timestamptz not null default now(),
  constraint event_poaps_unique unique nulls not distinct (event_id, poap_url)
);
comment on table public.event_poaps is 'POAP drops for an event. collectors is a point-in-time count copied from the drop page — it is presentation only and is never authoritative; the POAP API is.';

create table public.event_nfts (
  id           bigint generated always as identity primary key,
  event_id     bigint not null references public.events (id) on delete cascade,
  protocol     text,
  nft_url      text,
  chain        text,
  mints        integer check (mints >= 0),
  created_at   timestamptz not null default now(),
  constraint event_nfts_unique unique nulls not distinct (event_id, protocol, nft_url)
);
comment on table public.event_nfts is 'Commemorative NFT drops for an event. mints is a copied count, never authoritative — read the contract for a real number.';

create table public.hackathon_details (
  event_id           bigint primary key references public.events (id) on delete cascade,
  edition            text,
  participant_count  integer check (participant_count >= 0),
  project_count      integer check (project_count >= 0),
  prize_pool         text,
  tracks             jsonb not null default '[]'::jsonb,
  sponsors           jsonb not null default '[]'::jsonb,
  winners            jsonb not null default '[]'::jsonb,
  -- Which organisation we ran it with. The hacker houses are run with
  -- ekinoxis.xyz, and that relationship is the reason this column exists.
  partner_org        text,
  partner_url        text,
  external_url       text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint hackathon_details_tracks_is_array check (jsonb_typeof(tracks) = 'array'),
  constraint hackathon_details_sponsors_is_array check (jsonb_typeof(sponsors) = 'array'),
  constraint hackathon_details_winners_is_array check (jsonb_typeof(winners) = 'array')
);
comment on table public.hackathon_details is 'The extra fields a hackathon or hacker house page needs, keyed 1:1 to an event. Only rows whose event.kind is hackathon or hacker_house should exist here.';

-- ── indexes ─────────────────────────────────────────────────────────────────

-- The two list pages. Partial on is_published because that is how every public
-- read filters, and unpublished drafts should not bloat the index.
create index events_scope_listing_idx on public.events (scope, starts_on desc) where is_published;
create index events_kind_listing_idx  on public.events (kind, starts_on desc) where is_published;

-- Foreign keys are not indexed automatically, and this is a join and cascade path.
create index events_venue_idx on public.events (venue_id);

-- event_poaps and event_nfts need no explicit event_id index: their unique
-- constraints above are btrees leading with event_id, which already serves both
-- the join and the ON DELETE CASCADE. A second index would only cost writes.

create index partners_listing_idx     on public.partners (kind, sort_order) where is_published;
create index team_members_listing_idx on public.team_members (sort_order)   where is_published;
create index venues_published_idx     on public.venues (status)             where is_published;

-- ── updated_at ──────────────────────────────────────────────────────────────

create trigger venues_touch_updated_at
  before update on public.venues
  for each row execute function public.touch_updated_at();

create trigger partners_touch_updated_at
  before update on public.partners
  for each row execute function public.touch_updated_at();

create trigger team_members_touch_updated_at
  before update on public.team_members
  for each row execute function public.touch_updated_at();

create trigger events_touch_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();

create trigger hackathon_details_touch_updated_at
  before update on public.hackathon_details
  for each row execute function public.touch_updated_at();

-- ── row level security ──────────────────────────────────────────────────────

alter table public.venues            enable row level security;
alter table public.partners          enable row level security;
alter table public.team_members      enable row level security;
alter table public.events            enable row level security;
alter table public.event_poaps       enable row level security;
alter table public.event_nfts        enable row level security;
alter table public.hackathon_details enable row level security;

alter table public.venues            force row level security;
alter table public.partners          force row level security;
alter table public.team_members      force row level security;
alter table public.events            force row level security;
alter table public.event_poaps       force row level security;
alter table public.event_nfts        force row level security;
alter table public.hackathon_details force row level security;

create policy "published venues are public" on public.venues
  for select to anon, authenticated using (is_published);
create policy "published partners are public" on public.partners
  for select to anon, authenticated using (is_published);
create policy "published team members are public" on public.team_members
  for select to anon, authenticated using (is_published);
create policy "published events are public" on public.events
  for select to anon, authenticated using (is_published);

-- Child rows inherit their parent's visibility. Without the exists() check an
-- unpublished event would leak its POAP and prize data through the child tables.
create policy "poaps of published events are public" on public.event_poaps
  for select to anon, authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.is_published));

create policy "nfts of published events are public" on public.event_nfts
  for select to anon, authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.is_published));

create policy "details of published hackathons are public" on public.hackathon_details
  for select to anon, authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.is_published));

-- ── grants ──────────────────────────────────────────────────────────────────

revoke all on public.venues, public.partners, public.team_members, public.events,
  public.event_poaps, public.event_nfts, public.hackathon_details
  from anon, authenticated;

grant select on public.venues, public.partners, public.team_members, public.events,
  public.event_poaps, public.event_nfts, public.hackathon_details
  to anon, authenticated;

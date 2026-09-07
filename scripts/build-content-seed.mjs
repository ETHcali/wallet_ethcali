/**
 * One-time import: the ethcali.org CSVs → a seed SQL file for public.events and friends.
 *
 * Emits SQL rather than writing to Supabase directly, deliberately. This import runs
 * once against production content that has no other backup; a reviewable, replayable
 * .sql file that can be diffed before it is applied is worth more than a script that
 * mutates a live database on the first run. Apply it with:
 *
 *   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed/site_content_seed.sql
 *
 * Re-running is safe: parent rows key on slug, child rows on their natural
 * unique constraint. Both do nothing on conflict.
 *
 * Run:  node scripts/build-content-seed.mjs [path-to-ethcaliorg]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(process.argv[2] ?? join(HERE, '../../ethcaliorg'));
const OUT = join(HERE, '../supabase/seed/site_content_seed.sql');

// ── CSV ─────────────────────────────────────────────────────────────────────

/** Quote-aware split of one line. Ported from ethcaliorg/js/events-service.js. */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else current += char;
  }
  values.push(current.trim());
  return values;
}

/**
 * A CSV field can span lines when it is quoted. The browser parser never handled
 * that because none of the fields it read happened to contain a newline; the
 * international sheet does, so join physical lines until quotes balance.
 */
function parseCSV(text) {
  const rows = [];
  let buffer = '';
  for (const line of text.split('\n')) {
    buffer = buffer ? `${buffer}\n${line}` : line;
    const quotes = (buffer.match(/"/g) ?? []).length;
    if (quotes % 2 !== 0) continue;
    if (buffer.trim()) rows.push(parseCSVLine(buffer));
    buffer = '';
  }
  if (buffer.trim()) rows.push(parseCSVLine(buffer));
  return rows;
}

/**
 * "NA" is this dataset's null, and it is not the only spelling of one. The team
 * sheet also uses the Spanish "No tiene" ("doesn't have") in URL columns, which
 * as a string renders a link labelled with an excuse and pointing nowhere.
 */
const NULLISH = new Set(['na', 'n/a', '#n/a', '-', 'no tiene', 'no aplica', 'none', 'null', 'tbd']);

function clean(value) {
  const s = String(value ?? '').trim();
  if (!s || NULLISH.has(s.toLowerCase())) return null;
  return s;
}

/**
 * A URL column holds a URL or nothing. Anything else in these cells is a note
 * someone typed into the wrong column, and rendering it as an href produces a
 * link that navigates to a relative path that does not exist.
 */
function url(value) {
  const s = clean(value);
  if (!s) return null;
  // Extract the first URL rather than trusting the whole cell. Several rows hold
  // two links joined with " + " (the QF ETHColombia recap is one), and returning
  // the raw cell produces a single href containing a space and a second URL,
  // which no browser resolves.
  return s.match(/https?:\/\/[^\s,]+/i)?.[0] ?? null;
}

function num(value) {
  const s = clean(value);
  if (s === null) return null;
  const n = Number.parseInt(s.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

/** DD/MM/YYYY → YYYY-MM-DD. */
function isoDate(date) {
  const parts = String(date ?? '').trim().split('/');
  if (parts.length < 3) return null;
  const [d, m, y] = parts;
  if (!/^\d{4}$/.test(y)) return null;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/** "Venue Name: https://maps…" → the name half. */
function labelOf(cell) {
  const s = clean(cell);
  if (!s) return null;
  const name = s.includes(':') ? s.split(':')[0] : s;
  return name.trim() || null;
}

/** "Venue Name: https://maps…" → the URL half. */
function urlOf(cell) {
  const s = clean(cell);
  return s?.match(/https?:\/\/[^\s,]+/)?.[0] ?? null;
}

// ── slugs ───────────────────────────────────────────────────────────────────

/**
 * Slugs are permanent public identifiers — they are the URL and they go into
 * og:url. They are generated here exactly once and then live in the database;
 * nothing downstream may recompute one, or every link anyone has shared breaks.
 */
function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

function uniqueSlug(base, taken) {
  let slug = base || 'evento';
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  taken.add(slug);
  return slug;
}

// ── poster matching ─────────────────────────────────────────────────────────
//
// Ported verbatim in behaviour from ethcaliorg/js/events-service.js. Its comments
// record three bugs this algorithm already fixed: a hardcoded filename list that
// drifted from the folder, an exact-date gate that dropped events whose CSV date
// disagreed with the filename, and a fallback that handed one generic poster to
// six different events. Do not "simplify" it back.

const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'en', 'y', 'con',
                      'un', 'una', 'the', 'of', 'and', 'for', 'a']);

function tokenize(text) {
  return new Set(String(text ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w)));
}

function score(event, poster) {
  if (!poster.tokens.size || !event.tokens.size) return null;
  let shared = 0;
  for (const t of event.tokens) if (poster.tokens.has(t)) shared += 1;
  if (!shared) return null;

  const overlap = shared / Math.min(event.tokens.size, poster.tokens.size);
  if (overlap < 0.5) return null;

  const exact = Boolean(event.ymd && poster.ymd && event.ymd === poster.ymd);
  const sameMonth = Boolean(event.ymd && poster.ymd && event.ymd.slice(0, 7) === poster.ymd.slice(0, 7));

  // A near-perfect name match stands on its own; anything weaker must be
  // corroborated by the date, or no poster is shown. A wrong poster is worse
  // than none.
  if (!exact && !sameMonth && overlap < 0.85) return null;
  return overlap + (exact ? 1 : sameMonth ? 0.15 : 0);
}

/**
 * Best-first one-to-one assignment. No poster is ever used twice.
 *
 * Filenames are used verbatim, never URL-encoded. They are URL-safe by
 * construction now — YYYY-MM-DD-title.ext, lowercase, hyphens only. They used to
 * be the artwork names, with spaces and '#', and encoding them here is exactly
 * what made next/image double-encode and 400 on four events. If a filename ever
 * looks like it needs encoding, rename the file instead.
 */
function assignPosters(events, manifest) {
  const posters = manifest.map((file) => {
    // Posters are named YYYY-MM-DD-title.ext. The old ' YYYY MM DD Title.png'
    // form is still accepted so a folder that has not been renamed still matches
    // rather than silently losing every date bonus in the scoring below.
    const m =
      file.match(/^(\d{4})-(\d{2})-(\d{2})-(.*?)\.[a-z0-9]+$/i) ??
      file.match(/^(\d{4})\s+(\d{1,2})\s+(\d{1,2})\s+(.*?)\.[a-z0-9]+$/i);
    return {
      file,
      ymd: m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null,
      tokens: tokenize(m ? m[4] : file.replace(/\.[a-z0-9]+$/i, '')),
    };
  });

  const rows = events.map((e) => ({ event: e, ymd: e.starts_on, tokens: tokenize(e.name_es) }));

  const pairs = [];
  for (const row of rows) {
    for (const poster of posters) {
      const s = score(row, poster);
      if (s !== null) pairs.push({ row, poster, score: s });
    }
  }
  pairs.sort((a, b) => b.score - a.score);

  const takenEvent = new Set();
  const takenPoster = new Set();
  for (const { row, poster } of pairs) {
    if (takenEvent.has(row.event) || takenPoster.has(poster.file)) continue;
    takenEvent.add(row.event);
    takenPoster.add(poster.file);
    row.event.poster_path = `/events/${poster.file}`;
  }
  return { assigned: takenPoster.size, posters: posters.length };
}

// ── classification ──────────────────────────────────────────────────────────

const KIND = {
  meetup: 'meetup',
  workshop: 'workshop',
  hackathon: 'hackathon',
  conference: 'conference',
  event: 'other',
  proyecto: 'other',
};

const ROLE = {
  own: 'host',
  colab: 'colab',
  attendees: 'participant',
  voluntering: 'volunteering',
  ethcolombia: 'cohost',
  // The sheet has two rows whose "type event" repeats the content type. Treat
  // them as collaborations, which is what they were.
  workshop: 'colab',
};

/**
 * Scope is stated, not inferred. A heuristic on the location string would call
 * Devcon VI (Bogotá) international and Cripto Latin Fest (Medellín) local for no
 * principled reason — both are national. Only these two rows happened outside
 * Colombia; everything else defaults to local, and the CMS can correct any row.
 */
const INTERNATIONAL = new Set(['devcon-vii-thailandia', 'ehtereum-nyc-next-fin-research-forum']);

// ── venue matching ──────────────────────────────────────────────────────────

/**
 * The two sheets name the same place differently: the events sheet says
 * "Binaural Gastrobar", "Zona america", "Torre de Cali"; the venues sheet says
 * "Binaural", "Zona america - NIDO: Distrito de Innovacion", "Torre de Cali Piso 40".
 * Exact slug equality matched only 11 of 47 rows.
 *
 * Token containment fixes the prefix cases without inventing matches: the event
 * label's words must be almost entirely present in the venue's. "Universidad
 * ICESI" vs "Universidad UAO" shares only the generic word and scores 0.5, below
 * the bar — which is the case that matters, because a wrong venue puts an event
 * on the map in the wrong building.
 */
const GENERIC_VENUE_WORDS = new Set([
  'universidad', 'universida', 'cafe', 'discoteca', 'centro', 'cento',
  'terraza', 'lab', 'coworking', 'gastrobar', 'com',
]);

function matchVenue(label, venues) {
  if (!label) return null;
  const want = tokenize(label);
  if (!want.size) return null;

  let best = null;
  for (const venue of venues) {
    const have = tokenize(venue.name);
    if (!have.size) continue;

    const shared = [...want].filter((t) => have.has(t));
    if (!shared.length) continue;

    const overlap = shared.length / Math.min(want.size, have.size);
    if (overlap < 0.6) continue;

    // At least one shared word has to actually identify the place. Without this,
    // every "Universidad X" collapses onto whichever university sorted first.
    if (!shared.some((t) => !GENERIC_VENUE_WORDS.has(t))) continue;

    if (!best || overlap > best.overlap) best = { venue, overlap };
  }
  return best?.venue ?? null;
}

/**
 * Two rows token matching cannot reach: "Universida Santiago" is a typo, and
 * "Universidad san Buenaventura" and "Universidad USB - Laboratorio Financiero"
 * share only the generic word. Stated explicitly rather than solved with a fuzzy
 * distance that would start matching things it should not.
 */
const VENUE_ALIAS = {
  'universida santiago': 'universidad-santiago-de-cali-usc',
  'universidad san buenaventura': 'universidad-usb-laboratorio-financiero',
};

/** Cali unless the venue says otherwise. */
const CITY_OVERRIDE = {
  'devcon-vi': ['Bogotá', 'Colombia'],
  'blockchain-summit-latam-2023': ['Bogotá', 'Colombia'],
  'devcon-vii-thailandia': ['Bangkok', 'Tailandia'],
  'ehtereum-nyc-next-fin-research-forum': ['Nueva York', 'Estados Unidos'],
  'cripto-latin-fest-2025': ['Medellín', 'Colombia'],
  'workshop-digital-art-colombia-en-cali-medellin-y-bogota': [null, 'Colombia'],
  'financiando-tus-bienes-publicos-con-giveth': [null, null],
};

// ── SQL emitting ────────────────────────────────────────────────────────────

function lit(value) {
  if (value === null || value === undefined || value === '') return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insert(table, columns, rows, conflict) {
  if (!rows.length) return '';
  const head = `insert into public.${table} (${columns.join(', ')}) values`;
  const body = rows
    .map((r) => `  (${columns.map((c) => lit(r[c])).join(', ')})`)
    .join(',\n');
  return `${head}\n${body}\n${conflict};\n\n`;
}

// ── build ───────────────────────────────────────────────────────────────────

const read = (p) => readFileSync(join(SITE, p), 'utf8');

// venues
const venueRows = parseCSV(read('databases/venuesethcali.csv')).slice(1);
const venueSlugs = new Set();
const venues = venueRows
  .filter((r) => clean(r[0]))
  .map((r) => ({
    slug: uniqueSlug(slugify(r[0]), venueSlugs),
    name: clean(r[0]),
    kind: clean(r[1]),
    status: (clean(r[2]) ?? '').toUpperCase() === 'ACTIVATED' ? 'active' : 'inactive',
    maps_url: url(r[4]),
    lat: clean(r[5]),
    lng: clean(r[6]),
  }))
  // The schema requires both coordinates or neither; one alone would drop a
  // marker at the equator instead of failing.
  .map((v) => (v.lat && v.lng ? v : { ...v, lat: null, lng: null }));

const venueBySlug = new Map(venues.map((v) => [v.slug, v]));

// team
const teamRows = parseCSV(read('databases/teamaboutus.csv')).slice(1);
const teamSlugs = new Set();
const team = teamRows
  .filter((r) => clean(r[0]))
  .map((r, i) => ({
    slug: uniqueSlug(slugify(r[0]), teamSlugs),
    name: clean(r[0]),
    role_es: clean(r[1]),
    role_en: null,
    status: clean(r[2]),
    since: isoDate(r[3]),
    image_path: clean(r[4]) ? `/${clean(r[4])}` : null,
    linkedin_url: url(r[5]),
    twitter_url: url(r[6]),
    github_url: url(r[7]),
    sort_order: i,
  }));

// events
const eventRows = parseCSV(read('databases/Eventos historicos ethcali - historic.csv')).slice(1);
const eventSlugs = new Set();
const events = [];
const poaps = [];
const nfts = [];

for (const r of eventRows) {
  const [date, name, typeContent, typeEvent, hostColab, location, socialUrl,
         registration, rsvp, protocol, nftUrl, chainNft, mintsNft,
         poapLink, collectors, chainPoap, recap, photos, folder, youtube] = r;

  const starts_on = isoDate(date);
  const title = clean(name);
  if (!starts_on || !title) continue; // the sheet ends with a blank row

  const slug = uniqueSlug(slugify(title), eventSlugs);
  const kind = KIND[(clean(typeContent) ?? '').toLowerCase()] ?? 'other';
  const role = ROLE[(clean(typeEvent) ?? '').toLowerCase()] ?? 'colab';
  const [city, country] = CITY_OVERRIDE[slug] ?? ['Cali', 'Colombia'];

  const venueName = labelOf(location);
  const aliasSlug = venueName ? VENUE_ALIAS[venueName.toLowerCase()] : null;
  const venue = venueName
    ? venueBySlug.get(aliasSlug ?? slugify(venueName)) ?? matchVenue(venueName, venues)
    : null;

  const event = {
    slug,
    kind,
    role,
    scope: INTERNATIONAL.has(slug) ? 'international' : 'local',
    starts_on,
    ends_on: null,
    city,
    country,
    venue_slug: venue?.slug ?? null,
    location_url: urlOf(location),
    name_es: title,
    name_en: null,
    summary_es: null,
    summary_en: null,
    body_es: null,
    body_en: null,
    poster_path: null,
    luma_slug: clean(registration)?.match(/^https?:\/\/(?:www\.)?lu\.ma\/([A-Za-z0-9]+)/)?.[1] ?? null,
    registration_url: url(registration),
    rsvp_count: num(rsvp),
    social_url: url(socialUrl),
    recap_url: url(recap),
    photos_url: url(photos),
    drive_folder_url: url(folder),
    youtube_url: url(youtube),
    host_label: labelOf(hostColab),
    // Published by default: this is history that was already public on the old
    // site. Hiding it behind a draft flag would silently empty the timeline.
    is_published: true,
  };
  events.push(event);

  if (url(poapLink)) {
    poaps.push({ slug, poap_url: url(poapLink), chain: clean(chainPoap), collectors: num(collectors) });
  }
  if (url(nftUrl) || clean(protocol)) {
    nfts.push({ slug, protocol: clean(protocol), nft_url: url(nftUrl), chain: clean(chainNft), mints: num(mintsNft) });
  }
}

// Assets moved under public/ when the site became a Next.js app.
const manifest = JSON.parse(read('public/events/manifest.json'));
const posterStats = assignPosters(events, manifest);

// ── write ───────────────────────────────────────────────────────────────────

const header = `-- ETH Cali site content seed — GENERATED, do not edit by hand.
--
-- Source: ethcaliorg/databases/*.csv and ethcaliorg/public/events/manifest.json
-- Regenerate: node scripts/build-content-seed.mjs
-- Apply:      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed/site_content_seed.sql
--
-- Idempotent: parents conflict on slug, children on their (event_id, ...) unique
-- constraint. Verified by applying this file twice and comparing row counts.
-- Slugs are permanent public identifiers. Once this has run against production,
-- changing slugify() and regenerating would orphan every shared link — correct a
-- slug in the CMS instead.

begin;

`;

let sql = header;

sql += insert('venues',
  ['slug', 'name', 'kind', 'status', 'maps_url', 'lat', 'lng'],
  venues, 'on conflict (slug) do nothing');

sql += insert('team_members',
  ['slug', 'name', 'role_es', 'role_en', 'status', 'since', 'image_path',
   'linkedin_url', 'twitter_url', 'github_url', 'sort_order'],
  team, 'on conflict (slug) do nothing');

// venue_id is resolved by subquery so the seed never hardcodes an identity value.
const eventCols = ['slug', 'kind', 'role', 'scope', 'starts_on', 'ends_on', 'city', 'country',
  'location_url', 'name_es', 'poster_path', 'luma_slug', 'registration_url', 'rsvp_count',
  'social_url', 'recap_url', 'photos_url', 'drive_folder_url', 'youtube_url', 'is_published'];

sql += `insert into public.events (${eventCols.join(', ')}, venue_id) values\n`;
sql += events.map((e) =>
  `  (${eventCols.map((c) => lit(e[c])).join(', ')}, ` +
  `${e.venue_slug ? `(select id from public.venues where slug = ${lit(e.venue_slug)})` : 'null'})`
).join(',\n');
sql += '\non conflict (slug) do nothing;\n\n';

// Child rows join a VALUES list to events on slug, rather than one SELECT per row
// unioned together. The union form does not survive a NULL: Postgres types the
// column from the first branch, so a null protocol followed by an integer mints
// fails with "UNION types text and integer cannot be matched". A VALUES list has
// the same inference rule, hence the explicit casts on the first row — they fix
// the column types for every row after it.
for (const [table, rows, cols, types] of [
  ['event_poaps', poaps, ['poap_url', 'chain', 'collectors'], ['text', 'text', 'integer']],
  ['event_nfts', nfts, ['protocol', 'nft_url', 'chain', 'mints'], ['text', 'text', 'text', 'integer']],
]) {
  if (!rows.length) continue;
  sql += `insert into public.${table} (event_id, ${cols.join(', ')})\n`;
  sql += `select e.id, ${cols.map((c) => `v.${c}`).join(', ')}\n`;
  sql += 'from (values\n';
  sql += rows
    .map((r, i) => {
      const cells = cols.map((c, j) => (i === 0 ? `${lit(r[c])}::${types[j]}` : lit(r[c])));
      return `  (${lit(r.slug)}${i === 0 ? '::text' : ''}, ${cells.join(', ')})`;
    })
    .join(',\n');
  sql += `\n) as v(slug, ${cols.join(', ')})\n`;
  sql += 'join public.events e on e.slug = v.slug\n';
  sql += `on conflict on constraint ${table}_unique do nothing;\n\n`;
}

sql += 'commit;\n';

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, sql);

// ── report ──────────────────────────────────────────────────────────────────

const unmatchedEvents = events.filter((e) => !e.poster_path);
const withoutVenue = events.filter((e) => !e.venue_slug);

console.log(`venues        ${venues.length}`);
console.log(`team          ${team.length}`);
console.log(`events        ${events.length}  (${events.filter((e) => e.scope === 'international').length} international)`);
console.log(`  hackathons  ${events.filter((e) => e.kind === 'hackathon').length}`);
console.log(`poaps         ${poaps.length}`);
console.log(`nfts          ${nfts.length}`);
console.log(`posters       ${posterStats.assigned}/${posterStats.posters} assigned, ${unmatchedEvents.length} events without one`);
if (unmatchedEvents.length) {
  console.log(`\nEvents with no poster (expected — not every event has one):`);
  for (const e of unmatchedEvents) console.log(`  ${e.starts_on}  ${e.name_es}`);
}
if (withoutVenue.length) {
  console.log(`\nEvents whose venue did not match a venues.csv row (location_url is kept):`);
  for (const e of withoutVenue) console.log(`  ${e.starts_on}  ${e.name_es}`);
}
console.log(`\nwrote ${OUT}`);

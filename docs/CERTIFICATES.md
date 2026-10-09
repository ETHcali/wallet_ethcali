# Builder certificates — the process

One certificate per person per event: a row in `builder_certificates`, a PDF diploma,
a public credential page and a soulbound NFT on Ethereum mainnet (`BuilderCertificate`,
`frontend/addresses.json`). Builders get one per project; the team that made the event
happen gets one per role. The same five steps every event, in this order, and each
step is a separate action on purpose: nothing downstream happens by accident.

| # | Step | Where | Writes |
|---|------|-------|--------|
| 1 | Add people | `/admin/certificates` → **Team** (pick from the ethcali.org team) or **Add a person** (anyone), or SQL for a whole hackathon roster | one row per person: `event`, `role`, `project_*` (builders only), `member_name`, `email`, `emails`, `credential_id`; with "create wallet" on, also `wallet` + `claimed_at` |
| 2 | Builders claim | `/certificate`, `POST /api/certificates` | `wallet`, `claimed_at` |
| 3 | Pin | Pinata, from a session (no script yet) | `image_cid`, `pdf_cid`, `metadata_cid`, `planned_token_id` |
| 4 | Issue | `/admin/certificates` → **Emitir** | on chain: the mint; row: `token_id`, `issued_tx` (via `POST …/admin/confirm`) |
| 5 | Notify | `/admin/certificates` → **Enviar correo** | `notified_at` (via `POST …/admin/notify`) |

The chain decides steps 4 and 5's truth: a row is re-verifiable with
`tokenOfCredential(credential_id)` and `ownerOf(token_id)`.

## Before the event

1. Give the event its certificate settings. The event itself is ethcali.org's row in
   `events` (with its `venues` row); what the certificate says about it is one row in
   `certificate_events` — `key` (what `builder_certificates.event` holds), credential
   prefix, LinkedIn name, diploma headline, chapter, location and dates — and its
   sponsors are rows in `certificate_event_sponsors`, picked from `partners` in order.
   Each sponsor needs `partners.print_logo_path`: the logo as it reads on white paper
   (PNG; the site's artwork is for a dark page, so white parts get recoloured to ink),
   either a file under `public/certificates/logos/` or `ipfs://<cid>`.
   `lib/certificates/eventStore.ts` joins these into the `CertEvent` the diploma, the
   credential page, LinkedIn and the email all read. Nothing about an event is in code.
2. Add the people (step 1). One at a time from the admin page — name, email(s), role,
   a project for builders — which mints a credential id (`<credentialPrefix>-<8 chars>`)
   and, by default, finds or creates their ETH Cali wallet from the email, so the
   certificate can go straight to pin and issue. For a whole hackathon roster, SQL is
   still faster: `emails` must contain every address the builder used (Devfolio, Luma),
   lowercase; `credential_id` is `^[A-Z0-9]{2,16}-[A-Z0-9]{6,16}$` and permanent — it is
   the URL.

## Roles — builders and the team

`role` is what the certificate certifies. Everything role-specific is rendered from
`CERT_ROLES` in `lib/certificates/events.ts`; nothing else needs to know.

| `role` | Diploma heading | Line under the name | LinkedIn name |
|---|---|---|---|
| `builder` (default) | BUILDER CERTIFICATE | *built and shipped* **Project** | Builder at EAG Global Buildathon 2026 |
| `organizer` | CONTRIBUTOR CERTIFICATE | *contributed as* **Organizer** | Organizer at EAG Global Buildathon 2026 |
| `mentor` | CONTRIBUTOR CERTIFICATE | *contributed as* **Mentor** | Mentor at … |
| `judge` | CONTRIBUTOR CERTIFICATE | *contributed as* **Judge** | Judge at … |
| `volunteer` | CONTRIBUTOR CERTIFICATE | *contributed as* **Volunteer** | Volunteer at … |
| `speaker` | CONTRIBUTOR CERTIFICATE | *contributed as* **Speaker** | Speaker at … |

Rules the database enforces: a builder row has a project, a contributor row has none;
one certificate per `(event, project-or-role, email)`, so a person who built *and*
organized gets two certificates, two tokens, two credential ids. Same contract either
way — the collection on chain is "ETH Cali Builder Certificate", and the token's own
name, image and `Role` trait are what say organizer.

### The team has its own list

The people on ethcali.org's about page are `team_members` — public, read by the site
with the anon key and `select *`, so **nothing private may ever be added to that
table**. Their emails live beside it in `team_member_contacts`: RLS on, no policies,
no client grants, service role only. First filled from the "Intención de Core" form
responses (13 of 20 members, 2026-10-06); the rest are typed in from the admin.

`/admin/certificates` → **Team** lists every member with their private email (editable
inline, saved on blur), a role defaulted from their team status (Volunteer → volunteer,
everyone else → organizer), and the certificates they already hold for the chosen
event. Tick, **Add N to <event>**: one row per person, with their ETH Cali wallet,
linked back to the profile through `builder_certificates.team_member_id`. Someone who
already holds that role's certificate for the event cannot be added twice.

A contributor who is not on the team, step 1: **Add a person** with role Organizer, or in SQL:

```sql
insert into public.builder_certificates
  (event, role, member_name, email, emails, credential_id, issue_date)
values
  ('eag-cali-2026', 'organizer', 'Camila Rodríguez', 'camila@ethcali.org',
   array['camila@ethcali.org'], 'EAGCALI26-ORG7Q2ZX', current_date);
```

Then the same claim → pin → issue → notify. The pinned metadata differs in three
places: `name` is "Camila Rodríguez — Organizer · EAG Global Buildathon Cali 2026",
`description` says what they did (`achievementEn` in `events.ts` gives the sentence),
and the attributes carry `{"trait_type": "Role", "value": "Organizer"}` and no
`Project`. The admin page shows the role as a chip where a builder shows a project,
and counts the team separately.

## Claim window (step 2)

Send builders to `https://app.ethcali.org/certificate`. Signing in with any of their
emails is the whole proof; a builder without a wallet gets one from that sign-in. They
choose the wallet the NFT goes to and can change it until step 4. From here they can
already add the certificate to LinkedIn and download the diploma.

A person added with "create wallet" on already has a claim: their ETH Cali wallet,
tied to that email. They can still sign in and point the NFT at another wallet until
step 4; the wallet is theirs either way (Privy embedded, controlled by their login).

The admin page (`/admin/certificates`, needs `ADMIN_ROLE` on the contract) shows who
has claimed. **Do not pin or issue for a row without a wallet.**

## Pin (step 3)

For every claimed row: render the diploma, pin the PNG (the NFT image), the PDF and the
ERC-721 JSON (`tokenURI = ipfs://<metadata_cid>`), and reserve `planned_token_id` =
`totalIssued() + position` in the batch you intend to mint. The diploma prints its own
token id and a QR to it, so the reservation must be right before pinning, and the mint
must land exactly there (the Emitir button checks that on chain and refuses otherwise).

## Issue (step 4)

On `/admin/certificates`, with a wallet that holds `ADMIN_ROLE`, on Ethereum:

1. Filter **claimed**, select the rows in reserved-token order from the next id, no gaps.
2. **Emitir N NFTs**. Gas is sponsored. One `issue()` batch, up to 100.
3. The panel waits for the block, then the server reads the receipt and stamps each row.
   If that last call fails, the mint still happened: the error shows the tx hash. Re-post it:
   `POST /api/certificates/admin/confirm { txHash }` is idempotent.
4. Check a token on Etherscan / OpenSea before step 5. If a diploma is wrong, fix the
   row, re-pin, and use **Actualizar metadata** — the contract emits `MetadataUpdate`.

**Issuing sends no email.** That is the point of the split.

## Notify (step 5)

Same page. Email is off until `RESEND_API_KEY` and `EMAIL_FROM` are set on Vercel
(`lib/email/resend.ts`); the route answers 503 naming what is missing.

1. Filter **unsent**, select the rows.
2. **Prueba a <your email>** — the exact email, flagged `[Prueba]`, to your own inbox.
   Stamps nothing. Look at the attachment, the links, the honors.
3. **Revisar** — a dry run: who would get what. Nothing leaves.
4. **Enviar N correos**. One email per certificate, to every address the builder used,
   diploma PDF attached (Resend fetches `/api/certificates/<id>/pdf`), links to the
   credential page, LinkedIn, OpenSea and Etherscan. Each send stamps `notified_at`;
   a second click sends nothing. Resend's idempotency key
   (`certificate-issued/<credential_id>`) covers the 24h after a send whose stamp
   failed to land.

Only issued rows can be notified — the email names the token — and the database enforces
it (`notified_at` requires `issued_tx`).

## After

- The CSV export on the admin page carries `notified_at`, `token_id`, `issued_tx`.
- A builder who claims late: pin → issue → notify for that row alone, in that order.
- A bounced address shows up in the Resend dashboard, not here; correct `emails` on the
  row, clear `notified_at`, and send again.

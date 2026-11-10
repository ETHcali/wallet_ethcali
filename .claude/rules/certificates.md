---
paths:
  - "lib/certificates/**"
  - "lib/operatorAuth.ts"
  - "lib/email/**"
  - "lib/ipfsPin.ts"
  - "components/certificates/**"
  - "pages/certificate.tsx"
  - "pages/certificate/**"
  - "pages/api/certificates.ts"
  - "pages/api/certificates/**"
  - "pages/admin/certificates.tsx"
  - "pages/admin/team.tsx"
  - "pages/api/admin/team.ts"
  - "supabase/migrations/*certificate*"
  - "supabase/migrations/*team*"
  - "docs/CERTIFICATES.md"
---

# Certificates and the team

Operator runbook: `docs/CERTIFICATES.md`. This file is what code changes must respect.

## Model

- One row per person per event in `builder_certificates`; the NFT is `BuilderCertificate`
  (soulbound ERC-721, Ethereum mainnet). `role` is `builder` (has a project) or a team role —
  `organizer`, `mentor`, `judge`, `volunteer`, `speaker` (no project; the database enforces it).
  `CERT_ROLES` in `lib/certificates/events.ts` is the only place that knows how a role renders.
- **Nothing about an event is in code.** `certificate_events` (tied to ethcali.org's `events`)
  says what certificates print; `certificate_event_sponsors` picks `partners`, whose
  `print_logo_path` is the logo for white paper. `lib/certificates/eventStore.ts` joins them into
  the `CertEvent` every renderer takes as an argument. Never reintroduce a constant.
- **The team is two tables on purpose.** `team_members` is ethcali.org's about page, read with
  `select *` and the anon key — **any column added there is published**. Emails, Telegram and
  wallet live in `team_member_contacts` (RLS on, no policies, service role only). One editor:
  `/admin/team` → `GET/POST/PUT/DELETE /api/admin/team`, either ADMIN_ROLE (`lib/operatorAuth.ts`).

## Admin

`/admin/certificates` lists events; `?event=<key>&tab=event|team|builders|sponsors|certificate|mint|send`
is one event. Certificate routes gate on ADMIN_ROLE on BuilderCertificate, read on chain
(`lib/certificates/requireCertAdmin.ts`). The `admins` table plays no part.

## The flow — each step its own action

1. **Add**: Team tab or `POST …/admin/participants` (row, credential id, ETH Cali wallet from the
   email via Privy), or SQL + the person claims at `/certificate`.
2. **Prepare** (`POST …/admin/prepare`, one person per call, in order): reserves
   `planned_token_id` after `totalIssued()` and every reserved id — the diploma prints it — then
   renders the PDF and its 2924×2066 PNG on the server (`rasterize.ts`: pdfjs on `@napi-rs/canvas`,
   both in `serverExternalPackages`), pins PNG, PDF and the JSON (`metadata.ts`). Then
   `…/publish` calls `VERCEL_DEPLOY_HOOK_URL`.
3. **Mint**: IssuePanel, sponsored, in planned order; `…/confirm` stamps from the receipt.
4. **Send**: `…/notify`, minted rows only, once each (`notified_at`). Email off until
   `RESEND_API_KEY` + `EMAIL_FROM`; the route answers 503 naming what is missing.

## Things that have bitten

- **Credential pages are prerendered** (`fallback: false`; see CLAUDE.md "Rendering gotcha"). A
  certificate added after the last deploy 404s until a deploy lists it. `publish` exists for
  that, and `notify` refuses to email anyone whose page does not answer 200.
- **A sponsored mint can report an error and still land.** Privy's ERC-4337 relay said
  "execution reverted" on 2026-10-09 for a batch that minted tokens #30–#33. IssuePanel asks the
  chain (`…/sync`: tokenOfCredential, ownerOf vs the row's wallet, the CertificateIssued log)
  before showing any error. Never trust the client's view of whether a mint happened.
- **Pinned diplomas do not follow edits.** Changing event settings or sponsors changes new
  renders; a minted token's image changes only by re-preparing and "Actualizar metadata".
- A re-render of an existing diploma must match the pinned one. When touching `diploma.ts` or
  the event data, render a Buildathon diploma before and after and compare (pdftoppm).

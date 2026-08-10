# Hackathon Staking — Architecture & Goal

Status: **specification, not implemented.** Written for the agent that builds this module.

**Target event:** *Road to ShanHaiWoo Pop-up City* hackathon, **Cali, Sep 5–6, 2026**.
Originally scheduled for Aug 15–16 and **rescheduled** to align with the **EAG Ethereum Builders Tour** stop in Cali. Co-hosted by **ETH Cali × ShanHaiWoo × Ethereum Applications Guild**. Tracks: Ethereum, Applied AI, Open Hardware, with EAG framing the stop around real-world Ethereum applications.

Any date, headcount or deadline inherited from the August planning documents is stale — treat Sep 5–6 as authoritative.

---

## 1. Goal

Replace free RSVP with a **commitment stake**. A builder puts up a refundable deposit to sign up. The stake does three jobs at once:

1. **Signs the builder up** — registration is the stake transaction. No stake, no seat.
2. **Grants access** — the on-chain registration is the credential checked at the door and used to gate submissions.
3. **Backs their delivery** — the stake returns when the builder actually delivers a submission. It is forfeited when they take a seat and disappear.

The problem being solved is no-shows. Free registration in this ecosystem routinely converts at 30–50%, which wrecks catering, merch counts and the credibility of the attendee number promised to sponsors. A refundable deposit filters for intent without filtering for wealth, provided the amount stays small.

**Non-goal:** this is not ticketing and not a fundraise. The stake is a returnable bond. Nothing in this module should treat staked funds as revenue.

### The prize this feeds

Winners of this hackathon receive the **ShanHaiWoo scholarship**: up to two people get a fully-hosted 30-day immersion in the ShanHaiWoo Pop-up City across Shenzhen and Hong Kong (Oct → mid-Nov 2026), accommodation covered by the host, airfare partially covered.

That raises the stakes on identity in both directions. The prize is valuable enough to attract sybils, which is why `requirePersonhood` should be **on** for this event — `ZKPassportNFT` is already deployed on Base, Ethereum, Optimism and Unichain. And because the scholarship carries hard eligibility conditions (English B2/C1, demonstrated Web3/AI/hardware skill, proof of financial self-sufficiency, visa obtainable in time), **winner selection stays off-chain and human**. This module's job stops at producing a trustworthy, deduplicated, consented record of who registered, who showed up, and who delivered what. Do not encode prize allocation in the contract.

### Success criteria

- A builder can register, check in, submit, and get their stake back without contacting an organizer.
- An organizer can see the live registrant count, cap it, check people in, review submissions, and settle refunds from the admin page.
- Forfeited stakes have one clearly-stated destination, decided before registration opens (see §7).
- Registration captures the three legal consents in a way that is provable afterwards (§6).

---

## 2. Where this fits in the existing app

This module reuses patterns already in the codebase rather than inventing new ones.

| Need | Existing precedent to follow |
|---|---|
| Admin-managed entity with CRUD | `FaucetManager` vaults · `Swag1155` variants |
| Pay-then-redeem lifecycle | `Swag1155` `buy` → `redeem` |
| Personhood / token gating | `FaucetManager` vault gating + `ZKPassportNFT` |
| QR check-in at a physical event | `components/swag/AdminQRScanner.tsx` |
| Off-chain metadata | `/api/pinata/pin-json`, `lib/` Pinata integration |
| User page + separate admin page | `pages/swag/index.tsx` + `pages/swag/admin.tsx` |
| Sponsored gas | Privy `useSendTransaction` with `{ sponsor: true }` |

The builder-facing view should feel like the existing swag store: a card for the event, a clear primary action, and a panel showing personal status. Same dark palette (`bg-slate-900`, `border-slate-700`, accents `cyan-400` / `green-400`).

---

## 3. Contract: `BuildathonStaking`

One contract, many events. Deployed per-chain like the others, address recorded in `frontend/addresses.json`, ABI in `frontend/abis/`.

### Entities

```
Event {
  id                  uint256
  metadataURI         string      // IPFS: name, description, venue, schedule, doc version hashes
  stakeToken          address     // USDC
  stakeAmount         uint256     // 6 decimals
  capacity            uint32      // 0 = uncapped
  registered          uint32
  registrationOpens   uint64
  registrationCloses  uint64
  withdrawDeadline    uint64      // free-exit cutoff (§4)
  submissionDeadline  uint64
  gating              Gating
  forfeitSink         address     // where forfeited stakes go (§7)
  state               EventState  // Draft | Open | Live | Settling | Closed | Cancelled
}

Gating {
  requirePersonhood   bool        // ZKPassportNFT held by msg.sender
  gateToken           address     // optional ERC-20/721 gate, address(0) = none
  gateMinBalance      uint256
}

Registration {
  builder             address
  eventId             uint256
  amount              uint256     // recorded, not read from Event — stake amount can change for later registrants
  consentHash         bytes32     // §6
  registeredAt        uint64
  status              RegStatus
}

Submission {
  eventId             uint256
  builder             address     // team lead; teammates listed in the metadata
  submissionURI       string      // IPFS: repo, demo, deck, team
  submittedAt         uint64
}
```

```
RegStatus: None | Registered | CheckedIn | Submitted | Delivered | Refunded | Forfeited | Withdrawn
```

`Delivered` is set by an organizer confirming the submission is real. It is deliberately separate from `Submitted` so an empty repo pushed at 16:59 does not automatically earn a refund. Keep the bar low and publish it — "a submission the judges can open and run" — this is anti-fraud, not a quality gate.

### Functions

**Admin (organizer role — do not rely on a single EOA, use the admin pattern already in `useContractAdmin`)**

```
createEvent(EventParams)                      → uint256 eventId
updateEvent(uint256 id, EventParams)          // Draft/Open only
setGating(uint256 id, Gating)
setState(uint256 id, EventState)
checkIn(uint256 id, address[] builders)       // batched, QR scanner calls this
markDelivered(uint256 id, address[] builders, bool delivered)
sweepForfeited(uint256 id)                    // after settlement window
cancelEvent(uint256 id)                       // → every registrant may claim full refund
```

**Builder**

```
register(uint256 id, bytes32 consentHash)     // pulls stakeAmount, enforces cap + gating + window
withdraw(uint256 id)                          // full refund, only before withdrawDeadline
submit(uint256 id, string submissionURI)      // only if Registered/CheckedIn, before submissionDeadline
claimStake(uint256 id)                        // pull-based refund once status == Delivered
```

**Views**

```
getEvent(id) · getRegistration(id, builder) · getSubmission(id, builder)
registrantsOf(id) → address[]                 // paginate if capacity can exceed ~500
remainingCapacity(id) · isEligible(id, builder) → (bool, reason)
```

### Design rules

- **Pull-based refunds.** `claimStake` is called by the builder. Never loop-and-push refunds — one reverting recipient must not be able to brick settlement for everyone.
- **Record `amount` on the Registration**, not just on the Event. If the stake amount is ever edited, earlier registrants must be refunded what they actually paid.
- **Checks-effects-interactions** on every function that moves tokens; `nonReentrant` on `register`, `withdraw`, `claimStake`.
- **Cap enforced on-chain.** `registered < capacity` is checked in `register`. This is what makes the attendee number trustworthy for catering and sponsors.
- **`cancelEvent` is unconditional refund.** If the event is called off, no forfeiture logic runs.
- Emit events for everything (`Registered`, `Withdrawn`, `CheckedIn`, `Submitted`, `Delivered`, `Claimed`, `Forfeited`) — the admin UI reads history from logs, as `useSerialMinted` and `useAllMintedNFTs` already do.

---

## 4. Lifecycle

```
                    ┌── withdraw() before withdrawDeadline ──→ Withdrawn (full refund)
                    │
register() ──→ Registered ──checkIn()──→ CheckedIn ──submit()──→ Submitted
                    │                                                │
                    │                                        markDelivered()
                    │                                                │
                    └────── no submission by deadline ───→ Forfeited ┴──→ Delivered ──claimStake()──→ Refunded
```

**The withdraw window matters more than it looks.** A builder who realises on Sep 2 that they cannot come should be able to exit cleanly and free their seat for the waitlist. Suggested `withdrawDeadline`: 72h before the event. Past that, the seat is consumed and catering is ordered, so forfeiture is fair. Say this plainly on the registration page.

**Check-in is not optional in the flow.** Someone who never showed up but pushes a repo remotely should not be refunded from a fund whose purpose is to punish no-shows. `markDelivered` should require `CheckedIn`.

---

## 5. Frontend

```
pages/hackathon/index.tsx        builder view
pages/hackathon/admin.tsx        organizer view

components/hackathon/
  EventCard.tsx                  event summary, dates, stake amount, seats left
  EligibilityGate.tsx            personhood / token gate status, links to /sybil if missing
  RegisterModal.tsx              consent checkboxes + approve/permit + register
  MyRegistrationPanel.tsx        status, countdowns, withdraw, claim refund
  SubmissionForm.tsx             repo URL, demo URL, deck, team members → pin → submit
  AdminEventForm.tsx             create/edit event
  AdminRegistrantList.tsx        table + CSV export, filter by status
  AdminCheckInScanner.tsx        wrap the existing swag QR scanner
  AdminSubmissionReview.tsx      open submissions, mark delivered, batch settle

hooks/hackathon/
  index.ts                       barrel — keep updated
  useEventQueries.ts             useEvent, useEvents, useRemainingCapacity, useEligibility
  useRegistration.ts             useMyRegistration, useRegister, useWithdraw, useClaimStake
  useSubmission.ts               useMySubmission, useSubmit
  useAdminEvent.ts               useCreateEvent, useUpdateEvent, useSetState
  useAdminSettlement.ts          useCheckIn, useMarkDelivered, useSweepForfeited
  useRegistrants.ts              log-derived registrant list

types/hackathon.ts               Event, Registration, Submission, RegStatus, EventState, Gating
```

Reads via `useQuery` + `createPublicClient().readContract()`. Writes via Privy `useSendTransaction` + `encodeFunctionData`, always `{ sponsor: true }`. Invalidate the event and registration query keys after every mutation.

### The two-transaction problem

`register` needs USDC allowance first. Two sponsored transactions in a row is a poor first-touch experience for a builder who may be new to this.

**Use EIP-2612 `permit`.** USDC on Base supports it. Sign the permit off-chain, pass `(value, deadline, v, r, s)` into a `registerWithPermit(...)` overload, and registration becomes a single transaction with no approval step. Implement `register` as well for wallets that cannot sign typed data, but make permit the default path.

---

## 6. Consent capture — read this before building `RegisterModal`

Three legal instruments already exist as drafts (ETH Cali Drive → `Legal`). They must be accepted **at the moment of registration** — the waiver explicitly permits electronic acceptance.

| Document | In the form | Why |
|---|---|---|
| Términos, Condiciones y Waiver | **Required** checkbox | Participation terms, IP, liability |
| Consentimiento Opt-In CVs (Ley 1581) | **Separate, genuinely optional** checkbox | Consent must be free and express — it cannot be bundled with the required terms, and registration must succeed when it is left unchecked |
| Autorización de Derechos de Imagen | **Separate** checkbox | Photo/video, sponsor reports |

Add a fourth line for the **staking terms** themselves: what triggers forfeiture, where forfeited funds go, and the withdraw deadline. Do not bury this in the general T&C.

**`consentHash`** = `keccak256(abi.encode(termsVersionCID, cvOptIn, imageRightsOptIn, builderAddress, timestamp))`, recorded on-chain at registration. That makes acceptance provable and version-pinned without publishing anything personal.

> **Do not put CVs or personal data on IPFS.** IPFS is public and effectively permanent; Ley 1581 gives the holder a right of *supresión* (deletion) that cannot be honoured on IPFS. On-chain and IPFS get the consent hash and the event metadata only. CVs go to a private, deletable store, keyed by wallet address, with the opt-in flag governing whether a given record may be handed to a sponsor. The handover itself is papered by `5. Acta de Entrega de CVs a Sponsors`.

Submission metadata (repo URL, demo, deck, team handles) is fine on IPFS — it is project data, published deliberately.

---

## 7. Decisions required before implementation

These are product and legal calls, not engineering ones. The build should not start on the contract until §7.1–§7.3 are answered.

**7.1 Stake asset and amount.** Recommend **USDC on Base** — matches `Swag1155`'s USDC/6-decimal convention, Base is the default chain, and a stablecoin keeps the refund equal to the deposit. Amount should hurt slightly and exclude nobody: **10–25 USDC**. Anything above ~$50 starts selecting for wealth rather than intent, which is the opposite of a builders-tour goal.

**7.2 Where do forfeited stakes go?** Pick one and publish it:

- **Prize pool of the same event** *(recommended)* — no-shows fund the builders who delivered. Clean narrative, no treasury-enrichment optics, and it makes the incentive legible.
- ETH Cali treasury — simplest, but "organizer keeps the deposits" is a bad look and invites accusations if the delivery bar is subjective.
- Pro-rata redistribution to delivering builders — fairest in theory, gas-heavy and hard to explain.

**7.3 Who holds the organizer role?** A single EOA holding refund authority for every registrant's deposit is a real custody risk. Use a multisig, or at minimum a role separate from the deployer.

**7.4 Waitlist.** When the cap fills, do withdrawn seats reopen automatically (first-come) or by invitation? Automatic is simpler; state it.

**7.5 Teams.** Does the stake bind an individual or a team? Recommend **individual stakes, team-tagged submissions** — one person's flake shouldn't burn four deposits.

**7.6 Fallback for builders with no USDC.** A builder invited to their first Ethereum event may hold nothing. Options: an organizer-funded allowlist that skips the stake, or a faucet top-up. The `FaucetManager` is already deployed and could seed a small amount. Do not let the stake become a barrier to the exact people the tour exists to find.

---

## 8. Build order

1. Answer §7.1–§7.3.
2. Contract + tests, focusing on: cap enforcement, the withdraw window boundary, double-registration, reentrancy on `claimStake`, and `cancelEvent` refunding everyone.
3. Deploy to Base testnet, drop the ABI in `frontend/abis/`, address in `frontend/addresses.json`.
4. `types/hackathon.ts` + read hooks + `EventCard` — read-only page first, verify against the deployed event.
5. `RegisterModal` with permit + consent, then `MyRegistrationPanel`.
6. `SubmissionForm` with Pinata pinning.
7. Admin: event form → registrant list → QR check-in → submission review → settlement.
8. Mainnet deploy, then open registration.

Run `npm run typecheck` after every change — strict mode with `noUnusedLocals` and `noUnusedParameters` is on.

---

## 9. Timeline

The event is **Sep 5–6, 2026** — 27 days out as of Aug 9. The reschedule from Aug 15–16 bought exactly the runway this module needs; it did not exist before.

Working backwards:

| By | What |
|---|---|
| **Aug 13** | §7.1–§7.3 answered (stake asset/amount, forfeit sink, organizer role) |
| **Aug 20** | Contract written, tested, deployed to Base testnet; ABI + address committed |
| **Aug 24** | Builder-facing page live on testnet — register, submit, claim all working end-to-end |
| **Aug 27** | Mainnet deploy, **registration opens** |
| Aug 27 → Sep 4 | Promotion window (the marketing copy is already written and waiting on a URL) |
| **Sep 2** | Suggested `withdrawDeadline` — 72h before, seat freed for waitlist |
| **Sep 5–6** | Event: QR check-in, submissions, delivery marking |
| Sep 8+ | Settlement: refunds claimable, forfeited stakes swept |

If the contract slips past ~Aug 27, ship the read-only event page plus a non-staking registration path and add staking after. A page that collects registrations beats a perfect staking flow that lands on Sep 4.

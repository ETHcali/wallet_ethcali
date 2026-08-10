/**
 * Hackathon staking types.
 *
 * Shared vocabulary between the BuildathonStaking contract and the UI.
 * See docs/HACKATHON_STAKING_ARCHITECTURE.md — struct and enum ordering here
 * is the intended contract layout; keep the two in sync.
 */

export enum EventState {
  Draft = 0,
  Open = 1,
  Live = 2,
  Settling = 3,
  Closed = 4,
  Cancelled = 5,
}

export enum RegStatus {
  None = 0,
  Registered = 1,
  CheckedIn = 2,
  Submitted = 3,
  Delivered = 4,
  Refunded = 5,
  Forfeited = 6,
  Withdrawn = 7,
}

/** Optional access gating, mirroring the FaucetManager vault gating pattern. */
export interface Gating {
  /** Require the caller to hold a ZKPassportNFT (sybil resistance). */
  requirePersonhood: boolean;
  /** Optional ERC-20/721 gate. Zero address means no token gate. */
  gateToken: string;
  gateMinBalance: bigint;
}

export interface HackathonEvent {
  id: bigint;
  /** IPFS URI: name, description, venue, schedule, legal document version hashes. */
  metadataURI: string;
  /** Stake asset. USDC (6 decimals). */
  stakeToken: string;
  stakeAmount: bigint;
  /** 0 means uncapped. */
  capacity: number;
  registered: number;
  registrationOpens: bigint;
  registrationCloses: bigint;
  /** Free-exit cutoff. Withdrawing before this returns the full stake. */
  withdrawDeadline: bigint;
  submissionDeadline: bigint;
  gating: Gating;
  /** Destination for forfeited stakes. */
  forfeitSink: string;
  state: EventState;
}

export interface Registration {
  builder: string;
  eventId: bigint;
  /** Recorded per registration — the event stake amount may change for later registrants. */
  amount: bigint;
  /** keccak256 of the accepted document versions and opt-in flags. See architecture doc §6. */
  consentHash: string;
  registeredAt: bigint;
  status: RegStatus;
}

export interface Submission {
  eventId: bigint;
  /** Team lead. Teammates are listed in the submission metadata. */
  builder: string;
  /** IPFS URI: repo, demo, deck, team. */
  submissionURI: string;
  submittedAt: bigint;
}

/** Off-chain metadata pinned for a submission. Project data only — never personal data. */
export interface SubmissionMetadata {
  projectName: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  deckUrl?: string;
  track?: 'Ethereum' | 'AI' | 'Open Hardware';
  teamMembers: string[];
}

/**
 * Consent captured at registration. Hashed into Registration.consentHash.
 *
 * The CV opt-in must remain independently optional — under Ley 1581 de 2012
 * consent has to be free and express, so registration must succeed with it unchecked.
 */
export interface ConsentRecord {
  /** IPFS CID of the terms bundle the builder accepted, pinning the version. */
  termsVersionCid: string;
  /** Required: Términos, Condiciones y Waiver + staking terms. */
  acceptedTerms: boolean;
  /** Optional: Consentimiento Opt-In CVs. */
  cvOptIn: boolean;
  /** Optional: Autorización de Derechos de Imagen. */
  imageRightsOptIn: boolean;
  builderAddress: string;
  timestamp: number;
}

/** Result of an eligibility check, for rendering the gate before a builder attempts to register. */
export interface EligibilityResult {
  eligible: boolean;
  /** Human-readable reason when ineligible: missing personhood, gate token, cap full, window closed. */
  reason?: string;
}

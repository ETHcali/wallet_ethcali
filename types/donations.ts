/**
 * Types for the DonationVault module.
 *
 * Amounts are always raw base units (bigint) end to end. They are converted for
 * display exactly once, at the render boundary, using the token's OWN decimals.
 * USDC is 6 and COPm is 18 — a hardcoded 18 would show a COPm donor a figure
 * 10^12 too large.
 */

/** Display currency the user has selected for totals. */
export type DisplayCurrency = 'USD' | 'COP' | 'ETH';

export interface DonationToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  /** CoinGecko id used to price this token. Null for a token we cannot price. */
  coingeckoId: string | null;
  /** True for the chain's native token (routed via the ETH_TOKEN sentinel). */
  isNative: boolean;
}

/** Mirrors DonationVault.Campaign. */
export interface Campaign {
  id: number;
  name: string;
  description: string;
  beneficiary: string;
  receiptCollection: string;
  donorCount: number;
  donationCount: number;
  active: boolean;
  /** true = router mode: funds go straight to the beneficiary Safe. */
  autoForward: boolean;
  createdAt: number;
}

/** Mirrors DonationVault.Tier — thresholds are per token. */
export interface DonationTier {
  minAmount: bigint;
  receiptTokenId: number;
}

/** One accepted currency for a campaign, with its running total. */
export interface CampaignTokenTotal {
  token: DonationToken;
  /** Cumulative raised, raw base units. Never decreases. */
  raised: bigint;
  /** Raised minus withdrawn. In router mode this stays ~0 by design. */
  available: bigint;
}

export interface DonorEntry {
  donor: string;
  /** Cumulative donated by this address, in the queried token. */
  amount: bigint;
  ensName?: string | null;
  ensAvatar?: string | null;
  message?: string | null;
  txHash?: string | null;
  blockTime?: string | null;
}

/** The four-state action flow every onchain button must implement. */
export type DonateStep =
  | 'connect'        // wallet not connected
  | 'switch-network' // connected, wrong chain
  | 'approve'        // ERC-20 needs allowance
  | 'donate'         // ready to send
  | 'unavailable';   // no vault deployed / campaign closed

export interface BeneficiaryProfile {
  address: string;
  ensName: string;
  avatar: string | null;
  url: string | null;
  /** Safe signing threshold, e.g. 3 — null when not a Safe or unreadable. */
  threshold: number | null;
  /** Number of Safe owners, e.g. 5. */
  ownerCount: number | null;
}

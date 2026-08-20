/**
 * Translate DonationVault reverts into something a donor can act on.
 *
 * The contracts use custom errors, so a raw failure surfaces as a bare selector
 * like `0x8f4eb604`. Showing that to someone trying to donate to earthquake
 * relief is not acceptable — every failure below maps to a plain sentence.
 */

/** Custom errors from DonationVault + DonationReceipt1155, and OpenZeppelin's. */
const ERROR_MESSAGES: Record<string, string> = {
  // ── DonationVault ────────────────────────────────────────────────────────
  CampaignDoesNotExist: 'This campaign no longer exists.',
  CampaignNotActive: 'This campaign has stopped accepting donations.',
  TokenNotAccepted: 'This campaign does not accept that currency.',
  ZeroAmount: 'Enter an amount greater than zero.',
  EthNotAccepted: 'Do not send ETH with a token donation.',
  IncorrectEthAmount: 'The amount sent did not match the amount entered. Please try again.',
  InsufficientBalance: 'The campaign does not hold enough to cover that withdrawal.',
  EthTransferFailed: 'The transfer could not be completed. Please try again.',
  DirectEthNotAccepted:
    'A donation has to be sent through the campaign, not directly to the contract.',
  InvalidBeneficiary: 'That recipient address is not valid.',
  InvalidToken: 'That token address is not valid.',
  EmptyName: 'The campaign needs a name.',
  TiersNotAscending: 'Reward tiers must be listed from smallest to largest amount.',

  // ── DonationReceipt1155 ──────────────────────────────────────────────────
  Soulbound: 'Donation receipts cannot be transferred.',
  TierNotActive: 'That reward tier is not available.',
  TierHasSupply: 'That tier has already been issued and cannot be removed.',
  EmptyURI: 'The tier is missing its metadata link.',
  InvalidRecipient: 'That recipient address is not valid.',

  // ── OpenZeppelin ─────────────────────────────────────────────────────────
  EnforcedPause: 'Donations are paused right now. Please try again shortly.',
  AccessControlUnauthorizedAccount: 'This wallet is not authorised to do that.',
};

/** Wallet / RPC level failures, matched on message text. */
const WALLET_PATTERNS: Array<[RegExp, string]> = [
  [/user rejected|user denied|rejected the request/i, 'You cancelled the transaction.'],
  [/insufficient funds/i, 'Not enough balance to cover the amount plus gas.'],
  [/transfer amount exceeds balance/i, 'Not enough balance for that amount.'],
  [/insufficient allowance|exceeds allowance/i, 'Approve the token first, then donate.'],
  [/nonce too low|already known/i, 'That transaction was already submitted.'],
  [/gas required exceeds|out of gas/i, 'The transaction ran out of gas.'],
  [/network|fetch failed|timeout/i, 'Network problem reaching the blockchain. Please retry.'],
];

/**
 * Extract a donor-facing message from any thrown value.
 * Falls back to a safe generic rather than leaking a selector or a stack.
 */
export function parseDonationError(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';

  const raw =
    error instanceof Error
      ? `${error.message} ${(error as { shortMessage?: string }).shortMessage ?? ''}`
      : String(error);

  // Custom errors surface by name in viem's decoded message.
  for (const [name, message] of Object.entries(ERROR_MESSAGES)) {
    if (raw.includes(name)) return message;
  }

  for (const [pattern, message] of WALLET_PATTERNS) {
    if (pattern.test(raw)) return message;
  }

  // Contract revert strings (HackathonStaking and older contracts use these).
  const revertString = raw.match(/reverted with reason string ['"](.+?)['"]/);
  if (revertString?.[1]) {
    const reason = revertString[1].replace(/^[A-Za-z0-9]+:\s*/, '');
    return reason.charAt(0).toUpperCase() + reason.slice(1);
  }

  return 'The transaction could not be completed. Please try again.';
}

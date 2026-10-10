/**
 * One sentence for any failed admin write, never a selector or a stack.
 *
 * viem names a decoded custom error (`VaultNotActive`) or carries the revert
 * reason string; either becomes a sentence here. Everything else (wallet
 * rejections, gas, network, OpenZeppelin's own errors) goes through the
 * donation translator, which already covers those and ends in a safe generic.
 */
import { BaseError, ContractFunctionRevertedError } from 'viem';
import { parseDonationError } from './donationErrors';

/** `VaultNotActive` → "Vault not active." */
function sentence(name: string): string {
  const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}.`;
}

/** Names OpenZeppelin and the wallet layer already have better words for. */
const DEFER = new Set(['EnforcedPause', 'AccessControlUnauthorizedAccount', 'OwnableUnauthorizedAccount']);

export function adminErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name === 'OwnableUnauthorizedAccount') return 'Only the contract owner can do that.';
      if (name && name !== 'Error' && !DEFER.has(name)) return sentence(name);
      if (reverted.reason) return `${reverted.reason.charAt(0).toUpperCase()}${reverted.reason.slice(1)}`;
    }
  }
  return parseDonationError(error);
}

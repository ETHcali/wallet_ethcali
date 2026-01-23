/**
 * Explorer URL utilities
 * Centralized functions for generating blockchain explorer URLs
 */
import { EXPLORER_URLS, CHAIN_IDS, isSupportedChain } from '../config/constants';

/**
 * Get the base explorer URL for a chain
 */
export function getExplorerBaseUrl(chainId: number): string {
  if (isSupportedChain(chainId)) {
    return EXPLORER_URLS[chainId];
  }
  return EXPLORER_URLS[CHAIN_IDS.BASE]; // Default to Base
}

/**
 * Get transaction URL for a specific chain
 */
export function getTxUrl(chainId: number, txHash: string): string {
  const baseUrl = getExplorerBaseUrl(chainId);
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get address URL for a specific chain
 */
export function getAddressUrl(chainId: number, address: string): string {
  const baseUrl = getExplorerBaseUrl(chainId);
  return `${baseUrl}/address/${address}`;
}

/**
 * Get token URL for a specific chain
 */
export function getTokenUrl(chainId: number, tokenAddress: string): string {
  const baseUrl = getExplorerBaseUrl(chainId);
  return `${baseUrl}/token/${tokenAddress}`;
}

/**
 * Get block URL for a specific chain
 */
export function getBlockUrl(chainId: number, blockNumber: number): string {
  const baseUrl = getExplorerBaseUrl(chainId);
  return `${baseUrl}/block/${blockNumber}`;
}

/**
 * @deprecated Use getExplorerBaseUrl instead
 * Legacy function for backward compatibility
 */
export function getExplorerUrl(chainId: number, txHash?: string): string {
  if (txHash) {
    return getTxUrl(chainId, txHash);
  }
  return getExplorerBaseUrl(chainId);
}

/**
 * @deprecated Use getAddressUrl instead
 * Legacy function for backward compatibility
 */
export function getAddressExplorerUrl(chainId: number, address: string): string {
  return getAddressUrl(chainId, address);
}

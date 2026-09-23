/**
 * LI.FI API integration for same-chain swaps.
 * API Docs: https://docs.li.fi/
 *
 * The token list per chain is the registry's: the native coin plus the
 * ERC-20s in `config/chains.ts`. A chain without `features.swap` has no list,
 * and the Swap button is hidden for it.
 */
import { getChain, NATIVE_TOKEN_SENTINEL } from '../config/chains';
import { getTokenLogoUrl } from '../utils/tokenUtils';

const LIFI_API_BASE = 'https://li.quest/v1';

/** LI.FI uses the same 0xEeee… sentinel for the native coin as our contracts. */
export const NATIVE_TOKEN_ADDRESS = NATIVE_TOKEN_SENTINEL;

export interface LiFiToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
  priceUSD?: string;
}

export interface LiFiQuoteRequest {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  slippage?: number;
}

export interface LiFiTransactionRequest {
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
  gasPrice?: string;
  chainId: number;
}

export interface LiFiQuoteResponse {
  id: string;
  type: string;
  tool: string;
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: LiFiToken;
    toToken: LiFiToken;
    fromAmount: string;
    slippage: number;
    fromAddress: string;
    toAddress: string;
  };
  estimate: {
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    approvalAddress: string;
    executionDuration: number;
    feeCosts?: Array<{
      name: string;
      amount: string;
      token: LiFiToken;
      amountUSD?: string;
    }>;
    gasCosts?: Array<{
      type: string;
      amount: string;
      token: LiFiToken;
      amountUSD?: string;
    }>;
  };
  transactionRequest: LiFiTransactionRequest;
}

/** Get a quote for a token swap. */
export async function getQuote(params: LiFiQuoteRequest): Promise<LiFiQuoteResponse> {
  const searchParams = new URLSearchParams({
    fromChain: params.fromChain.toString(),
    toChain: params.toChain.toString(),
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.fromAmount,
    fromAddress: params.fromAddress,
    slippage: (params.slippage ?? 0.03).toString(),
  });

  const response = await fetch(`${LIFI_API_BASE}/quote?${searchParams}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get quote' }));
    throw new Error(error.message || `Quote failed: ${response.status}`);
  }

  return response.json();
}

export interface SwapToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

/**
 * The tokens the swap UI offers: native first, then the registry's ERC-20s.
 * Empty for a chain the registry does not know, so callers can hide the button
 * instead of quoting into the void.
 */
export function getSwapTokens(chainId: number): SwapToken[] {
  const chain = getChain(chainId);
  if (!chain) return [];

  return [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: chain.nativeSymbol,
      name: chain.nativeName,
      decimals: 18,
      logoURI: getTokenLogoUrl(chain.nativeSymbol),
    },
    ...chain.tokens.map((t) => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      logoURI: getTokenLogoUrl(t.symbol),
    })),
  ];
}

/** Format token amount from smallest unit to display value. */
export function formatTokenAmount(amount: string, decimals: number): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === 0n) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '').slice(0, 6);

  return `${integerPart}.${trimmedFractional}`;
}

/** Parse token amount from display value to smallest unit. */
export function parseTokenAmount(amount: string, decimals: number): string {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const combined = integerPart + paddedFractional;
  return BigInt(combined).toString();
}

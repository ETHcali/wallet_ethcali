/**
 * LiFi API integration for cross-chain and on-chain swaps
 * API Docs: https://docs.li.fi/
 */

const LIFI_API_BASE = 'https://li.quest/v1';

// Native ETH address used by LiFi
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

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

export interface LiFiTokensResponse {
  tokens: Record<string, LiFiToken[]>;
}

/**
 * Get a quote for a token swap
 */
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

/**
 * Get available tokens for a chain
 */
export async function getTokens(chainId: number): Promise<LiFiToken[]> {
  const response = await fetch(`${LIFI_API_BASE}/tokens?chains=${chainId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch tokens');
  }

  const data: LiFiTokensResponse = await response.json();
  return data.tokens[chainId.toString()] || [];
}

/**
 * Get popular tokens for swap UI (subset of all tokens)
 */
export function getPopularTokens(chainId: number): Array<{ address: string; symbol: string; name: string; decimals: number; logoURI?: string }> {
  // Common tokens across chains
  const tokens: Record<number, Array<{ address: string; symbol: string; name: string; decimals: number; logoURI?: string }>> = {
    // Base
    8453: [
      { address: NATIVE_TOKEN_ADDRESS, symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
      { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
      { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', symbol: 'USDT', name: 'Tether USD', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
      { address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', symbol: 'EURC', name: 'Euro Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/26045/small/euro-coin.png' },
      { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png' },
      { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png' },
    ],
    // Optimism
    10: [
      { address: NATIVE_TOKEN_ADDRESS, symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
      { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
      { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', name: 'Tether USD', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
      { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png' },
      { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png' },
    ],
    // Mainnet
    1: [
      { address: NATIVE_TOKEN_ADDRESS, symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
      { address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', symbol: 'EURC', name: 'Euro Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/26045/small/euro-coin.png' },
      { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png' },
      { address: '0x6B175474E89094C44Da98b954EesddFD6103eEf', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png' },
    ],
  };

  return tokens[chainId] || tokens[8453]; // Default to Base
}

/**
 * Format token amount from smallest unit to display value
 */
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

/**
 * Parse token amount from display value to smallest unit
 */
export function parseTokenAmount(amount: string, decimals: number): string {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const combined = integerPart + paddedFractional;
  return BigInt(combined).toString();
}


// CoinGecko IDs for tokens
export const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  USDC: 'usd-coin',
  EURC: 'euro-coin',
  USDT: 'tether'
};

// Base URL for CoinGecko images
const COINGECKO_IMAGE_URL = 'https://assets.coingecko.com/coins/images';

// Fallback images in case CoinGecko fails
const FALLBACK_IMAGES: Record<string, string> = {
  ETH: '/images/ethereum.png',
  USDC: '/images/usdc.png',
  EURC: '/images/eurc.png',
  USDT: '/images/usdt.png',
  DEFAULT: '/images/token-default.png'
};

/**
 * Get token logo URL from CoinGecko
 * @param tokenSymbol The token symbol (ETH, USDC, EURC)
 * @returns The URL to the token logo
 */
export function getTokenLogoUrl(tokenSymbol: string): string {
  const symbol = tokenSymbol.toUpperCase();

  switch (symbol) {
    case 'ETH':
      return `${COINGECKO_IMAGE_URL}/279/large/ethereum.png`;
    case 'USDC':
      return `${COINGECKO_IMAGE_URL}/6319/large/USD_Coin_icon.png`;
    case 'EURC':
      return `${COINGECKO_IMAGE_URL}/26045/large/euro-coin.png`;
    case 'USDT':
      return `${COINGECKO_IMAGE_URL}/325/large/Tether.png`;
    default:
      return FALLBACK_IMAGES[symbol] || FALLBACK_IMAGES.DEFAULT;
  }
}

/**
 * Get network logo URL using local chain logos from public/chains folder
 * @param networkId The network ID (1 for Ethereum, 8453 for Base, 10 for Optimism)
 * @returns The URL to the network logo
 */
export function getNetworkLogoUrl(networkId: number): string {
  switch (networkId) {
    case 1: // Ethereum Mainnet
      return '/chains/ethereum.png';
    case 8453: // Base Mainnet
      return '/chains/base logo.svg';
    case 10: // Optimism Mainnet
      return '/chains/op mainnet.png';
    default:
      // Fallback to default
      return '/images/network-default.png';
  }
}

/**
 * Format token balance for display
 * @param balance The balance as a string
 * @param decimals Number of decimals to display
 * @returns Formatted balance string
 */
export function formatTokenBalance(balance: string, decimals: number = 6): string {
  const value = parseFloat(balance);
  if (isNaN(value)) return '0.00';
  
  // For very small amounts, don't show scientific notation
  if (value < 0.000001 && value > 0) {
    return '< 0.000001';
  }
  
  return value.toFixed(decimals);
}

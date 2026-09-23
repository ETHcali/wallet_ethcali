// CoinGecko ids for the tokens the wallet prices. COPm has no stable id and is
// valued through the USD→COP rate instead (hooks/donations/useDisplayCurrency).
export const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  CELO: 'celo',
  USDC: 'usd-coin',
  EURC: 'euro-coin',
  USDT: 'tether',
};

// Base URL for CoinGecko images
const COINGECKO_IMAGE_URL = 'https://assets.coingecko.com/coins/images';

// Fallback images in case CoinGecko fails
const FALLBACK_IMAGES: Record<string, string> = {
  ETH: '/images/ethereum.png',
  USDC: '/images/usdc.png',
  DEFAULT: '/images/token-default.png',
};

/**
 * Token logo URL, from CoinGecko where we know the image id.
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
    case 'CELO':
      return `${COINGECKO_IMAGE_URL}/11090/large/InjXBNx9_400x400.jpg`;
    default:
      return FALLBACK_IMAGES[symbol] || FALLBACK_IMAGES.DEFAULT;
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

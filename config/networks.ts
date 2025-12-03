import { Network } from '../types/index';
import { getNetworkLogoUrl, getTokenLogoUrl } from '../utils/tokenUtils';

// Ethereum Mainnet configuration
export const ETHEREUM: Network = {
  id: 1,
  name: 'Ethereum Mainnet',
  shortName: 'Ethereum',
  icon: getNetworkLogoUrl(1),
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://eth.llamarpc.com',
  testnet: false,
  color: '#627EEA'
};

// Base Mainnet configuration
export const BASE: Network = {
  id: 8453,
  name: 'Base Mainnet',
  shortName: 'Base',
  icon: getNetworkLogoUrl(8453),
  explorerUrl: 'https://basescan.org',
  rpcUrl: 'https://mainnet.base.org',
  testnet: false,
  color: '#0052FF'
};

// Optimism network configuration
export const OPTIMISM: Network = {
  id: 10,
  name: 'Optimism Mainnet',
  shortName: 'Optimism',
  icon: getNetworkLogoUrl(10),
  explorerUrl: 'https://optimistic.etherscan.io',
  rpcUrl: 'https://mainnet.optimism.io',
  testnet: false,
  color: '#FF0B51'
};

// Default network
export const DEFAULT_NETWORK = BASE;

// Get network by chain ID
export function getNetworkById(chainId: number): Network {
  switch (chainId) {
    case 1:
      return ETHEREUM;
    case 8453:
      return BASE;
    case 10:
      return OPTIMISM;
    default:
      return DEFAULT_NETWORK;
  }
}

// Token configurations
export const TOKENS = {
  // Ethereum tokens
  [ETHEREUM.id]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: getTokenLogoUrl('ETH')
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      icon: getTokenLogoUrl('USDC')
    },
    EURC: {
      symbol: 'EURC',
      name: 'Euro Coin',
      decimals: 6,
      address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
      icon: getTokenLogoUrl('EURC')
    }
  },
  // Base tokens
  [BASE.id]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: getTokenLogoUrl('ETH')
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      icon: getTokenLogoUrl('USDC')
    },
    EURC: {
      symbol: 'EURC',
      name: 'Euro Coin',
      decimals: 6,
      address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
      icon: getTokenLogoUrl('EURC')
    }
  },
  // Optimism tokens
  [OPTIMISM.id]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: getTokenLogoUrl('ETH')
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      icon: getTokenLogoUrl('USDC')
    }
  }
};

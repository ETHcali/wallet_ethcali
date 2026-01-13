import { Network } from '../types/index';
import { getNetworkLogoUrl, getTokenLogoUrl } from '../utils/tokenUtils';

// Ethereum Mainnet configuration
export const ETHEREUM: Network = {
  id: 1,
  name: 'Ethereum Mainnet',
  shortName: 'Ethereum',
  icon: getNetworkLogoUrl(1),
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'NEXT_PUBLIC_MAINNET_RPC_URL' in process.env ? process.env.NEXT_PUBLIC_MAINNET_RPC_URL! : 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
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
  rpcUrl: 'NEXT_PUBLIC_BASE_RPC_URL' in process.env ? process.env.NEXT_PUBLIC_BASE_RPC_URL! : 'https://mainnet.base.org',
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
  rpcUrl: 'NEXT_PUBLIC_OPTIMISM_RPC_URL' in process.env ? process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL! : 'https://mainnet.optimism.io',
  testnet: false,
  color: '#FF0B51'
};

// Unichain network configuration
export const UNICHAIN: Network = {
  id: 130,
  name: 'Unichain Mainnet',
  shortName: 'Unichain',
  icon: getNetworkLogoUrl(130),
  explorerUrl: 'https://unichain.blockscout.com',
  rpcUrl: 'NEXT_PUBLIC_UNICHAIN_RPC_URL' in process.env ? process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL! : 'https://rpc.unichain.org',
  testnet: false,
  color: '#00FF00'
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
    case 130:
      return UNICHAIN;
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
  },
  // Unichain tokens
  [UNICHAIN.id]: {
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
      address: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
      icon: getTokenLogoUrl('USDC')
    }
  }
};

// Helper function to get RPC URL by chain ID
export function getChainRpc(chainId: number): string {
  const networks = [ETHEREUM, BASE, OPTIMISM, UNICHAIN];
  const network = networks.find(n => n.id === chainId);
  return network?.rpcUrl || BASE.rpcUrl; // Default to Base
}

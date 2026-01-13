import { useMemo, useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

type ChainLabel = 'base' | 'ethereum' | 'unichain' | 'optimism';

type ChainConfig = {
  id: number;
  label: ChainLabel;
  name: string;
  swag1155: string;
  usdc: string;
  explorerUrl: string;
};

const FALLBACK_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || 8453);

const CHAIN_CONFIGS: Record<ChainLabel, ChainConfig> = {
  base: {
    id: 8453,
    label: 'base',
    name: 'Base',
    swag1155: process.env.NEXT_PUBLIC_SWAG1155_ADDRESS_BASE || '',
    usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE || '0x833589fCD6eDb6E08f4c7C32D4f71b1566469C5d',
    explorerUrl: 'https://basescan.org',
  },
  ethereum: {
    id: 1,
    label: 'ethereum',
    name: 'Ethereum',
    swag1155: process.env.NEXT_PUBLIC_SWAG1155_ADDRESS_ETHEREUM || '',
    usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS_ETHEREUM || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    explorerUrl: 'https://etherscan.io',
  },
  unichain: {
    id: 130,
    label: 'unichain',
    name: 'Unichain',
    swag1155: process.env.NEXT_PUBLIC_SWAG1155_ADDRESS_UNICHAIN || '',
    usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS_UNICHAIN || '0x5a1b40E9B1c89b2B72D0c7c1b45C07e9e6d55dCd',
    explorerUrl: 'https://explorer.unichain.org',
  },
  optimism: {
    id: 10,
    label: 'optimism',
    name: 'Optimism',
    swag1155: process.env.NEXT_PUBLIC_SWAG1155_ADDRESS_OPTIMISM || '',
    usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS_OPTIMISM || '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
};

const CHAIN_ID_TO_LABEL: Record<number, ChainLabel> = {
  [CHAIN_CONFIGS.base.id]: 'base',
  [CHAIN_CONFIGS.ethereum.id]: 'ethereum',
  [CHAIN_CONFIGS.unichain.id]: 'unichain',
  [CHAIN_CONFIGS.optimism.id]: 'optimism',
};

function getLabelByChainId(chainId?: number): ChainLabel {
  return chainId ? CHAIN_ID_TO_LABEL[chainId] || 'base' : 'base';
}

export function getChainConfig(chainId?: number): ChainConfig {
  const label = getLabelByChainId(chainId || FALLBACK_CHAIN_ID);
  return CHAIN_CONFIGS[label];
}

export function getSupportedNetworks(): ChainConfig[] {
  return Object.values(CHAIN_CONFIGS);
}

export function getExplorerUrl(chainId?: number): string {
  return getChainConfig(chainId).explorerUrl;
}

export function useSwagAddresses() {
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];
  const [currentChainId, setCurrentChainId] = useState<number>(FALLBACK_CHAIN_ID);

  // Parse chainId from wallet (can be string like "eip155:8453" or number)
  useEffect(() => {
    if (!activeWallet?.chainId) {
      setCurrentChainId(FALLBACK_CHAIN_ID);
      return;
    }

    let chainId: number;
    if (typeof activeWallet.chainId === 'string') {
      // Handle "eip155:8453" format
      const parts = activeWallet.chainId.split(':');
      chainId = parseInt(parts[parts.length - 1], 10);
    } else {
      chainId = activeWallet.chainId;
    }

    if (!isNaN(chainId) && chainId !== currentChainId) {
      setCurrentChainId(chainId);
    }
  }, [activeWallet?.chainId]);

  const config = useMemo(() => getChainConfig(currentChainId), [currentChainId]);

  return {
    chainId: config.id,
    swag1155: config.swag1155,
    usdc: config.usdc,
    explorerUrl: config.explorerUrl,
    label: config.label,
  };
}

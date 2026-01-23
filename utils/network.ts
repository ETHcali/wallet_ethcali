/**
 * Network utilities
 * Provides chain configuration and contract addresses
 * Uses centralized constants from config/constants.ts
 */
import { useMemo, useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ADDRESSES } from '../frontend/contracts';
import {
  CHAIN_IDS,
  EXPLORER_URLS,
  TOKEN_ADDRESSES,
  DEFAULT_CHAIN_ID,
  isSupportedChain,
} from '../config/constants';
import { getExplorerBaseUrl } from './explorer';
import { logger } from './logger';

// Re-export explorer function for backward compatibility
export { getExplorerBaseUrl as getExplorerUrl };

type ChainLabel = 'base' | 'ethereum' | 'unichain' | 'optimism';

export type ChainConfig = {
  id: number;
  label: ChainLabel;
  name: string;
  swag1155: string;
  faucetManager: string;
  zkpassport: string;
  usdc: string;
  explorerUrl: string;
};

const CHAIN_ID_TO_LABEL: Record<number, ChainLabel> = {
  [CHAIN_IDS.BASE]: 'base',
  [CHAIN_IDS.ETHEREUM]: 'ethereum',
  [CHAIN_IDS.UNICHAIN]: 'unichain',
  [CHAIN_IDS.OPTIMISM]: 'optimism',
};

function getLabelByChainId(chainId?: number): ChainLabel {
  return chainId ? CHAIN_ID_TO_LABEL[chainId] || 'base' : 'base';
}

// Build chain configs from frontend/addresses.json (single source of truth)
const CHAIN_CONFIGS: Record<ChainLabel, ChainConfig> = {
  base: {
    id: CHAIN_IDS.BASE,
    label: 'base',
    name: 'Base',
    swag1155: ADDRESSES.base.addresses.Swag1155,
    faucetManager: ADDRESSES.base.addresses.FaucetManager,
    zkpassport: ADDRESSES.base.addresses.ZKPassportNFT,
    usdc: TOKEN_ADDRESSES[CHAIN_IDS.BASE].USDC,
    explorerUrl: EXPLORER_URLS[CHAIN_IDS.BASE],
  },
  ethereum: {
    id: CHAIN_IDS.ETHEREUM,
    label: 'ethereum',
    name: 'Ethereum',
    swag1155: ADDRESSES.ethereum.addresses.Swag1155,
    faucetManager: ADDRESSES.ethereum.addresses.FaucetManager,
    zkpassport: ADDRESSES.ethereum.addresses.ZKPassportNFT,
    usdc: TOKEN_ADDRESSES[CHAIN_IDS.ETHEREUM].USDC,
    explorerUrl: EXPLORER_URLS[CHAIN_IDS.ETHEREUM],
  },
  unichain: {
    id: CHAIN_IDS.UNICHAIN,
    label: 'unichain',
    name: 'Unichain',
    swag1155: ADDRESSES.unichain.addresses.Swag1155,
    faucetManager: ADDRESSES.unichain.addresses.FaucetManager,
    zkpassport: ADDRESSES.unichain.addresses.ZKPassportNFT,
    usdc: TOKEN_ADDRESSES[CHAIN_IDS.UNICHAIN].USDC,
    explorerUrl: EXPLORER_URLS[CHAIN_IDS.UNICHAIN],
  },
  optimism: {
    id: CHAIN_IDS.OPTIMISM,
    label: 'optimism',
    name: 'Optimism',
    swag1155: '',
    faucetManager: '',
    zkpassport: '',
    usdc: TOKEN_ADDRESSES[CHAIN_IDS.OPTIMISM].USDC,
    explorerUrl: EXPLORER_URLS[CHAIN_IDS.OPTIMISM],
  },
};

/**
 * Get chain configuration by chain ID
 */
export function getChainConfig(chainId?: number): ChainConfig {
  const label = getLabelByChainId(chainId || DEFAULT_CHAIN_ID);
  return CHAIN_CONFIGS[label];
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): ChainConfig[] {
  return Object.values(CHAIN_CONFIGS);
}

/**
 * React hook for getting current chain's contract addresses
 */
export function useSwagAddresses() {
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];
  const [currentChainId, setCurrentChainId] = useState<number>(DEFAULT_CHAIN_ID);

  useEffect(() => {
    if (!activeWallet?.chainId) {
      logger.debug('[useSwagAddresses] No wallet chainId, using default', { defaultChainId: DEFAULT_CHAIN_ID });
      setCurrentChainId(DEFAULT_CHAIN_ID);
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

    logger.debug('[useSwagAddresses] Detected chain', {
      rawChainId: activeWallet.chainId,
      parsedChainId: chainId,
      walletAddress: activeWallet.address?.slice(0, 10)
    });

    if (!isNaN(chainId) && chainId !== currentChainId) {
      setCurrentChainId(chainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.chainId]);

  const config = useMemo(() => getChainConfig(currentChainId), [currentChainId]);

  return {
    chainId: config.id,
    swag1155: config.swag1155,
    faucetManager: config.faucetManager,
    zkpassport: config.zkpassport,
    usdc: config.usdc,
    explorerUrl: config.explorerUrl,
    label: config.label,
  };
}

/**
 * Get all contract addresses for a chain
 */
export function getContractAddresses(chainId?: number) {
  const config = getChainConfig(chainId);
  return {
    swag1155: config.swag1155,
    faucetManager: config.faucetManager,
    zkpassport: config.zkpassport,
    usdc: config.usdc,
  };
}

/**
 * Get token addresses for a chain (USDC, USDT, EURC)
 */
export function getTokenAddresses(chainId?: number): {
  USDC: string;
  USDT: string;
  EURC: string;
} {
  const cid = chainId || DEFAULT_CHAIN_ID;
  if (isSupportedChain(cid)) {
    return TOKEN_ADDRESSES[cid];
  }
  return TOKEN_ADDRESSES[CHAIN_IDS.BASE];
}

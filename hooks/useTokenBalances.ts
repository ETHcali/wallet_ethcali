import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { base, mainnet, optimism } from 'viem/chains';
import { TokenBalance } from '../types/index';
import { getChainRpc } from '../config/networks';
import { logger } from '../utils/logger';

// Chain IDs
const CHAIN_IDS = {
  BASE: 8453,
  ETHEREUM: 1,
  OPTIMISM: 10,
  UNICHAIN: 130,
} as const;

// Token addresses by network
const TOKEN_ADDRESSES: Record<number, { USDC: string; EURC?: string; USDT?: string }> = {
  // Base Network
  [CHAIN_IDS.BASE]: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    EURC: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  },
  // Ethereum Mainnet
  [CHAIN_IDS.ETHEREUM]: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    EURC: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  // Optimism
  [CHAIN_IDS.OPTIMISM]: {
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  },
  // Unichain
  [CHAIN_IDS.UNICHAIN]: {
    USDC: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
  },
};

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

// Get chain name for logging
const getChainName = (id: number): string => {
  switch (id) {
    case CHAIN_IDS.ETHEREUM: return 'Ethereum';
    case CHAIN_IDS.BASE: return 'Base';
    case CHAIN_IDS.OPTIMISM: return 'Optimism';
    case CHAIN_IDS.UNICHAIN: return 'Unichain';
    default: return `Chain ${id}`;
  }
};

// Get chain config for viem
const getChainForId = (id: number) => {
  switch (id) {
    case CHAIN_IDS.ETHEREUM: return mainnet;
    case CHAIN_IDS.OPTIMISM: return optimism;
    default: return base;
  }
};

/**
 * Custom hook to fetch token balances
 * @param address The wallet address
 * @param chainId The chain ID
 */
export function useTokenBalances(address: string | undefined, chainId: number = CHAIN_IDS.BASE) {
  const [balances, setBalances] = useState<TokenBalance>({
    ethBalance: '0',
    uscBalance: '0',
    eurcBalance: '0',
    usdtBalance: '0'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    logger.debug(`Fetching balances for ${getChainName(chainId)}`);

    setIsLoading(true);
    setError(null);

    try {
      // Get RPC URL from centralized config (uses env vars)
      const rpcUrl = getChainRpc(chainId);
      const chain = getChainForId(chainId);

      const client = createPublicClient({
        chain,
        transport: http(rpcUrl),
      });

      // Fetch ETH balance
      const ethBalance = await client.getBalance({ address: address as `0x${string}` });

      // Get token addresses for this network (fallback to Base if not found)
      const tokens = TOKEN_ADDRESSES[chainId] || TOKEN_ADDRESSES[CHAIN_IDS.BASE];

      // Fetch USDC balance
      let usdcBalance = BigInt(0);
      if (tokens.USDC) {
        try {
          const result = await client.readContract({
            address: tokens.USDC as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          });
          usdcBalance = result as bigint;
        } catch (err) {
          logger.error('Error fetching USDC balance', err);
        }
      }

      // Fetch EURC balance (if available on this chain)
      let eurcBalance = BigInt(0);
      if (tokens.EURC) {
        try {
          const result = await client.readContract({
            address: tokens.EURC as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          });
          eurcBalance = result as bigint;
        } catch (err) {
          logger.error('Error fetching EURC balance', err);
        }
      }

      // Fetch USDT balance (if available on this chain)
      let usdtBalance = BigInt(0);
      if (tokens.USDT) {
        try {
          const result = await client.readContract({
            address: tokens.USDT as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          });
          usdtBalance = result as bigint;
        } catch (err) {
          logger.error('Error fetching USDT balance', err);
        }
      }

      // Format balances (ETH has 18 decimals, stablecoins have 6)
      const formattedBalances: TokenBalance = {
        ethBalance: formatUnits(ethBalance, 18),
        uscBalance: formatUnits(usdcBalance, 6),
        eurcBalance: formatUnits(eurcBalance, 6),
        usdtBalance: formatUnits(usdtBalance, 6),
      };

      logger.debug(`Balances fetched for ${getChainName(chainId)}`);
      setBalances(formattedBalances);

    } catch (err) {
      logger.error('Error fetching token balances', err);
      setError('Failed to fetch token balances');

      setBalances({
        ethBalance: '0.00',
        uscBalance: '0.00',
        eurcBalance: '0.00',
        usdtBalance: '0.00',
      });
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    if (address) {
      fetchBalances();
    }
  }, [address, chainId, fetchBalances]);

  return { 
    balances, 
    isLoading, 
    error, 
    refetch: fetchBalances
  };
}

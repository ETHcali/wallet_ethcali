import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { base, mainnet } from 'viem/chains';
import { TokenBalance } from '../types/index';

// Token addresses by network
const TOKEN_ADDRESSES = {
  // Base Network
  [base.id]: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    EURC: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
  },
  // Ethereum Mainnet
  [mainnet.id]: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    EURC: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
  },
};

// RPC endpoints
const RPC_URLS = {
  [base.id]: 'https://mainnet.base.org',
  [mainnet.id]: 'https://eth.llamarpc.com',
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

/**
 * Custom hook to fetch token balances from Base or Ethereum
 * @param address The wallet address
 * @param chainId The chain ID (8453 for Base, 1 for Ethereum)
 */
export function useTokenBalances(address: string | undefined, chainId: number = base.id) {
  const [balances, setBalances] = useState<TokenBalance>({ 
    ethBalance: '0', 
    uscBalance: '0',
    eurcBalance: '0'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    
    console.log(`🔄 Fetching balances for chain ${chainId} (${chainId === 1 ? 'Ethereum' : 'Base'})`);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create client for the selected network
      const chain = chainId === mainnet.id ? mainnet : base;
      const client = createPublicClient({
        chain,
        transport: http(RPC_URLS[chainId]),
      });

      // Fetch ETH balance
      const ethBalance = await client.getBalance({ address: address as `0x${string}` });
      
      // Get token addresses for this network
      const tokens = TOKEN_ADDRESSES[chainId];
      
      // Fetch USDC balance
      let usdcBalance = BigInt(0);
      try {
        const result = await client.readContract({
          address: tokens.USDC as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        });
        usdcBalance = result as bigint;
      } catch (err) {
        console.error('Error fetching USDC balance:', err);
      }
      
      // Fetch EURC balance
      let eurcBalance = BigInt(0);
      try {
        const result = await client.readContract({
          address: tokens.EURC as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        });
        eurcBalance = result as bigint;
      } catch (err) {
        console.error('Error fetching EURC balance:', err);
      }
      
      // Format balances (ETH has 18 decimals, USDC and EURC have 6)
      const formattedBalances = {
        ethBalance: formatUnits(ethBalance, 18),
        uscBalance: formatUnits(usdcBalance, 6),
        eurcBalance: formatUnits(eurcBalance, 6),
      };
      
      console.log(`✅ Balances fetched for chain ${chainId}:`, formattedBalances);
      setBalances(formattedBalances);
      
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError('Failed to fetch token balances');
      
      setBalances({
        ethBalance: '0.00',
        uscBalance: '0.00',
        eurcBalance: '0.00',
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

/**
 * useAdminStatus - Combined hook to check admin status across all contracts
 * Reduces contract calls by fetching all admin statuses in a single query
 */
import { useQuery } from '@tanstack/react-query';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { swag1155Abi } from '../frontend/abis/swag';
import FaucetManagerABI from '../frontend/abis/FaucetManager.json';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import { useSwagAddresses, getChainConfig } from '../utils/network';
import { getChainRpc } from '../config/networks';
import { logger } from '../utils/logger';

export interface AdminStatus {
  // Swag admin
  isSwagAdmin: boolean;
  // Faucet admin
  isFaucetAdmin: boolean;
  isFaucetSuperAdmin: boolean;
  // ZKPassport owner
  isZKPassportOwner: boolean;
  // Combined
  hasAnyAdmin: boolean;
}

/**
 * Combined hook to check admin status across all contracts in a single query
 * @param overrideChainId - Optional chain ID to override the wallet's detected chain
 */
export function useAdminStatus(overrideChainId?: number) {
  const { wallets } = useWallets();
  const swagAddresses = useSwagAddresses();
  const activeWallet = wallets?.[0];
  const walletAddress = activeWallet?.address;

  // Use override chainId if provided, otherwise use detected chain
  const chainId = overrideChainId || swagAddresses.chainId;

  // Get contract addresses for the specific chain
  const config = getChainConfig(chainId);
  const { swag1155, faucetManager, zkpassport } = config;

  const query = useQuery({
    queryKey: ['admin-status', chainId, walletAddress, swag1155, faucetManager, zkpassport],
    queryFn: async (): Promise<AdminStatus> => {
      if (!chainId || !walletAddress) {
        logger.debug('[useAdminStatus] Missing wallet or chain', { chainId, walletAddress: !!walletAddress });
        return {
          isSwagAdmin: false,
          isFaucetAdmin: false,
          isFaucetSuperAdmin: false,
          isZKPassportOwner: false,
          hasAnyAdmin: false,
        };
      }

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      // Prepare all the contract calls
      const calls: Promise<any>[] = [];
      const callMap: { index: number; type: string }[] = [];

      // Swag1155 admin check
      if (swag1155) {
        calls.push(
          client.readContract({
            address: swag1155 as `0x${string}`,
            abi: swag1155Abi,
            functionName: 'isAdmin',
            args: [walletAddress as `0x${string}`],
          }).catch(() => false)
        );
        callMap.push({ index: calls.length - 1, type: 'swagAdmin' });
      }

      // FaucetManager admin checks
      if (faucetManager) {
        calls.push(
          client.readContract({
            address: faucetManager as `0x${string}`,
            abi: FaucetManagerABI as any,
            functionName: 'isAdmin',
            args: [walletAddress as `0x${string}`],
          }).catch(() => false)
        );
        callMap.push({ index: calls.length - 1, type: 'faucetAdmin' });

        calls.push(
          client.readContract({
            address: faucetManager as `0x${string}`,
            abi: FaucetManagerABI as any,
            functionName: 'isSuperAdmin',
            args: [walletAddress as `0x${string}`],
          }).catch(() => false)
        );
        callMap.push({ index: calls.length - 1, type: 'faucetSuperAdmin' });
      }

      // ZKPassport owner check
      if (zkpassport) {
        calls.push(
          (client.readContract as any)({
            address: zkpassport as `0x${string}`,
            abi: ZKPassportNFTABI,
            functionName: 'owner',
          }).catch(() => null)
        );
        callMap.push({ index: calls.length - 1, type: 'zkpassportOwner' });
      }

      // Execute all calls in parallel
      const results = await Promise.all(calls);

      // Parse results
      let isSwagAdmin = false;
      let isFaucetAdmin = false;
      let isFaucetSuperAdmin = false;
      let isZKPassportOwner = false;

      for (const { index, type } of callMap) {
        const result = results[index];
        switch (type) {
          case 'swagAdmin':
            isSwagAdmin = Boolean(result);
            break;
          case 'faucetAdmin':
            isFaucetAdmin = Boolean(result);
            break;
          case 'faucetSuperAdmin':
            isFaucetSuperAdmin = Boolean(result);
            break;
          case 'zkpassportOwner':
            isZKPassportOwner = result ?
              (result as string).toLowerCase() === walletAddress.toLowerCase() :
              false;
            break;
        }
      }

      const hasAnyAdmin = isSwagAdmin || isFaucetAdmin || isFaucetSuperAdmin || isZKPassportOwner;

      logger.debug('[useAdminStatus] Results', {
        chainId,
        isSwagAdmin,
        isFaucetAdmin,
        isFaucetSuperAdmin,
        isZKPassportOwner,
        hasAnyAdmin,
      });

      return {
        isSwagAdmin,
        isFaucetAdmin,
        isFaucetSuperAdmin,
        isZKPassportOwner,
        hasAnyAdmin,
      };
    },
    enabled: Boolean(chainId && walletAddress),
    staleTime: 1000 * 60 * 2, // 2 minutes - admin status doesn't change often
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    retry: 1, // Only retry once on failure
  });

  return {
    ...query.data ?? {
      isSwagAdmin: false,
      isFaucetAdmin: false,
      isFaucetSuperAdmin: false,
      isZKPassportOwner: false,
      hasAnyAdmin: false,
    },
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    walletAddress,
  };
}

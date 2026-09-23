/**
 * Which admin roles the active wallet holds, read from the contracts on
 * Ethereum.
 *
 * Two hooks over one reader:
 *   useAdminStatus(chainId)  the roles on one chain — for an admin page
 *   useAdminRoles()          the roles on the chain — for navigation and the
 *                            admin menu, cached once per wallet
 *
 * These decide what is *shown*. The contract re-checks on every write, so a
 * link hidden here has never been, and must never become, the access control.
 */
import { useQuery } from '@tanstack/react-query';
import { swag1155Abi } from '../frontend/abis/swag';
import FaucetManagerABI from '../frontend/abis/FaucetManager.json';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import DonationVaultABI from '../frontend/abis/DonationVault.json';
import { DEFAULT_CHAIN, getChain, publicClientFor, type ChainInfo } from '../config/chains';
import { logger } from '../utils/logger';
import { useActiveWallet } from './useActiveWallet';

export interface AdminStatus {
  isSwagAdmin: boolean;
  isFaucetAdmin: boolean;
  isFaucetSuperAdmin: boolean;
  isZKPassportOwner: boolean;
  isDonationAdmin: boolean;
  isDonationSuperAdmin: boolean;
  hasAnyAdmin: boolean;
}

const NONE: AdminStatus = {
  isSwagAdmin: false,
  isFaucetAdmin: false,
  isFaucetSuperAdmin: false,
  isZKPassportOwner: false,
  isDonationAdmin: false,
  isDonationSuperAdmin: false,
  hasAnyAdmin: false,
};

function withAny(status: Omit<AdminStatus, 'hasAnyAdmin'>): AdminStatus {
  return {
    ...status,
    hasAnyAdmin:
      status.isSwagAdmin ||
      status.isFaucetAdmin ||
      status.isFaucetSuperAdmin ||
      status.isZKPassportOwner ||
      status.isDonationAdmin ||
      status.isDonationSuperAdmin,
  };
}

/** Roles for one wallet on one chain. Every call is caught: an RPC hiccup reads as "no". */
async function readAdminStatus(chain: ChainInfo, wallet: `0x${string}`): Promise<AdminStatus> {
  const client = publicClientFor(chain.id);
  const { Swag1155, FaucetManager, ZKPassportNFT, DonationVault } = chain.contracts;

  const asBool = (p: Promise<unknown>) => p.then(Boolean).catch(() => false);
  const read = (address: `0x${string}`, abi: unknown, functionName: string, args?: unknown[]) =>
    client.readContract({ address, abi, functionName, args } as any) as Promise<unknown>;

  const [isSwagAdmin, isFaucetAdmin, isFaucetSuperAdmin, owner, isDonationAdmin, isDonationSuperAdmin] =
    await Promise.all([
      Swag1155
        ? client
            .readContract({ address: Swag1155, abi: swag1155Abi, functionName: 'isAdmin', args: [wallet] })
            .catch(() => false)
        : false,
      FaucetManager ? asBool(read(FaucetManager, FaucetManagerABI, 'isAdmin', [wallet])) : false,
      FaucetManager ? asBool(read(FaucetManager, FaucetManagerABI, 'isSuperAdmin', [wallet])) : false,
      ZKPassportNFT ? read(ZKPassportNFT, ZKPassportNFTABI, 'owner').catch(() => null) : null,
      DonationVault ? asBool(read(DonationVault, DonationVaultABI, 'isAdmin', [wallet])) : false,
      DonationVault ? asBool(read(DonationVault, DonationVaultABI, 'isSuperAdmin', [wallet])) : false,
    ]);

  return withAny({
    isSwagAdmin: Boolean(isSwagAdmin),
    isFaucetAdmin,
    isFaucetSuperAdmin,
    isZKPassportOwner: typeof owner === 'string' && owner.toLowerCase() === wallet.toLowerCase(),
    isDonationAdmin,
    isDonationSuperAdmin,
  });
}

/** Roles on one chain. Unsupported chain → no roles. */
export function useAdminStatus(chainId: number) {
  const { address } = useActiveWallet();
  const chain = getChain(chainId);

  const query = useQuery({
    queryKey: ['admin-status', chainId, address?.toLowerCase()],
    queryFn: async (): Promise<AdminStatus> => {
      if (!chain || !address) return NONE;
      const status = await readAdminStatus(chain, address as `0x${string}`);
      logger.debug('[useAdminStatus]', { chainId, ...status });
      return status;
    },
    enabled: Boolean(chain && address),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    ...(query.data ?? NONE),
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    walletAddress: address,
  };
}

/**
 * Roles on the chain. One query per wallet, cached, so the top bar and the
 * admin sidebar share the result instead of each firing the reads again.
 */
export function useAdminRoles() {
  const { address } = useActiveWallet();

  const query = useQuery({
    queryKey: ['admin-roles', address?.toLowerCase()],
    queryFn: async (): Promise<AdminStatus> => {
      if (!address) return NONE;
      return readAdminStatus(DEFAULT_CHAIN, address as `0x${string}`);
    },
    enabled: Boolean(address),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  return {
    ...(query.data ?? NONE),
    isLoading: query.isLoading,
    walletAddress: address,
  };
}

/**
 * Which admin roles the signed-in user holds, read from the contracts on
 * Ethereum through lib/roles.ts — the same reader the server gates use.
 *
 * Every linked wallet counts, as on the server: a role on the embedded wallet
 * shows its sections while an external wallet is active. A page that signs a
 * transaction still checks the active wallet itself, because that is the
 * wallet the contract will see.
 *
 * This decides what is *shown*. The contract re-checks on every write, so a
 * link hidden here has never been, and must never become, the access control.
 */
import { useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { NO_ROLES, readAdminRoles, type AdminRoles } from '../lib/roles';
import { useActiveWallet } from './useActiveWallet';

/** Every Ethereum wallet linked to the Privy account, lowercase and sorted (a stable query key). */
function useLinkedWallets(): string[] {
  const { user } = usePrivy();
  return useMemo(() => {
    const wallets = (user?.linkedAccounts ?? [])
      .filter((a) => a.type === 'wallet' && (a as { chainType?: string }).chainType !== 'solana')
      .map((a) => (a as { address: string }).address.toLowerCase());
    return Array.from(new Set(wallets)).sort();
  }, [user]);
}

/**
 * Roles across the account's wallets. One query per account, cached, so the
 * top bar, settings and the admin sidebar share it.
 */
export function useAdminRoles(): AdminRoles & { isLoading: boolean; walletAddress: string | undefined } {
  const { address } = useActiveWallet();
  const wallets = useLinkedWallets();

  const query = useQuery({
    queryKey: ['admin-roles', wallets],
    queryFn: () => readAdminRoles(wallets),
    enabled: wallets.length > 0,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  return {
    ...(query.data ?? NO_ROLES),
    isLoading: query.isLoading,
    walletAddress: address,
  };
}

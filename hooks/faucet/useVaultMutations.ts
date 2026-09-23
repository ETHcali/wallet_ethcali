/**
 * useVaultMutations - Vault CRUD on the FaucetManager of one explicit chain.
 *
 * Every write pins `chainId`. The admin page shows "Switch to <chain>" before
 * these are reachable, so the wallet is already there when a button fires.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData, parseEther } from 'viem';
import FaucetManagerABI from '../../frontend/abis/FaucetManager.json';
import { getChain } from '../../config/chains';
import { VaultFormData, VaultUpdateData } from '../../types/faucet';
import { useActiveWallet } from '../useActiveWallet';

/** Shared write path: encode, send pinned to the chain, invalidate the given keys. */
function useFaucetWrite(chainId: number, invalidate: string[]) {
  const faucetManager = getChain(chainId)?.contracts.FaucetManager;
  const { wallet } = useActiveWallet();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const write = async (functionName: string, args: unknown[], value?: bigint) => {
    if (!faucetManager) throw new Error('Faucet is not deployed on this network');
    if (!wallet) throw new Error('Wallet not connected');

    const data = encodeFunctionData({ abi: FaucetManagerABI as any, functionName, args });
    const result = await sendTransaction(
      { to: faucetManager, data, chainId, ...(value !== undefined ? { value } : {}) },
      { sponsor: true }
    );

    for (const key of invalidate) queryClient.invalidateQueries({ queryKey: [key] });
    return result;
  };

  return { write, canWrite: Boolean(faucetManager && wallet) };
}

export function useCreateVault(chainId: number) {
  const { write, canWrite } = useFaucetWrite(chainId, ['faucet-all-vaults']);

  return {
    createVault: (data: VaultFormData) =>
      write('createVault', [
        data.name,
        data.description,
        parseEther(data.claimAmount),
        data.vaultType,
        data.whitelistEnabled,
        data.zkPassportRequired,
        data.allowedToken,
      ]),
    canCreate: canWrite,
  };
}

export function useUpdateVault(chainId: number) {
  const { write, canWrite } = useFaucetWrite(chainId, ['faucet-all-vaults']);

  return {
    updateVault: (data: VaultUpdateData) =>
      write('updateVault', [
        data.vaultId,
        data.name,
        data.description,
        parseEther(data.claimAmount),
        data.active,
      ]),
    canUpdate: canWrite,
  };
}

export function useVaultDeposit(chainId: number) {
  const { write, canWrite } = useFaucetWrite(chainId, ['faucet-all-vaults']);

  return {
    deposit: (vaultId: number, amountEth: string) => write('deposit', [vaultId], parseEther(amountEth)),
    canDeposit: canWrite,
  };
}

export function useVaultWithdraw(chainId: number) {
  const { write, canWrite } = useFaucetWrite(chainId, ['faucet-all-vaults']);

  return {
    withdraw: (vaultId: number, amountEth: string) => write('withdraw', [vaultId, parseEther(amountEth)]),
    canWithdraw: canWrite,
  };
}

export function useFaucetPause(chainId: number) {
  const { write, canWrite } = useFaucetWrite(chainId, ['faucet-paused']);

  return {
    pause: () => write('pause', []),
    unpause: () => write('unpause', []),
    canPause: canWrite,
  };
}

/** zkPassport and token gating for one vault. */
export function useUpdateVaultGating(chainId: number) {
  const { write, canWrite } = useFaucetWrite(chainId, ['faucet-all-vaults']);

  return {
    updateVaultGating: (vaultId: number, zkPassportRequired: boolean, allowedToken: string) =>
      write('updateVaultGating', [vaultId, zkPassportRequired, allowedToken]),
    canUpdateGating: canWrite,
  };
}

/**
 * useENSMint - Register `<label>.ethcali.eth` through the Base registrar.
 *
 * Two pending phases, per the frontend-ux rule for onchain buttons:
 *   submitting  click → wallet returned a hash
 *   confirming  hash  → receipt mined
 * The button stays locked through both, and `finally` always releases it so a
 * rejected transaction cannot wedge the form.
 */
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction } from '@privy-io/react-auth';
import { createPublicClient, encodeFunctionData, http } from 'viem';
import { base } from 'viem/chains';
import L2RegistrarABI from '../../frontend/abis/l2registar.json';
import { ENS_CONFIG, CHAIN_IDS, getRpcUrl } from '../../config/constants';
import { logger } from '../../utils/logger';

export type MintPhase = 'idle' | 'submitting' | 'confirming' | 'confirmed' | 'failed';

/** Status first, then what it means for the user's funds. Never a raw selector. */
function translate(err: unknown): string {
  const e = err as { code?: number; message?: string; shortMessage?: string };
  const text = `${e?.shortMessage ?? ''} ${e?.message ?? ''}`.toLowerCase();
  if (e?.code === 4001 || text.includes('user rejected') || text.includes('user denied')) {
    return 'You cancelled the request. Nothing was sent.';
  }
  if (text.includes('not available') || text.includes('labelunavailable') || text.includes('already')) {
    return 'Registration failed. Someone took that name first.';
  }
  return 'Registration failed. Nothing left your wallet.';
}

export function useENSMint() {
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<MintPhase>('idle');
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (label: string, owner: `0x${string}`) => {
      setPhase('submitting');
      setError(null);
      setHash(null);

      try {
        const data = encodeFunctionData({
          abi: L2RegistrarABI,
          functionName: 'register',
          args: [label, owner],
        });

        logger.info('[useENSMint] Registering', { label, owner });
        const result = await sendTransaction(
          { to: ENS_CONFIG.registrar, data, chainId: CHAIN_IDS.BASE },
          { sponsor: true }
        );
        const txHash = result.hash as `0x${string}`;
        setHash(txHash);
        setPhase('confirming');

        const client = createPublicClient({
          chain: base,
          transport: http(getRpcUrl(CHAIN_IDS.BASE)),
        });
        const receipt = await client.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status !== 'success') {
          throw new Error('reverted');
        }

        logger.info('[useENSMint] Confirmed', { hash: txHash });
        setPhase('confirmed');
        // The registry is the truth now; drop whatever the name query cached.
        queryClient.invalidateQueries({ queryKey: ['ens-user-name', owner] });
        queryClient.invalidateQueries({ queryKey: ['ens-available', label] });
      } catch (err) {
        logger.error('[useENSMint] Failed', err);
        setError(translate(err));
        setPhase('failed');
      }
    },
    [sendTransaction, queryClient]
  );

  const reset = useCallback(() => {
    setPhase('idle');
    setHash(null);
    setError(null);
  }, []);

  return { register, phase, hash, error, reset };
}

/**
 * useENSMint - Hook for minting ENS subdomains
 */
import { useState, useCallback } from 'react';
import { useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import L2RegistrarABI from '../../frontend/abis/l2registar.json';
import { ENS_REGISTRAR_ADDRESSES, CHAIN_IDS } from '../../config/constants';
import { logger } from '../../utils/logger';

export function useENSMint() {
  const { sendTransaction } = useSendTransaction();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mintSubdomain = useCallback(async (label: string, owner: string) => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);
    setHash(null);

    try {
      const registrarAddress = ENS_REGISTRAR_ADDRESSES[CHAIN_IDS.BASE];
      if (!registrarAddress) {
        throw new Error('ENS registrar not configured for Base');
      }

      const data = encodeFunctionData({
        abi: L2RegistrarABI,
        functionName: 'register',
        args: [label, owner as `0x${string}`],
      });

      logger.info('[useENSMint] Minting subdomain', { label, owner });

      const result = await sendTransaction({
        to: registrarAddress as `0x${string}`,
        data,
        chainId: CHAIN_IDS.BASE,
      });

      setHash(result.hash);
      setIsSuccess(true);
      logger.info('[useENSMint] Success', { hash: result.hash });

      return result.hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mint failed');
      logger.error('[useENSMint] Failed', error);
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [sendTransaction]);

  const reset = useCallback(() => {
    setIsPending(false);
    setIsSuccess(false);
    setHash(null);
    setError(null);
  }, []);

  return { mintSubdomain, isPending, isSuccess, hash, error, reset };
}

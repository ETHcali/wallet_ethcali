/**
 * useENSAvailability - Hook for checking ENS subdomain availability
 */
import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import L2RegistrarABI from '../../frontend/abis/l2registar.json';
import { ENS_REGISTRAR_ADDRESSES, CHAIN_IDS, getRpcUrl } from '../../config/constants';
import { logger } from '../../utils/logger';

export function useENSAvailability(label: string) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!label || label.length === 0) {
      setIsAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setIsLoading(true);
      try {
        const client = createPublicClient({
          chain: base,
          transport: http(getRpcUrl(CHAIN_IDS.BASE)),
        });

        const registrarAddress = ENS_REGISTRAR_ADDRESSES[CHAIN_IDS.BASE];
        if (!registrarAddress) {
          logger.error('[useENSAvailability] No registrar address for Base');
          setIsAvailable(null);
          return;
        }

        const available = await client.readContract({
          address: registrarAddress as `0x${string}`,
          abi: L2RegistrarABI,
          functionName: 'available',
          args: [label],
        });

        setIsAvailable(available as boolean);
      } catch (error) {
        logger.error('[useENSAvailability] Check failed', error);
        setIsAvailable(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the check
    const timeout = setTimeout(checkAvailability, 300);
    return () => clearTimeout(timeout);
  }, [label]);

  return { isAvailable, isLoading };
}

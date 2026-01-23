import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import type { DiscountConfig } from '../types/swag';
import { logger } from '../utils/logger';

/**
 * Hook to verify POAP ownership for discount eligibility
 */
export function usePoapVerification(
  _designAddress: string,
  discountConfig?: DiscountConfig
) {
  const { wallets } = useWallets();
  const address = wallets?.[0]?.address;
  const [hasPoap, setHasPoap] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !discountConfig?.poapEnabled || !discountConfig.poapEventId) {
      setHasPoap(false);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    const poapApiKey = process.env.NEXT_PUBLIC_POAP_API_KEY || '';
    const eventId = discountConfig.poapEventId.toString();

    fetch(
      `https://api.poap.tech/actions/scan/${address}/${eventId}`,
      {
        headers: {
          'x-api-key': poapApiKey,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`POAP API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        // POAP API returns an array if the user has the POAP
        setHasPoap(data && Array.isArray(data) && data.length > 0);
      })
      .catch((err) => {
        logger.error('POAP verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify POAP');
        setHasPoap(false);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [address, discountConfig?.poapEnabled, discountConfig?.poapEventId]);

  return { 
    hasPoap, 
    isChecking, 
    error 
  };
}

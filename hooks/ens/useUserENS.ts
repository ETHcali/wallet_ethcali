/**
 * useUserENS - Hook for querying user's ENS subdomain
 *
 * Resolution Strategy (Layered Approach per ENSv2 best practices):
 * 1. Layer 1: Check localStorage cache (instant)
 * 2. Layer 2: Try mainnet ENS reverse resolution (ENSv2 standard)
 * 3. Layer 3: Query Base L2 events (fallback for recent mints)
 */
import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base, mainnet } from 'viem/chains';
import { ENS_REGISTRAR_ADDRESSES, ENS_CONFIG, CHAIN_IDS, getRpcUrl } from '../../config/constants';
import { logger } from '../../utils/logger';

interface UserENSResult {
  subdomain: string | null;
  fullName: string | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useUserENS(address: string | undefined): UserENSResult {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!address) {
      setSubdomain(null);
      return;
    }

    const fetchUserENS = async () => {
      setIsLoading(true);
      const cacheKey = `ens-subdomain-${address.toLowerCase()}`;

      try {
        // ============================================
        // Layer 1: Check localStorage cache (instant)
        // ============================================
        const cachedSubdomain = localStorage.getItem(cacheKey);
        if (cachedSubdomain) {
          logger.info('[useUserENS] Layer 1: Found cached subdomain', { subdomain: cachedSubdomain });
          setSubdomain(cachedSubdomain);
          setIsLoading(false);
          return;
        }

        // ============================================
        // Layer 2: Try mainnet ENS reverse resolution
        // Per ENSv2: "Resolution always starts on Ethereum Mainnet"
        // ============================================
        try {
          const mainnetClient = createPublicClient({
            chain: mainnet,
            transport: http(getRpcUrl(CHAIN_IDS.ETHEREUM)),
          });

          // Reverse lookup: address -> name
          const ensName = await mainnetClient.getEnsName({
            address: address as `0x${string}`,
          });

          // Check if it's an ethcali.eth subdomain
          if (ensName && ensName.endsWith(`.${ENS_CONFIG.parentName}`)) {
            const label = ensName.replace(`.${ENS_CONFIG.parentName}`, '');

            // Cache for future lookups
            try {
              localStorage.setItem(cacheKey, label);
            } catch {
              // Ignore storage errors
            }

            logger.info('[useUserENS] Layer 2: Found subdomain via mainnet ENS', { label });
            setSubdomain(label);
            setIsLoading(false);
            return;
          }
        } catch (mainnetError) {
          // Mainnet resolution failed (resolver not configured or network error)
          // This is expected if ethcali.eth doesn't have CCIP-Read resolver set up
          logger.debug('[useUserENS] Layer 2: Mainnet resolution failed, trying Layer 3', mainnetError);
        }

        // ============================================
        // Layer 3: Query OpenSea API for L2 subdomain NFT (fallback)
        // ============================================
        try {
          const res = await fetch(`/api/ens/lookup?address=${address}`);
          if (res.ok) {
            const { name } = await res.json();
            if (name && name.endsWith(`.${ENS_CONFIG.parentName}`)) {
              const label = name.replace(`.${ENS_CONFIG.parentName}`, '');
              try {
                localStorage.setItem(cacheKey, label);
              } catch {}
              logger.info('[useUserENS] Layer 3: Found subdomain via OpenSea API', { label });
              setSubdomain(label);
              setIsLoading(false);
              return;
            }
          }
        } catch (osError) {
          logger.error('[useUserENS] Layer 3: OpenSea API error', osError);
        }

        // No subdomain found in any layer
        setSubdomain(null);
      } catch (error) {
        logger.error('[useUserENS] Query failed', error);
        setSubdomain(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserENS();
  }, [address, fetchTrigger]);

  const refetch = () => setFetchTrigger(prev => prev + 1);

  return {
    subdomain,
    fullName: subdomain ? `${subdomain}.${ENS_CONFIG.parentName}` : null,
    isLoading,
    refetch,
  };
}

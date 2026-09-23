/**
 * The chain a feature page is looking at, remembered in the URL as `?chain=`.
 *
 * The URL rather than localStorage so a link to "the faucet on Optimism" is a
 * link, a reload keeps the choice, and two tabs can look at two chains. Only
 * chains from `chainsFor(feature)` are accepted; anything else falls back to
 * the first one (Base), which is also what a bare URL shows.
 */
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { chainsFor, type ChainId, type ChainInfo, type Feature } from '../config/chains';

export interface ChainQuery {
  chainId: ChainId;
  chain: ChainInfo;
  chains: ChainInfo[];
  setChainId: (id: ChainId) => void;
}

export function useChainQuery(feature: Feature): ChainQuery {
  const router = useRouter();
  const chains = useMemo(() => chainsFor(feature), [feature]);

  const raw = router.query.chain;
  const requested = Number(Array.isArray(raw) ? raw[0] : raw);
  const chain = chains.find((c) => c.id === requested) ?? chains[0];

  const setChainId = useCallback(
    (id: ChainId) => {
      void router.replace(
        { pathname: router.pathname, query: { ...router.query, chain: String(id) } },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  return { chainId: chain.id, chain, chains, setChainId };
}

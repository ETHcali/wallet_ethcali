import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

/** fetch for the certificates admin routes: the Privy token on every call, the API's error message on failure. */
export function useAdminApi() {
  const { getAccessToken } = usePrivy();
  return useCallback(
    async <T,>(path: string, init?: { method?: string; body?: unknown }): Promise<T> => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not signed in');
      const res = await fetch(path, {
        method: init?.method ?? 'GET',
        headers: { Authorization: `Bearer ${token}`, ...(init?.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as T & { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      return data;
    },
    [getAccessToken]
  );
}

/** Where a print logo can be seen in the browser: app files as-is, ipfs:// through the gateway. */
export const logoUrl = (path: string | null): string | null =>
  !path ? null : path.startsWith('ipfs://') ? `https://gateway.pinata.cloud/ipfs/${path.slice(7)}` : path;

/** The site's own artwork lives on ethcali.org. */
export const siteLogoUrl = (path: string | null): string | null =>
  !path ? null : path.startsWith('http') ? path : `https://www.ethcali.org${path}`;

export const inputClass =
  'w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2 text-sm text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none';

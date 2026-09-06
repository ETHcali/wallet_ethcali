/**
 * CMS resources, admin side.
 *
 * Every call carries the Privy access token; the server verifies it, resolves the
 * linked wallets and checks ADMIN_ROLE on chain. Nothing here is trusted — this
 * hook decides what to *show*, never what is allowed.
 */
import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type CmsResource = 'events' | 'venues' | 'team' | 'partners';

interface WithId {
  id: number;
}

export function useCmsResource<T extends WithId>(resource: CmsResource) {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();
  const queryKey = ['cms', resource];

  const authedFetch = useCallback(
    async (input: string, init?: RequestInit) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not signed in');

      const res = await fetch(input, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 204) return {};
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
      return body;
    },
    [getAccessToken]
  );

  const rows = useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      const body = await authedFetch(`/api/cms/${resource}`);
      return body.rows ?? [];
    },
    enabled: authenticated,
    staleTime: 1000 * 20,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const create = useMutation({
    mutationFn: async (row: Partial<T>) =>
      authedFetch(`/api/cms/${resource}`, { method: 'POST', body: JSON.stringify(row) }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<T> & WithId) =>
      authedFetch(`/api/cms/${resource}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: invalidate,
  });

  /**
   * Permanent, and it cascades to an event's POAP and NFT rows. The server
   * demands confirm=true for exactly that reason; prefer toggling is_published.
   */
  const destroy = useMutation({
    mutationFn: async (id: number) =>
      authedFetch(`/api/cms/${resource}?id=${id}&confirm=true`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return {
    rows: rows.data ?? [],
    isLoading: rows.isLoading,
    error: rows.error instanceof Error ? rows.error.message : null,
    refetch: rows.refetch,
    create,
    update,
    destroy,
  };
}

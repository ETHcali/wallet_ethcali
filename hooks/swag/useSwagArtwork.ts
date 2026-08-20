/**
 * Swag artwork pipeline, admin side.
 *
 * Every call carries the Privy access token; the server verifies it, resolves
 * the linked wallets and checks ADMIN_ROLE on chain. Nothing here is trusted.
 */
import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type ArtworkStatus = 'draft' | 'artwork_ready' | 'pinned' | 'live';

export interface SwagVariant {
  id: number;
  sku: string;
  token_id: number;
  label: string;
  drive_file_id: string | null;
  drive_url: string | null;
  image_cid: string | null;
  metadata_cid: string | null;
  collection_address: string | null;
  status: ArtworkStatus;
  notes: string | null;
  updated_at: string;
}

export function useSwagArtwork() {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();

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

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
      return body;
    },
    [getAccessToken]
  );

  const variants = useQuery({
    queryKey: ['swag-artwork'],
    queryFn: async (): Promise<SwagVariant[]> => {
      const body = await authedFetch('/api/swag/variants');
      return body.variants ?? [];
    },
    enabled: authenticated,
    staleTime: 1000 * 20,
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<SwagVariant> & { id: number }) =>
      authedFetch('/api/swag/variants', { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swag-artwork'] }),
  });

  /** Pin an image to IPFS, then record the CID against the variant. */
  const pin = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = () => reject(new Error('Could not read that file'));
        reader.readAsDataURL(file);
      });

      const pinned = await authedFetch('/api/pinata/pin-image', {
        method: 'POST',
        body: JSON.stringify({ file: base64, fileName: file.name }),
      });

      // Store the bare CID. `uri` comes back as ipfs://<cid>; gateways rot, so
      // the prefix is stripped and re-added at render time.
      const cid = String(pinned.uri || '').replace(/^ipfs:\/\//, '');
      if (!cid) throw new Error('Pinning returned no CID');

      return authedFetch('/api/swag/variants', {
        method: 'PATCH',
        body: JSON.stringify({ id, image_cid: cid }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swag-artwork'] }),
  });

  return { variants, update, pin };
}

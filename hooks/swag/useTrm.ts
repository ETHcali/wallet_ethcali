/**
 * The official COP/USD rate for the storefront, fetched once and shared.
 *
 * Seventeen cards each showing a peso price must not mean seventeen requests:
 * one query key, an hour of staleness (the TRM changes at most daily), and no
 * stale constant as a fallback — a peso figure that looks official and is
 * wrong is worse than "COP unavailable".
 */
import { useQuery } from '@tanstack/react-query';
import { swagKeys } from './client';

interface TrmPayload {
  rate: number;
  validFrom: string;
  validTo: string;
}

async function fetchTrm(): Promise<TrmPayload> {
  const res = await fetch('/api/fx/trm');
  if (!res.ok) throw new Error(`TRM unavailable (${res.status})`);
  const body = (await res.json()) as Partial<TrmPayload>;
  if (typeof body.rate !== 'number' || body.rate <= 0) throw new Error('TRM payload had no rate');
  return { rate: body.rate, validFrom: body.validFrom ?? '', validTo: body.validTo ?? '' };
}

export function useTrm() {
  const query = useQuery({
    queryKey: swagKeys.trm,
    queryFn: fetchTrm,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  return {
    rate: query.data?.rate ?? null,
    validTo: query.data?.validTo ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

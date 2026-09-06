/**
 * useENSAvailability - Is `<label>.ethcali.eth` free to register?
 *
 * The label is normalised with ENSIP-15 (viem `normalize`) before it is checked,
 * because the registrar hashes exactly what it is given: an un-normalised label
 * would register a name no resolver can ever find.
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { normalize } from 'viem/ens';
import L2RegistrarABI from '../../frontend/abis/l2registar.json';
import { ENS_CONFIG, CHAIN_IDS, getRpcUrl } from '../../config/constants';
import { labelOf } from '../../utils/ens';

export type AvailabilityStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken' | 'error';

interface Availability {
  /** The ENSIP-15 normalised label, or '' when the input is empty or invalid. */
  label: string;
  status: AvailabilityStatus;
  /** Why the input is invalid, in the user's words. */
  reason: string | null;
}

/** Returns the normalised label, or the reason it cannot be one. */
function validate(raw: string): { label: string; reason: string | null } {
  if (!raw) return { label: '', reason: null };
  if (raw.includes('.')) return { label: '', reason: 'A name is one label. Dots are not allowed.' };
  if (raw.length < 3) return { label: '', reason: 'Use at least 3 characters.' };
  try {
    const normalized = normalize(raw);
    // normalize() of a bare label returns the label; guard against a result
    // that would resolve to something other than what the user typed.
    if (labelOf(`${normalized}.${ENS_CONFIG.parentName}`) !== normalized) {
      return { label: '', reason: 'That name cannot be used.' };
    }
    return { label: normalized, reason: null };
  } catch {
    return { label: '', reason: 'That name has characters ENS does not allow.' };
  }
}

export function useENSAvailability(rawLabel: string): Availability {
  // Debounce so a fast typist does not fire one RPC read per keystroke.
  const [debounced, setDebounced] = useState(rawLabel);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(rawLabel), 300);
    return () => clearTimeout(t);
  }, [rawLabel]);

  const { label, reason } = validate(debounced);

  const query = useQuery({
    queryKey: ['ens-available', label],
    enabled: label.length > 0,
    staleTime: 10_000,
    queryFn: async () => {
      const client = createPublicClient({
        chain: base,
        transport: http(getRpcUrl(CHAIN_IDS.BASE)),
      });
      return (await client.readContract({
        address: ENS_CONFIG.registrar,
        abi: L2RegistrarABI,
        functionName: 'available',
        args: [label],
      })) as boolean;
    },
  });

  if (!debounced) return { label: '', status: 'idle', reason: null };
  if (!label) return { label: '', status: 'invalid', reason };
  if (debounced !== rawLabel || query.isLoading) return { label, status: 'checking', reason: null };
  if (query.isError) return { label, status: 'error', reason: 'Could not reach Base. Try again.' };
  return { label, status: query.data ? 'available' : 'taken', reason: null };
}

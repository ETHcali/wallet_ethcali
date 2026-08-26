/**
 * Bank accounts a campaign publishes for fiat donations.
 *
 * Two hooks on purpose. The public one is what a donor sees on the campaign
 * page and needs no session; the admin one carries a Privy token, sees inactive
 * rows, and can write. Keeping them apart stops an admin-only field from
 * quietly reaching a public component.
 */
import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export type BankAccountType = 'ahorros' | 'corriente' | 'nequi' | 'daviplata' | 'internacional';
export type BankAccountCurrency = 'COP' | 'USD';
export type HolderDocumentType = 'NIT' | 'CC' | 'CE';

/** What a donor is shown. No internal columns. */
export interface PublicBankAccount {
  id: number;
  label: string;
  bank_name: string;
  account_type: BankAccountType;
  account_number: string;
  currency: BankAccountCurrency;
  account_holder: string;
  holder_document_type: HolderDocumentType;
  holder_document_number: string;
  swift_bic: string | null;
  iban: string | null;
  reference_note: string | null;
}

export interface BankAccount extends PublicBankAccount {
  campaign_id: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type BankAccountInput = Partial<Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>>;

const key = (campaignId: number | null) => ['campaign-bank-accounts', campaignId] as const;

/**
 * Resolve an on-chain campaign to its Supabase row id.
 *
 * The vault knows campaign 0; the editorial row that owns story, image and bank
 * accounts has its own identity. Only published rows are visible here, which is
 * correct for the donor-facing panel — an operator editing an unpublished draft
 * goes through the admin API instead, where the service role can see it.
 */
export function useCampaignRowId(
  chainId: number | null,
  vault: string | null,
  onchainCampaignId: number | null
) {
  return useQuery({
    queryKey: ['campaign-row-id', chainId, vault, onchainCampaignId] as const,
    queryFn: async (): Promise<number | null> => {
      if (!isSupabaseConfigured || !supabase || !vault || onchainCampaignId === null) return null;

      const { data, error } = await supabase
        .from('campaigns')
        .select('id')
        .eq('chain_id', chainId)
        .eq('vault_address', vault.toLowerCase())
        .eq('onchain_campaign_id', onchainCampaignId)
        .maybeSingle();

      if (error || !data) return null;
      return (data as { id: number }).id;
    },
    enabled: chainId !== null && Boolean(vault) && onchainCampaignId !== null,
    staleTime: 1000 * 60 * 10,
  });
}

/** Public: active accounts on a published campaign. */
export function useCampaignBankAccounts(campaignId: number | null) {
  return useQuery({
    queryKey: key(campaignId),
    queryFn: async (): Promise<PublicBankAccount[]> => {
      const res = await fetch(`/api/donations/bank-accounts?campaignId=${campaignId}`);
      if (!res.ok) throw new Error(`Could not load bank accounts (${res.status})`);
      const body = await res.json();
      return body.accounts ?? [];
    },
    enabled: campaignId !== null,
    // Account details change rarely; a donor mid-transfer should not see them shift.
    staleTime: 1000 * 60 * 5,
  });
}

/** Operator: full rows plus create / update / delete. */
export function useBankAccountAdmin(campaignId: number | null) {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();
  const adminKey = ['campaign-bank-accounts-admin', campaignId] as const;

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

  const accounts = useQuery({
    queryKey: adminKey,
    queryFn: async (): Promise<BankAccount[]> => {
      const body = await authedFetch(`/api/donations/bank-accounts?campaignId=${campaignId}`);
      return body.accounts ?? [];
    },
    enabled: authenticated && campaignId !== null,
    staleTime: 1000 * 20,
  });

  // Both views must refresh: an operator deactivating an account should see it
  // disappear from the donor-facing list too.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKey });
    queryClient.invalidateQueries({ queryKey: key(campaignId) });
  };

  const create = useMutation({
    mutationFn: (input: BankAccountInput) =>
      authedFetch('/api/donations/bank-accounts', {
        method: 'POST',
        body: JSON.stringify({ ...input, campaign_id: campaignId }),
      }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (patch: BankAccountInput & { id: number }) =>
      authedFetch('/api/donations/bank-accounts', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      authedFetch(`/api/donations/bank-accounts?id=${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { accounts, create, update, remove };
}

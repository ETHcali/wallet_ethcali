import React, { useEffect, useMemo, useState } from 'react';
import { parseUnits, formatUnits } from 'viem';
import {
  useDonationAddresses,
  useCampaignTiers,
  useDonationAdminActions,
} from '../../hooks/donations';
import type { Campaign, DonationToken } from '../../types/donations';

interface CurrencyTierManagerProps {
  campaign: Campaign;
  chainId: number;
  acceptedTokens: string[];
}

interface TierDraft {
  /** Human-readable amount, e.g. "10" or "40000". Parsed with the token's decimals. */
  amount: string;
  receiptTokenId: string;
}

/**
 * Configure which currencies a campaign accepts and what each one's reward
 * thresholds are.
 *
 * Thresholds are set PER CURRENCY on purpose. 10 USDC is 10e6 while a comparable
 * COPm amount is ~40_000e18 — reusing one number across both would make every
 * COPm donation clear the top tier by a factor of ~10^12. This form always parses
 * against the selected token's own decimals and shows the resulting base units so
 * the admin can see what is actually being written on-chain.
 */
const CurrencyTierManager: React.FC<CurrencyTierManagerProps> = ({
  campaign,
  chainId,
  acceptedTokens,
}) => {
  const { tokens } = useDonationAddresses(chainId);
  const { setAcceptedToken, setTiers, pendingAction, error, clearError } =
    useDonationAdminActions(chainId);

  const [selected, setSelected] = useState<DonationToken>(tokens[0]);
  const { data: existingTiers = [] } = useCampaignTiers(
    campaign.id,
    selected?.address ?? null,
    chainId
  );

  const [drafts, setDrafts] = useState<TierDraft[]>([]);

  // Load whatever is already on-chain whenever the currency changes.
  useEffect(() => {
    if (!selected) return;
    setDrafts(
      existingTiers.length > 0
        ? existingTiers.map((t) => ({
            amount: formatUnits(t.minAmount, selected.decimals),
            receiptTokenId: String(t.receiptTokenId),
          }))
        : [{ amount: '', receiptTokenId: '1' }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.address, existingTiers.length]);

  const acceptedSet = useMemo(
    () => new Set(acceptedTokens.map((a) => a.toLowerCase())),
    [acceptedTokens]
  );

  const isAccepted = selected ? acceptedSet.has(selected.address.toLowerCase()) : false;

  const parsedDrafts = useMemo(() => {
    if (!selected) return [];
    return drafts.map((d) => {
      let raw: bigint | null = null;
      try {
        raw = d.amount ? parseUnits(d.amount, selected.decimals) : null;
      } catch {
        raw = null;
      }
      return { ...d, raw };
    });
  }, [drafts, selected]);

  // The contract requires strictly ascending thresholds.
  const ascending = parsedDrafts.every(
    (d, i) => i === 0 || (d.raw !== null && parsedDrafts[i - 1].raw !== null && d.raw > parsedDrafts[i - 1].raw!)
  );
  const allValid = parsedDrafts.every((d) => d.raw !== null && d.raw > 0n);

  const handleSaveTiers = async () => {
    if (!selected) return;
    clearError();
    await setTiers(
      campaign.id,
      selected.address,
      parsedDrafts.map((d) => ({
        minAmount: d.raw as bigint,
        receiptTokenId: Number(d.receiptTokenId || 0),
      }))
    );
  };

  if (!selected) return null;

  return (
    <div className="space-y-4">
      {/* Currency selector */}
      <div className="flex flex-wrap gap-2">
        {tokens.map((t) => {
          const accepted = acceptedSet.has(t.address.toLowerCase());
          return (
            <button
              key={t.address}
              type="button"
              onClick={() => setSelected(t)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                t.address === selected.address
                  ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
              }`}
            >
              {t.symbol}
              <span className={accepted ? 'ml-1 text-green-400' : 'ml-1 text-slate-600'}>
                {accepted ? '●' : '○'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Accept toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 p-3">
        <div>
          <div className="text-sm font-semibold text-white">
            {selected.symbol}{' '}
            <span className="font-normal text-slate-500">
              · {selected.decimals} decimals
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {isAccepted ? 'Accepted for this campaign' : 'Not accepted yet'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAcceptedToken(campaign.id, selected.address, !isAccepted)}
          disabled={pendingAction === 'setAcceptedToken'}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isAccepted
              ? 'border border-slate-600 bg-slate-800 text-slate-300 hover:border-red-500 hover:text-red-400'
              : 'bg-green-500 text-slate-900 hover:bg-green-400'
          }`}
        >
          {pendingAction === 'setAcceptedToken'
            ? 'Saving…'
            : isAccepted
              ? 'Stop accepting'
              : 'Accept'}
        </button>
      </div>

      {/* Tiers */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300">
            Reward tiers · {selected.symbol}
          </h4>
          <button
            type="button"
            onClick={() => setDrafts([...drafts, { amount: '', receiptTokenId: '1' }])}
            className="text-[11px] text-cyan-400 hover:underline"
          >
            + add tier
          </button>
        </div>

        <div className="space-y-2">
          {parsedDrafts.map((draft, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={draft.amount}
                  onChange={(e) => {
                    const next = [...drafts];
                    next[i] = { ...next[i], amount: e.target.value.replace(/[^0-9.]/g, '') };
                    setDrafts(next);
                  }}
                  placeholder={selected.symbol === 'COPm' ? '40000' : '10'}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                />
                {/* Show the real base units so a decimals mistake is visible */}
                <div className="mt-0.5 font-mono text-[10px] text-slate-600">
                  {draft.raw !== null ? `${draft.raw.toString()} base units` : '—'}
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={draft.receiptTokenId}
                onChange={(e) => {
                  const next = [...drafts];
                  next[i] = { ...next[i], receiptTokenId: e.target.value.replace(/[^0-9]/g, '') };
                  setDrafts(next);
                }}
                title="Receipt tokenId minted at this tier"
                className="w-16 self-start rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setDrafts(drafts.filter((_, j) => j !== i))}
                className="self-start px-1 py-1.5 text-xs text-slate-600 hover:text-red-400"
                aria-label="Remove tier"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {!ascending && drafts.length > 1 && (
          <p className="mt-2 text-[11px] text-red-400">
            Tiers must increase from smallest to largest — the contract rejects any other order.
          </p>
        )}

        {error && (
          <p className="mt-2 rounded border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSaveTiers}
          disabled={!allValid || !ascending || pendingAction === 'setTiers'}
          className="mt-3 w-full rounded-lg bg-cyan-500 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {pendingAction === 'setTiers' ? 'Saving…' : `Save ${selected.symbol} tiers`}
        </button>
      </div>
    </div>
  );
};

export default CurrencyTierManager;

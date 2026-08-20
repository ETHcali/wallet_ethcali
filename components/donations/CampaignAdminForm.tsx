import React, { useState } from 'react';
import { isAddress } from 'viem';
import { useDonationAddresses, useDonationAdminActions } from '../../hooks/donations';
import type { CreateCampaignInput } from '../../hooks/donations/useDonationAdmin';

interface CampaignAdminFormProps {
  chainId: number;
  onCreated?: () => void;
}

/** ethcali.eth — the Safe that receives relief funds. */
const ETHCALI_SAFE = '0xB6BDe4fB6dFBad5488Fa31Edf0F3730D9D86da64';

const CampaignAdminForm: React.FC<CampaignAdminFormProps> = ({ chainId, onCreated }) => {
  const { receiptCollection } = useDonationAddresses(chainId);
  const { createCampaign, pendingAction, error, clearError } = useDonationAdminActions(chainId);

  const [form, setForm] = useState<CreateCampaignInput>({
    name: '',
    description: '',
    beneficiary: ETHCALI_SAFE,
    receiptCollection: receiptCollection ?? '',
    autoForward: true,
  });
  const [txHash, setTxHash] = useState<string | null>(null);

  const beneficiaryValid = isAddress(form.beneficiary);
  const isCreating = pendingAction === 'createCampaign';
  const canSubmit = form.name.trim().length > 0 && beneficiaryValid && !isCreating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const hash = await createCampaign({
      ...form,
      receiptCollection:
        form.receiptCollection.trim() ||
        '0x0000000000000000000000000000000000000000',
    });
    if (hash) {
      setTxHash(hash);
      setForm((f) => ({ ...f, name: '', description: '' }));
      onCreated?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400" htmlFor="c-name">
          Campaign name
        </label>
        <input
          id="c-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Cali Earthquake Relief 2026"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400" htmlFor="c-desc">
          Description
        </label>
        <textarea
          id="c-desc"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Emergency relief for families affected by the earthquake"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400" htmlFor="c-beneficiary">
          Beneficiary
        </label>
        <input
          id="c-beneficiary"
          type="text"
          value={form.beneficiary}
          onChange={(e) => setForm({ ...form, beneficiary: e.target.value.trim() })}
          className={`w-full rounded-lg border bg-slate-800 px-3 py-2 font-mono text-xs text-white outline-none ${
            beneficiaryValid ? 'border-slate-700 focus:border-cyan-500' : 'border-red-500/60'
          }`}
        />
        <p className="mt-1 text-[11px] text-slate-500">
          {form.beneficiary.toLowerCase() === ETHCALI_SAFE.toLowerCase()
            ? 'ethcali.eth — the 3-of-5 treasury Safe.'
            : beneficiaryValid
              ? 'Not the ethcali.eth Safe. Double-check this address.'
              : 'Not a valid address.'}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400" htmlFor="c-receipt">
          Receipt collection <span className="font-normal text-slate-600">(optional)</span>
        </label>
        <input
          id="c-receipt"
          type="text"
          value={form.receiptCollection}
          onChange={(e) => setForm({ ...form, receiptCollection: e.target.value.trim() })}
          placeholder="0x… leave blank for no NFT receipts"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-xs text-white outline-none focus:border-cyan-500"
        />
      </div>

      {/* Custody mode — the most consequential choice on this form */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.autoForward}
            onChange={(e) => setForm({ ...form, autoForward: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-cyan-500"
          />
          <span className="text-xs">
            <span className="font-semibold text-white">
              Router mode {form.autoForward ? '(on)' : '(off)'}
            </span>
            <span className="mt-1 block leading-relaxed text-slate-400">
              {form.autoForward
                ? 'Each donation is forwarded to the beneficiary in the same transaction. The contract never holds funds and no admin has custody.'
                : 'Funds accumulate in the contract until an admin withdraws them — still only ever to the beneficiary.'}
            </span>
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {txHash && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-xs text-green-300">
          Campaign created. It will appear in the list once the transaction confirms.
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {isCreating ? 'Creating…' : 'Create campaign'}
      </button>
    </form>
  );
};

export default CampaignAdminForm;

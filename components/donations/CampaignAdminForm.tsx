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
        <label className="mb-1 block text-xs font-semibold text-content-muted" htmlFor="c-name">
          Campaign name
        </label>
        <input
          id="c-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Cali Earthquake Relief 2026"
          className="w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2 text-sm text-content-primary outline-none focus:border-eth-blue"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-content-muted" htmlFor="c-desc">
          Description
        </label>
        <textarea
          id="c-desc"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Emergency relief for families affected by the earthquake"
          className="w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2 text-sm text-content-primary outline-none focus:border-eth-blue"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-content-muted" htmlFor="c-beneficiary">
          Beneficiary
        </label>
        <input
          id="c-beneficiary"
          type="text"
          value={form.beneficiary}
          onChange={(e) => setForm({ ...form, beneficiary: e.target.value.trim() })}
          className={`w-full rounded-control border bg-surface-inset px-3 py-2 font-mono text-xs text-content-primary outline-none ${
            beneficiaryValid ? 'border-line-hairline focus:border-eth-blue' : 'border-signal-reverted/60'
          }`}
        />
        <p className="mt-1 text-[11px] text-content-faint">
          {form.beneficiary.toLowerCase() === ETHCALI_SAFE.toLowerCase()
            ? 'ethcali.eth — the 3-of-5 treasury Safe.'
            : beneficiaryValid
              ? 'Not the ethcali.eth Safe. Double-check this address.'
              : 'Not a valid address.'}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-content-muted" htmlFor="c-receipt">
          Receipt collection <span className="font-normal text-content-faint">(optional)</span>
        </label>
        <input
          id="c-receipt"
          type="text"
          value={form.receiptCollection}
          onChange={(e) => setForm({ ...form, receiptCollection: e.target.value.trim() })}
          placeholder="0x… leave blank for no NFT receipts"
          className="w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2 font-mono text-xs text-content-primary outline-none focus:border-eth-blue"
        />
      </div>

      {/* Custody mode — the most consequential choice on this form */}
      <div className="rounded-control border border-line-hairline bg-surface-slab/60 p-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.autoForward}
            onChange={(e) => setForm({ ...form, autoForward: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-eth-blue"
          />
          <span className="text-xs">
            <span className="font-semibold text-content-primary">
              Router mode {form.autoForward ? '(on)' : '(off)'}
            </span>
            <span className="mt-1 block leading-relaxed text-content-muted">
              {form.autoForward
                ? 'Each donation is forwarded to the beneficiary in the same transaction. The contract never holds funds and no admin has custody.'
                : 'Funds accumulate in the contract until an admin withdraws them — still only ever to the beneficiary.'}
            </span>
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3 text-xs text-signal-reverted">
          {error}
        </div>
      )}

      {txHash && (
        <div className="rounded-control border border-signal-confirmed/40 bg-signal-confirmed/10 p-3 text-xs text-signal-confirmed">
          Campaign created. It will appear in the list once the transaction confirms.
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-control bg-eth-blue py-2.5 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
      >
        {isCreating ? 'Creating…' : 'Create campaign'}
      </button>
    </form>
  );
};

export default CampaignAdminForm;

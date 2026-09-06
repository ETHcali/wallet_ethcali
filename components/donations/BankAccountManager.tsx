/**
 * Operator screen for the fiat accounts a campaign publishes.
 *
 * Everything typed here ends up in front of donors and, for the account holder
 * fields, has to match the entity that signs the donation certificate — a
 * mismatch between the account a donor paid and the NIT on their certificate is
 * exactly what makes a tax claim fail. Hence the explicit holder fields rather
 * than one free-text blob.
 */
import React, { useState } from 'react';
import {
  useBankAccountAdmin,
  type BankAccount,
  type BankAccountInput,
  type BankAccountType,
} from '../../hooks/donations';

interface BankAccountManagerProps {
  /** Supabase campaign row id. Null until a campaign is selected. */
  campaignId: number | null;
}

const ACCOUNT_TYPES: { value: BankAccountType; label: string }[] = [
  { value: 'ahorros', label: 'Ahorros' },
  { value: 'corriente', label: 'Corriente' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'internacional', label: 'Internacional' },
];

const EMPTY: BankAccountInput = {
  label: '',
  bank_name: '',
  account_type: 'ahorros',
  account_number: '',
  currency: 'COP',
  account_holder: '',
  holder_document_type: 'NIT',
  holder_document_number: '',
  swift_bic: '',
  iban: '',
  reference_note: '',
  is_active: true,
  sort_order: 0,
};

const inputClass =
  'w-full rounded-control border border-line-strong bg-surface-slab px-3 py-2 text-sm text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none';
const labelClass = 'mb-1 block text-[11px] uppercase tracking-wide text-content-faint';

const BankAccountManager: React.FC<BankAccountManagerProps> = ({ campaignId }) => {
  const { accounts, create, update, remove } = useBankAccountAdmin(campaignId);
  const [form, setForm] = useState<BankAccountInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const isInternational = form.account_type === 'internacional';

  if (campaignId === null) {
    return (
      <p className="rounded-card border border-line-hairline bg-surface-inset/40 p-4 text-sm text-content-muted">
        This campaign has no editorial row in the index yet, so it cannot hold bank
        accounts. Publish the campaign first.
      </p>
    );
  }

  const set = (patch: Partial<BankAccountInput>) => setForm((f) => ({ ...f, ...patch }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync(form);
      setForm(EMPTY);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleActive = async (account: BankAccount) => {
    setError(null);
    try {
      await update.mutateAsync({ id: account.id, is_active: !account.is_active });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleRemove = async (account: BankAccount) => {
    setError(null);
    try {
      await remove.mutateAsync(account.id);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Existing accounts ─────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-content-primary">Published accounts</h2>

        {accounts.isLoading ? (
          <p className="text-sm text-content-faint">Loading…</p>
        ) : (accounts.data ?? []).length === 0 ? (
          <p className="rounded-card border border-line-hairline bg-surface-inset/40 p-4 text-sm text-content-muted">
            No bank accounts yet. Donors can only give on-chain.
          </p>
        ) : (
          <div className="space-y-2">
            {(accounts.data ?? []).map((account) => (
              <div
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line-hairline bg-surface-inset/50 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-content-primary">
                      {account.bank_name}
                    </span>
                    <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] text-content-muted">
                      {account.currency}
                    </span>
                    {!account.is_active && (
                      <span className="rounded-full border border-signal-pending/40 bg-signal-pending/10 px-2 py-0.5 text-[11px] text-signal-pending">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-xs text-content-muted">
                    {account.account_number}
                  </div>
                  <div className="text-xs text-content-faint">
                    {account.account_holder} · {account.holder_document_type}{' '}
                    {account.holder_document_number}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(account)}
                    disabled={update.isPending}
                    className="rounded-control border border-line-strong px-3 py-1.5 text-xs text-content-secondary transition-colors hover:border-line-strong hover:text-content-primary disabled:opacity-50"
                  >
                    {account.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(account)}
                    disabled={remove.isPending}
                    className="rounded-control border border-signal-reverted/40 px-3 py-1.5 text-xs text-signal-reverted transition-colors hover:bg-signal-reverted/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add ───────────────────────────────────────────────────────────── */}
      <form onSubmit={handleCreate} className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
        <h2 className="mb-4 text-sm font-bold text-content-primary">Add an account</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="ba-bank">Bank</label>
            <input
              id="ba-bank"
              className={inputClass}
              value={form.bank_name ?? ''}
              onChange={(e) => set({ bank_name: e.target.value })}
              placeholder="Bancolombia"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="ba-label">Label</label>
            <input
              id="ba-label"
              className={inputClass}
              value={form.label ?? ''}
              onChange={(e) => set({ label: e.target.value })}
              placeholder="Cuenta principal"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="ba-type">Type</label>
            <select
              id="ba-type"
              className={inputClass}
              value={form.account_type}
              onChange={(e) => set({ account_type: e.target.value as BankAccountType })}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="ba-currency">Currency</label>
            <select
              id="ba-currency"
              className={inputClass}
              value={form.currency}
              onChange={(e) => set({ currency: e.target.value as 'COP' | 'USD' })}
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="ba-number">
              Account number {form.account_type === 'nequi' || form.account_type === 'daviplata'
                ? '(phone)'
                : ''}
            </label>
            <input
              id="ba-number"
              className={`${inputClass} font-mono`}
              value={form.account_number ?? ''}
              onChange={(e) => set({ account_number: e.target.value })}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="ba-holder">Account holder</label>
            <input
              id="ba-holder"
              className={inputClass}
              value={form.account_holder ?? ''}
              onChange={(e) => set({ account_holder: e.target.value })}
              placeholder="Razón social de la ESAL"
              required
            />
          </div>

          <div className="grid grid-cols-[90px_1fr] gap-2">
            <div>
              <label className={labelClass} htmlFor="ba-doctype">Doc</label>
              <select
                id="ba-doctype"
                className={inputClass}
                value={form.holder_document_type}
                onChange={(e) =>
                  set({ holder_document_type: e.target.value as 'NIT' | 'CC' | 'CE' })
                }
              >
                <option value="NIT">NIT</option>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="ba-docnum">Number</label>
              <input
                id="ba-docnum"
                className={`${inputClass} font-mono`}
                value={form.holder_document_number ?? ''}
                onChange={(e) => set({ holder_document_number: e.target.value })}
                required
              />
            </div>
          </div>

          {isInternational && (
            <>
              <div>
                <label className={labelClass} htmlFor="ba-swift">SWIFT / BIC</label>
                <input
                  id="ba-swift"
                  className={`${inputClass} font-mono`}
                  value={form.swift_bic ?? ''}
                  onChange={(e) => set({ swift_bic: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="ba-iban">IBAN</label>
                <input
                  id="ba-iban"
                  className={`${inputClass} font-mono`}
                  value={form.iban ?? ''}
                  onChange={(e) => set({ iban: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="ba-note">
              Instructions for the donor
            </label>
            <input
              id="ba-note"
              className={inputClass}
              value={form.reference_note ?? ''}
              onChange={(e) => set({ reference_note: e.target.value })}
              placeholder="Escribe tu correo en la referencia para recibir tu certificado."
            />
          </div>
        </div>

        {isInternational && !form.swift_bic && !form.iban && (
          <p className="mt-3 text-xs text-signal-pending">
            An international account needs a SWIFT/BIC or an IBAN.
          </p>
        )}

        {error && <p className="mt-3 text-xs text-signal-reverted">{error}</p>}

        <button
          type="submit"
          disabled={create.isPending}
          className="mt-4 rounded-control bg-eth-blue px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
        >
          {create.isPending ? 'Adding…' : 'Add account'}
        </button>
      </form>
    </div>
  );
};

export default BankAccountManager;

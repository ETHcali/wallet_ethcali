/**
 * Bank accounts for donors who are not paying on-chain.
 *
 * Plenty of people in Cali will want to give without touching a wallet, and a
 * bank transfer is how. This panel is display only — a transfer made here is
 * not recorded until it is reconciled from the bank's notification, so nothing
 * on this screen may imply the donation has been received.
 *
 * The account number is the whole point of the panel, so it is mono, selectable
 * and copyable rather than decorative text a donor has to transcribe by hand.
 */
import React, { useState } from 'react';
import { useCampaignBankAccounts, type PublicBankAccount } from '../../hooks/donations';
import { logger } from '../../utils/logger';

interface BankTransferPanelProps {
  /** Supabase campaign row id — not the on-chain campaign id. */
  campaignId: number | null;
}

const ACCOUNT_TYPE_LABELS: Record<PublicBankAccount['account_type'], string> = {
  ahorros: 'Cuenta de ahorros',
  corriente: 'Cuenta corriente',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  internacional: 'International transfer',
};

const CopyableField: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('[BankTransferPanel] copy failed', err);
    }
  };

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className={`break-all text-sm text-slate-200 ${mono ? 'font-mono' : ''}`}>
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg border border-slate-600 px-2 py-1 text-[11px] text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        aria-label={`Copy ${label}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

const BankTransferPanel: React.FC<BankTransferPanelProps> = ({ campaignId }) => {
  const { data: accounts = [], isLoading } = useCampaignBankAccounts(campaignId);

  // No accounts configured is a normal state, not an error — most campaigns are
  // on-chain only. Render nothing rather than an empty box.
  if (isLoading || accounts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
      <h3 className="text-sm font-semibold text-slate-300">Donate by bank transfer</h3>
      <p className="mt-1 text-xs text-slate-500">
        Transferencia bancaria — para donar sin billetera.
      </p>

      <div className="mt-4 space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">{account.bank_name}</div>
              <span className="shrink-0 rounded-full border border-slate-600 px-2 py-0.5 text-[11px] text-slate-400">
                {account.currency}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              {ACCOUNT_TYPE_LABELS[account.account_type]}
              {account.label ? ` · ${account.label}` : ''}
            </div>

            <CopyableField label="Número de cuenta" value={account.account_number} />
            <CopyableField label="Titular" value={account.account_holder} mono={false} />
            <CopyableField
              label={account.holder_document_type}
              value={account.holder_document_number}
            />

            {account.swift_bic && <CopyableField label="SWIFT / BIC" value={account.swift_bic} />}
            {account.iban && <CopyableField label="IBAN" value={account.iban} />}

            {account.reference_note && (
              <p className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs leading-relaxed text-slate-400">
                {account.reference_note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Said plainly, because the on-chain path confirms in seconds and this one
          does not. A donor who expects instant confirmation will otherwise think
          the transfer failed. */}
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Bank transfers are confirmed by hand and will not appear on the donor wall
        immediately. Keep your transfer receipt.
      </p>
    </div>
  );
};

export default BankTransferPanel;

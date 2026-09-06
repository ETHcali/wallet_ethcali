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
        <div className="text-[11px] uppercase tracking-wide text-content-faint">{label}</div>
        <div className={`break-all text-sm text-content-secondary ${mono ? 'font-mono' : ''}`}>
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-control border border-line-strong px-2 py-1 text-[11px] text-content-secondary transition-colors hover:border-line-strong hover:text-content-primary"
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
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-5">
      <h3 className="text-sm font-semibold text-content-secondary">Donate by bank transfer</h3>
      <p className="mt-1 text-xs text-content-faint">
        Transferencia bancaria — para donar sin billetera.
      </p>

      <div className="mt-4 space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="space-y-3 rounded-card border border-line-hairline bg-surface-slab/60 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-content-primary">{account.bank_name}</div>
              <span className="shrink-0 rounded-full border border-line-strong px-2 py-0.5 text-[11px] text-content-muted">
                {account.currency}
              </span>
            </div>

            <div className="text-xs text-content-faint">
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
              <p className="rounded-control border border-line-hairline bg-surface-inset/60 px-3 py-2 text-xs leading-relaxed text-content-muted">
                {account.reference_note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Said plainly, because the on-chain path confirms in seconds and this one
          does not. A donor who expects instant confirmation will otherwise think
          the transfer failed. */}
      <p className="mt-4 text-xs leading-relaxed text-content-faint">
        Bank transfers are confirmed by hand and will not appear on the donor wall
        immediately. Keep your transfer receipt.
      </p>
    </div>
  );
};

export default BankTransferPanel;

import React, { useMemo, useState } from 'react';
import { CheckIcon, CloseIcon } from '../shared/icons';
import { parseUnits, formatUnits } from 'viem';
import { usePrivy } from '@privy-io/react-auth';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useRequireChain } from '../../hooks/useRequireChain';
import SwitchChainButton from '../shared/SwitchChainButton';
import { Sheet, SHEET_BODY } from '../shared/Sheet';
import {
  useDonate,
  useDonationAllowance,
  useDonorBalance,
  useCanDonate,
  useResolveTier,
  useDisplayCurrency,
  useDonationAddresses,
} from '../../hooks/donations';
import type { Campaign, DonationToken } from '../../types/donations';
import { explorerTx } from '../../config/chains';

interface DonateModalProps {
  campaign: Campaign;
  chainId: number;
  onClose: () => void;
}

const QUICK_AMOUNTS: Record<string, string[]> = {
  USDC: ['10', '25', '100'],
  ETH: ['0.01', '0.05', '0.1'],
};

const DonateModal: React.FC<DonateModalProps> = ({ campaign, chainId, onClose }) => {
  const { authenticated, login } = usePrivy();
  const { wallet } = useActiveWallet();
  // The wallet is moved right before signing, through the one switch primitive.
  const chain = useRequireChain(chainId);

  const { tokens } = useDonationAddresses(chainId);
  const { format, formatToken } = useDisplayCurrency();

  const [token, setToken] = useState<DonationToken>(tokens[0]);
  const [amountInput, setAmountInput] = useState('');
  const [message, setMessage] = useState('');

  const {
    approve,
    donate,
    isApproving,
    approveCooldown,
    isDonating,
    error,
    txHash,
    reset,
  } = useDonate(chainId);

  // Parse against the token's OWN decimals. USDC is 6 — a fixed 18 here would
  // silently multiply a USDC donation by 10^12.
  const amount = useMemo(() => {
    if (!amountInput || Number.isNaN(Number(amountInput))) return 0n;
    try {
      return parseUnits(amountInput, token.decimals);
    } catch {
      return 0n;
    }
  }, [amountInput, token.decimals]);

  const { data: allowance = 0n } = useDonationAllowance(token, wallet?.address, chainId);
  const { data: balance = 0n } = useDonorBalance(token, wallet?.address, chainId);
  const { data: canDonate } = useCanDonate(campaign.id, token.address, amount, chainId);
  const { data: rewardTier } = useResolveTier(campaign.id, token.address, amount, chainId);

  const wrongNetwork = Boolean(wallet) && !chain.ready;

  const needsApproval = !token.isNative && amount > 0n && allowance < amount;
  const insufficientBalance = amount > 0n && amount > balance;

  // One primary action at a time, in this order.
  const step: 'connect' | 'switch' | 'approve' | 'donate' = !authenticated
    ? 'connect'
    : wrongNetwork
      ? 'switch'
      : needsApproval
        ? 'approve'
        : 'donate';

  const approveLocked = isApproving || approveCooldown;
  const donateDisabled =
    isDonating ||
    amount <= 0n ||
    insufficientBalance ||
    (canDonate ? !canDonate.allowed : false);

  const handleApprove = async () => {
    try {
      await approve(token, amount);
    } catch {
      // Message is already surfaced through `error`.
    }
  };

  const handleDonate = async () => {
    await donate(campaign.id, token, amount, message.trim());
  };

  const explorerLink = txHash ? explorerTx(chainId, txHash) : undefined;

  // ── Success state ────────────────────────────────────────────────────────
  if (txHash) {
    return (
      <Sheet onClose={() => { reset(); onClose(); }} label="Donation sent">
          <div className={`${SHEET_BODY} px-5 pb-5 pt-4 text-center md:px-6`}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-signal-confirmed/15 text-signal-confirmed">
              <CheckIcon className="h-7 w-7" strokeWidth={2} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-content-primary">Gracias — thank you</h2>
            <p className="mb-4 text-sm text-content-muted">
              Your donation of{' '}
              <span className="font-semibold text-content-primary">{formatToken(amount, token)}</span>{' '}
              is on its way to {campaign.name}.
            </p>

            {rewardTier !== null && rewardTier !== undefined && (
              <p className="mb-4 rounded-control border border-eth-blue/30 bg-eth-blue/10 p-3 text-xs text-eth-blue-text">
                A donation receipt NFT is being minted to your wallet.
              </p>
            )}

            {explorerLink && (
              <a
                href={explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-block py-2 text-xs text-eth-blue-text hover:underline"
              >
                View transaction ↗
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="min-h-tap w-full rounded-control bg-eth-blue py-3 font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
            >
              Done
            </button>
          </div>
      </Sheet>
    );
  }

  const actionError =
    error ||
    (insufficientBalance
      ? `Not enough ${token.symbol} in your wallet.`
      : amount > 0n && canDonate && !canDonate.allowed
        ? canDonate.reason
        : null);

  return (
    <Sheet onClose={onClose} label="Donate" dismissable={!isApproving && !isDonating}>
        {/* ── Header: fixed, never scrolls away ───────────────────────────── */}
        <div className="shrink-0 px-5 pt-1 md:px-6 md:pt-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-content-primary">Donate</h2>
              <p className="truncate text-xs text-content-muted">{campaign.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isApproving || isDonating}
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-content-faint transition-colors hover:text-content-primary disabled:opacity-40"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* ── Scrollable form ─────────────────────────────────────────────── */}
        <div className={`${SHEET_BODY} px-5 md:px-6`}>
          {/* Currency */}
          <label className="mb-2 block text-xs font-semibold text-content-muted">Currency</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {tokens.map((t) => (
              <button
                key={t.address}
                type="button"
                onClick={() => {
                  setToken(t);
                  setAmountInput('');
                }}
                className={`min-h-tap rounded-control border px-4 text-sm font-semibold transition-colors ${
                  t.address === token.address
                    ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                    : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
                }`}
              >
                {t.symbol}
              </button>
            ))}
          </div>

          {/* Amount */}
          <label className="mb-2 block text-xs font-semibold text-content-muted" htmlFor="donate-amount">
            Amount
          </label>
          <div className="mb-2 grid grid-cols-3 gap-2">
            {(QUICK_AMOUNTS[token.symbol] ?? []).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmountInput(preset)}
                className="min-h-tap truncate rounded-control border border-line-hairline bg-surface-inset px-1 text-xs font-semibold text-content-secondary transition-colors hover:border-eth-blue hover:text-eth-blue-text"
              >
                {Number(preset).toLocaleString('en-US')}
              </button>
            ))}
          </div>

          <input
            id="donate-amount"
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            className="mb-1 w-full rounded-control border border-line-hairline bg-surface-inset px-4 py-3 text-lg text-content-primary outline-none focus:border-eth-blue"
          />

          {/* Fiat context — never show a token amount without it */}
          <div className="mb-4 flex items-center justify-between gap-2 text-xs">
            <span className="text-content-faint">
              {amount > 0n ? `≈ ${format(amount, token)}` : ' '}
            </span>
            <span className="truncate text-content-faint">
              Balance: {formatToken(balance, token)}
            </span>
          </div>

          {/* Reward preview, straight from the contract */}
          {rewardTier !== null && rewardTier !== undefined && (
            <div className="mb-4 rounded-control border border-eth-blue/30 bg-eth-blue/10 p-3 text-xs text-eth-blue-text">
              This donation earns a receipt NFT (tier #{rewardTier}).
            </div>
          )}

          {/* Message */}
          <label className="mb-2 block text-xs font-semibold text-content-muted" htmlFor="donate-message">
            Message <span className="font-normal text-content-faint">(optional, public)</span>
          </label>
          {/* text-base, not text-sm: iOS Safari zooms the whole page when a
              focused input is under 16px, and the sheet never recovers. */}
          <input
            id="donate-message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 120))}
            placeholder="Fuerza Cali"
            className="mb-4 w-full rounded-control border border-line-hairline bg-surface-inset px-4 py-2.5 text-base text-content-primary outline-none focus:border-eth-blue md:text-sm"
          />
        </div>

        {/* ── Action: pinned, so the primary button is never scrolled off ─── */}
        <div
          className="shrink-0 border-t border-line-hairline bg-surface-slab px-5 py-4 md:px-6"
        >
          {/* Inline, persistent error next to the action */}
          {actionError && (
            <div className="mb-3 rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3 text-xs text-signal-reverted">
              {actionError}
            </div>
          )}

          {/* Exactly one primary action */}
          {step === 'connect' && (
            <button
              type="button"
              onClick={login}
              className="min-h-tap w-full rounded-control bg-eth-blue py-3 font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
            >
              Connect wallet
            </button>
          )}

          {step === 'switch' && <SwitchChainButton chain={chain} />}

          {step === 'approve' && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={approveLocked || amount <= 0n || insufficientBalance}
              className="min-h-tap w-full rounded-control bg-eth-blue py-3 font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
            >
              {isApproving
                ? 'Approving…'
                : approveCooldown
                  ? 'Confirming approval…'
                  : `Approve ${token.symbol}`}
            </button>
          )}

          {step === 'donate' && (
            <button
              type="button"
              onClick={handleDonate}
              disabled={donateDisabled}
              className="min-h-tap w-full rounded-control bg-eth-blue py-3 font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
            >
              {isDonating
                ? 'Sending…'
                : amount > 0n
                  ? `Donate ${formatToken(amount, token)}`
                  : 'Enter an amount'}
            </button>
          )}

          {!token.isNative && allowance > 0n && !needsApproval && amount > 0n && (
            <p className="mt-2 text-center text-[11px] text-content-faint">
              {formatUnits(allowance, token.decimals)} {token.symbol} already approved
            </p>
          )}
        </div>
    </Sheet>
  );
};

export default DonateModal;

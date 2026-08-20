import React, { useMemo, useState } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { usePrivy, useWallets } from '@privy-io/react-auth';
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
import { EXPLORER_URLS, NETWORK_NAMES, type ChainId } from '../../config/constants';

interface DonateModalProps {
  campaign: Campaign;
  chainId: number;
  onClose: () => void;
}

const QUICK_AMOUNTS: Record<string, string[]> = {
  USDC: ['10', '25', '100'],
  COPm: ['40000', '100000', '400000'],
  ETH: ['0.01', '0.05', '0.1'],
  CELO: ['5', '25', '100'],
};

/**
 * Bottom sheet on phones, centered modal from `sm` up.
 *
 * `dvh` rather than `vh`: on iOS Safari `vh` counts the space behind the
 * address bar, so a 90vh sheet is taller than what you can actually see and
 * the donate button ends up under the browser chrome. `vh` stays as the
 * fallback for browsers without `dvh`.
 */
const OVERLAY =
  'fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4';
const SHEET =
  'flex w-full max-h-[92vh] flex-col rounded-t-2xl border-t border-slate-700 bg-slate-900 ' +
  'supports-[height:1dvh]:max-h-[92dvh] sm:max-h-[90vh] sm:w-auto sm:max-w-md sm:rounded-2xl sm:border';
/** Clears the iPhone home indicator without adding padding on a desktop. */
const SAFE_BOTTOM = 'pb-[max(1rem,env(safe-area-inset-bottom))]';

const DonateModal: React.FC<DonateModalProps> = ({ campaign, chainId, onClose }) => {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets?.[0];

  const { tokens } = useDonationAddresses(chainId);
  const { format, formatToken } = useDisplayCurrency();

  const [token, setToken] = useState<DonationToken>(tokens[0]);
  const [amountInput, setAmountInput] = useState('');
  const [message, setMessage] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

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

  // Parse against the token's OWN decimals. USDC is 6 and COPm is 18 — a fixed
  // 18 here would silently multiply a USDC donation by 10^12.
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

  const walletChainId = wallet?.chainId ? Number(wallet.chainId.split(':').pop()) : undefined;
  const wrongNetwork = Boolean(walletChainId && walletChainId !== chainId);

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

  const handleSwitchNetwork = async () => {
    if (!wallet) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      await wallet.switchChain(chainId);
    } catch (e) {
      setSwitchError(
        `Could not switch to ${NETWORK_NAMES[chainId as ChainId]}. Change it in your wallet and try again.`
      );
    } finally {
      // Cleared in finally so a rejected switch does not lock the button.
      setIsSwitching(false);
    }
  };

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

  const explorer = EXPLORER_URLS[chainId as ChainId];

  // ── Success state ────────────────────────────────────────────────────────
  if (txHash) {
    return (
      <div className={OVERLAY}>
        <div className={SHEET}>
          <div className={`overflow-y-auto px-5 pt-6 text-center sm:px-6 ${SAFE_BOTTOM}`}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-3xl">
              💚
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Gracias — thank you</h2>
            <p className="mb-4 text-sm text-slate-400">
              Your donation of{' '}
              <span className="font-semibold text-white">{formatToken(amount, token)}</span>{' '}
              is on its way to {campaign.name}.
            </p>

            {rewardTier !== null && rewardTier !== undefined && (
              <p className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-300">
                A donation receipt NFT is being minted to your wallet.
              </p>
            )}

            {explorer && (
              <a
                href={`${explorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-block py-2 text-xs text-cyan-400 hover:underline"
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
              className="min-h-[48px] w-full rounded-lg bg-cyan-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-cyan-400"
            >
              Done
            </button>
          </div>
        </div>
      </div>
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
    <div className={OVERLAY}>
      <div className={SHEET}>
        {/* ── Header: fixed, never scrolls away ───────────────────────────── */}
        <div className="shrink-0 px-5 pt-3 sm:px-6 sm:pt-5">
          {/* Grab handle reads as "draggable sheet" on a phone; noise on desktop. */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-700 sm:hidden" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">Donate</h2>
              <p className="truncate text-xs text-slate-400">{campaign.name}</p>
            </div>
            {/* -m-2 p-2 keeps the glyph small but the tap target ~44px. */}
            <button
              type="button"
              onClick={onClose}
              className="-m-2 shrink-0 p-2 text-slate-500 transition-colors hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable form ─────────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
          {/* Currency */}
          <label className="mb-2 block text-xs font-semibold text-slate-400">Currency</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {tokens.map((t) => (
              <button
                key={t.address}
                type="button"
                onClick={() => {
                  setToken(t);
                  setAmountInput('');
                }}
                className={`min-h-[44px] rounded-lg border px-4 text-sm font-semibold transition-colors ${
                  t.address === token.address
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                {t.symbol}
              </button>
            ))}
          </div>

          {/* Amount */}
          <label className="mb-2 block text-xs font-semibold text-slate-400" htmlFor="donate-amount">
            Amount
          </label>
          {/* grid, not flex: COPm presets like 400,000 blow out a flex row on a
              narrow phone. Equal columns keep them readable. */}
          <div className="mb-2 grid grid-cols-3 gap-2">
            {(QUICK_AMOUNTS[token.symbol] ?? []).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmountInput(preset)}
                className="min-h-[44px] truncate rounded-lg border border-slate-700 bg-slate-800 px-1 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500 hover:text-cyan-300"
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
            className="mb-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-lg text-white outline-none focus:border-cyan-500"
          />

          {/* Fiat context — never show a token amount without it */}
          <div className="mb-4 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">
              {amount > 0n ? `≈ ${format(amount, token)}` : ' '}
            </span>
            <span className="truncate text-slate-500">
              Balance: {formatToken(balance, token)}
            </span>
          </div>

          {/* Reward preview, straight from the contract */}
          {rewardTier !== null && rewardTier !== undefined && (
            <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-300">
              This donation earns a receipt NFT (tier #{rewardTier}).
            </div>
          )}

          {/* Message */}
          <label className="mb-2 block text-xs font-semibold text-slate-400" htmlFor="donate-message">
            Message <span className="font-normal text-slate-600">(optional, public)</span>
          </label>
          {/* text-base, not text-sm: iOS Safari zooms the whole page when a
              focused input is under 16px, and the sheet never recovers. */}
          <input
            id="donate-message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 120))}
            placeholder="Fuerza Cali"
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-base text-white outline-none focus:border-cyan-500 sm:text-sm"
          />
        </div>

        {/* ── Action: pinned, so the primary button is never scrolled off ─── */}
        <div
          className={`shrink-0 border-t border-slate-800 bg-slate-900 px-5 pt-4 sm:px-6 ${SAFE_BOTTOM}`}
        >
          {/* Inline, persistent error next to the action */}
          {actionError && (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
              {actionError}
            </div>
          )}

          {/* Exactly one primary action */}
          {step === 'connect' && (
            <button
              type="button"
              onClick={login}
              className="min-h-[48px] w-full rounded-lg bg-cyan-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-cyan-400"
            >
              Connect wallet
            </button>
          )}

          {step === 'switch' && (
            <>
              <button
                type="button"
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                className="min-h-[48px] w-full rounded-lg bg-amber-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isSwitching
                  ? 'Switching…'
                  : `Switch to ${NETWORK_NAMES[chainId as ChainId]}`}
              </button>
              {switchError && (
                <p className="mt-2 text-center text-[11px] text-red-400">{switchError}</p>
              )}
            </>
          )}

          {step === 'approve' && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={approveLocked || amount <= 0n || insufficientBalance}
              className="min-h-[48px] w-full rounded-lg bg-cyan-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
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
              className="min-h-[48px] w-full rounded-lg bg-green-500 py-3 font-semibold text-slate-900 transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isDonating
                ? 'Sending…'
                : amount > 0n
                  ? `Donate ${formatToken(amount, token)}`
                  : 'Enter an amount'}
            </button>
          )}

          {!token.isNative && allowance > 0n && !needsApproval && amount > 0n && (
            <p className="mt-2 text-center text-[11px] text-slate-500">
              {formatUnits(allowance, token.decimals)} {token.symbol} already approved
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonateModal;

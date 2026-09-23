import React, { useMemo, useState } from 'react';
import { formatUnits, isAddress, parseUnits } from 'viem';
import { CameraIcon, ClipboardIcon, CloseIcon } from '../shared/icons';
import SwitchChainButton from '../shared/SwitchChainButton';
import QRScanner from './QRScanner';
import { DEFAULT_CHAIN, explorerTx } from '../../config/chains';
import { useRequireChain } from '../../hooks/useRequireChain';
import { useTokenTransfer } from '../../hooks/useTokenTransfer';
import { formatTokenBalance } from '../../utils/tokenUtils';
import { formatUsd } from '../../utils/money';
import { Sheet, SHEET_BODY } from '../shared/Sheet';

/** One sendable balance. Built from `useBalances`. */
export interface SendOption {
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
}

interface SendTokenModalProps {
  options: SendOption[];
  /** Which token to start on — the row the user tapped. */
  initialSymbol?: string;
  initialRecipient?: string;
  /** USD per whole token, or null when unknown; drives the fiat preview. */
  priceOf: (symbol: string) => number | null;
  onClose: () => void;
  onSent?: () => void;
}

/**
 * Send ETH or an ERC-20 on Ethereum.
 *
 * The transaction pins the chain; the wallet's current network is never
 * consulted. If the wallet is elsewhere, the single primary action becomes
 * "Switch to Ethereum" and the send button only appears once it is there
 * (frontend-ux rule 2).
 */
const SendTokenModal: React.FC<SendTokenModalProps> = ({
  options,
  initialSymbol,
  initialRecipient = '',
  priceOf,
  onClose,
  onSent,
}) => {
  const firstOption = options.find((o) => o.symbol === initialSymbol) ?? options[0];

  const [symbol, setSymbol] = useState<string>(firstOption?.symbol ?? '');
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const chain = useRequireChain(DEFAULT_CHAIN.id);
  const { sendToken, isSending, txHash } = useTokenTransfer();

  const selected = options.find((o) => o.symbol === symbol) ?? options[0];

  // Parse against the token's OWN decimals; a fixed 18 would turn 1 USDC into 10^12.
  const parsedAmount = useMemo(() => {
    if (!selected || !amount) return null;
    try {
      return parseUnits(amount, selected.decimals);
    } catch {
      return null;
    }
  }, [amount, selected]);

  const recipientError =
    recipient && !isAddress(recipient) ? 'That is not a valid Ethereum address.' : null;
  const amountError = !amount
    ? null
    : parsedAmount === null || parsedAmount <= 0n
      ? 'Enter a valid amount.'
      : selected && parsedAmount > selected.balance
        ? `Not enough ${selected.symbol}.`
        : null;

  const price = selected ? priceOf(selected.symbol) : null;
  const usdPreview =
    parsedAmount !== null && selected && price !== null
      ? formatUsd(Number(formatUnits(parsedAmount, selected.decimals)) * price)
      : null;

  const canSend =
    Boolean(selected) &&
    isAddress(recipient) &&
    parsedAmount !== null &&
    parsedAmount > 0n &&
    !amountError &&
    !isSending;

  const handleSend = async () => {
    if (!selected || !canSend) return;
    setError(null);
    try {
      await sendToken({ recipient, amount, symbol: selected.symbol });
      onSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed. Nothing left your wallet.');
    }
  };

  const handlePaste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (isAddress(text)) {
        setRecipient(text);
        setError(null);
      } else {
        setError('The clipboard does not hold a valid address.');
      }
    } catch {
      setError('Could not read the clipboard. Paste the address manually.');
    }
  };

  const explorerLink = txHash ? explorerTx(DEFAULT_CHAIN.id, txHash) : undefined;

  return (
    <>
      <Sheet onClose={onClose} label="Send" dismissable={!isSending}>
        <div className="flex shrink-0 items-center justify-between border-b border-line-hairline px-5 pb-3 pt-1 md:pt-4">
          <h3 className="text-lg font-bold text-content-primary">
            Send{selected && <span className="ml-2 font-mono text-sm font-medium text-content-muted">{selected.symbol}</span>}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-content-faint transition-colors hover:text-content-primary disabled:opacity-40"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {txHash && selected ? (
          <div className="space-y-4 px-5 py-6 text-center">
            <p className="text-sm text-content-primary">
              Sent. {amount} {selected.symbol} is on its way.
            </p>
            <p className="break-all font-mono text-xs text-content-muted">{txHash}</p>
            {explorerLink && (
              <a
                href={explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-mono text-xs text-eth-blue-text hover:underline"
              >
                View on explorer ↗
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-tap w-full rounded-control bg-eth-blue font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className={`${SHEET_BODY} space-y-5 px-5 py-4`}>
              {/* Token */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-content-muted">Token</label>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => {
                    const active = option.symbol === selected?.symbol;
                    const empty = option.balance === 0n;
                    return (
                      <button
                        key={option.symbol}
                        type="button"
                        onClick={() => {
                          setSymbol(option.symbol);
                          setAmount('');
                          setError(null);
                        }}
                        disabled={isSending}
                        className={`flex min-h-tap min-w-[84px] flex-1 flex-col items-center justify-center rounded-control border px-3 transition-colors ${
                          active
                            ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                            : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
                        } ${empty ? 'opacity-60' : ''}`}
                      >
                        <span className="font-mono text-sm font-bold">{option.symbol}</span>
                        <span className="font-mono text-[11px] text-content-faint">
                          {formatTokenBalance(formatUnits(option.balance, option.decimals), 4)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label htmlFor="send-recipient" className="mb-2 block text-xs font-semibold text-content-muted">
                  Recipient
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQRScannerOpen(true)}
                    disabled={isSending}
                    className="flex min-h-tap min-w-tap items-center justify-center rounded-control border border-line-hairline bg-surface-inset text-eth-blue-text transition-colors hover:border-line-brand"
                    title="Scan QR code"
                  >
                    <CameraIcon />
                  </button>
                  <button
                    type="button"
                    onClick={handlePaste}
                    disabled={isSending}
                    className="flex min-h-tap min-w-tap items-center justify-center rounded-control border border-line-hairline bg-surface-inset text-eth-blue-text transition-colors hover:border-line-brand"
                    title="Paste address"
                  >
                    <ClipboardIcon />
                  </button>
                  <input
                    id="send-recipient"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value.trim())}
                    placeholder="0x…"
                    disabled={isSending}
                    className={`min-h-tap w-full rounded-control border bg-surface-inset px-3 font-mono text-base text-content-primary outline-none focus:border-eth-blue sm:text-sm ${
                      recipientError ? 'border-signal-reverted' : 'border-line-hairline'
                    }`}
                  />
                </div>
                {recipientError && <p className="mt-1 text-xs text-signal-reverted">{recipientError}</p>}
              </div>

              {/* Amount */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="send-amount" className="text-xs font-semibold text-content-muted">
                    Amount
                  </label>
                  {selected && (
                    <span className="font-mono text-[11px] text-content-faint">
                      Available {formatTokenBalance(formatUnits(selected.balance, selected.decimals), 6)} {selected.symbol}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    id="send-amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="0.0"
                    disabled={isSending || !selected}
                    className={`min-h-tap w-full rounded-control border bg-surface-inset px-3 font-mono text-lg text-content-primary outline-none focus:border-eth-blue ${
                      amountError ? 'border-signal-reverted' : 'border-line-hairline'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => selected && setAmount(formatUnits(selected.balance, selected.decimals))}
                    disabled={isSending || !selected}
                    className="min-h-tap rounded-control border border-line-hairline bg-surface-inset px-4 font-mono text-xs uppercase text-eth-blue-text transition-colors hover:border-line-brand"
                  >
                    Max
                  </button>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-signal-reverted">{amountError ?? ''}</span>
                  <span className="text-content-faint">{usdPreview ? `≈ ${usdPreview}` : ''}</span>
                </div>
              </div>

              {error && (
                <div className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3 text-xs text-signal-reverted">
                  {error}
                </div>
              )}
            </div>

            {/* Exactly one primary action: switch first, then send */}
            <div className="shrink-0 border-t border-line-hairline px-5 py-4">
              {!chain.ready ? (
                <SwitchChainButton chain={chain} />
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
                >
                  {isSending && (
                    <span className="inline-block h-4 w-4 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {isSending
                    ? 'Sending…'
                    : selected
                      ? `Send ${selected.symbol}`
                      : 'Nothing to send'}
                </button>
              )}
            </div>
          </>
        )}
      </Sheet>

      {isQRScannerOpen && (
        <QRScanner
          onScan={(scanned) => {
            setRecipient(scanned);
            setIsQRScannerOpen(false);
            setError(null);
          }}
          onClose={() => setIsQRScannerOpen(false)}
        />
      )}
    </>
  );
};

export default SendTokenModal;

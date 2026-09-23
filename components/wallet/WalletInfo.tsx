import Image from 'next/image';
import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { getTokenLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { formatUsd } from '../../utils/money';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { useUserNFTs } from '../../hooks/useUserNFTs';
import type { BalanceRow } from '../../hooks/useBalances';
import { ChevronDownIcon, ReceiveIcon, RefreshIcon, SendIcon, SwapIcon } from '../shared/icons';
import SendTokenModal, { type SendOption } from './SendTokenModal';
import QRScanner from './QRScanner';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import { NFTRow } from './NFTRow';

interface WalletInfoProps {
  address: string;
  /** ETH and every registry token, from `useBalances`. */
  rows: BalanceRow[];
  isLoading: boolean;
  /** The read failed: the rows are zeros and must not be shown as balances. */
  isError: boolean;
  onRefresh: () => void;
}

/** Display precision per row: ETH gets 4 places, stablecoins 2. */
function displayAmount(row: BalanceRow): string {
  return formatTokenBalance(formatUnits(row.balance, row.decimals), row.isNative ? 4 : 2);
}

interface TokenRowProps {
  row: BalanceRow;
  usd: number | null;
  loading: boolean;
  onOpen: (symbol: string) => void;
}

/** One token, 60px: logo, name over symbol, amount over dollars. Tapping it opens Send for that token. */
const TokenRow: React.FC<TokenRowProps> = ({ row, usd, loading, onOpen }) => (
  <li>
    <button
      type="button"
      onClick={() => onOpen(row.symbol)}
      disabled={loading}
      className="flex h-[60px] w-full items-center gap-3 px-4 text-left transition-colors duration-base hover:bg-surface-inset active:bg-surface-inset disabled:cursor-default disabled:hover:bg-transparent"
      aria-label={`Send ${row.symbol}`}
    >
      <Image
        src={getTokenLogoUrl(row.symbol)}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full"
        unoptimized
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] font-medium leading-tight text-content-primary">{row.name}</span>
        <span className="mt-0.5 font-mono text-xs leading-tight text-content-faint">{row.symbol}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="font-mono text-[15px] leading-tight tabular-nums text-content-primary">
          {loading ? '…' : displayAmount(row)}
        </span>
        <span className="mt-0.5 font-mono text-xs leading-tight tabular-nums text-content-faint">
          {loading || usd === null ? '—' : formatUsd(usd, { cents: true })}
        </span>
      </span>
    </button>
  </li>
);

interface ActionProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

/** Icon over label, one third of the row each. */
const Action: React.FC<ActionProps> = ({ label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-[76px] flex-col items-center justify-center gap-2 rounded-card border border-line-hairline bg-surface-slab text-sm font-medium text-content-primary transition-colors duration-base hover:border-line-brand active:bg-surface-inset"
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-eth-blue-wash text-eth-blue-text">
      {icon}
    </span>
    {label}
  </button>
);

type Tab = 'tokens' | 'collectibles';

/**
 * The wallet screen, top to bottom: the balance, three actions, the assets.
 * Nothing else — the address lives in Receive, network is always Ethereum.
 */
const WalletInfo: React.FC<WalletInfoProps> = ({ address, rows, isLoading, isError, onRefresh }) => {
  const { getPriceForToken } = useTokenPrices();

  const [tab, setTab] = useState<Tab>('tokens');
  const [showEmpty, setShowEmpty] = useState(false);
  const [sendSymbol, setSendSymbol] = useState<string | null>(null);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);

  const { data: nfts = [], isLoading: isLoadingNFTs, isFetching: isFetchingNFTs, refetch: refetchNFTs } = useUserNFTs();

  /** USD per whole token from CoinGecko. Null when we honestly do not know, and the UI shows a dash rather than $0.00. */
  const priceOf = useCallback(
    (symbol: string): number | null => {
      const { price } = getPriceForToken(symbol);
      return price > 0 ? price : null;
    },
    [getPriceForToken]
  );

  const usdOf = useCallback(
    (row: BalanceRow): number | null => {
      const price = priceOf(row.symbol);
      if (price === null) return null;
      return Number(formatUnits(row.balance, row.decimals)) * price;
    },
    [priceOf]
  );

  const unavailable = isLoading || isError;
  const totalUsd = useMemo(() => rows.reduce((sum, row) => sum + (usdOf(row) ?? 0), 0), [rows, usdOf]);
  const unpriced = !unavailable && rows.some((row) => row.balance > 0n && usdOf(row) === null);

  // Until balances are known every row shows a placeholder; after that the
  // empty ones fold away so the list is what the wallet actually holds.
  const funded = unavailable ? rows : rows.filter((row) => row.balance > 0n);
  const empty = unavailable ? [] : rows.filter((row) => row.balance === 0n);
  const visibleRows = showEmpty ? [...funded, ...empty] : funded;

  const sendOptions: SendOption[] = useMemo(
    () => rows.map((row) => ({ symbol: row.symbol, name: row.name, decimals: row.decimals, balance: row.balance })),
    [rows]
  );

  const openSend = (symbol: string | null) => {
    setSendSymbol(symbol ?? sendOptions.find((o) => o.balance > 0n)?.symbol ?? sendOptions[0]?.symbol ?? null);
    setIsSendOpen(true);
  };

  const handleQRScan = (scanned: string) => {
    setScannedAddress(scanned);
    setIsQRScannerOpen(false);
    openSend(null);
  };

  const refreshing = isLoading || isFetchingNFTs;
  const [whole, cents] = formatUsd(totalUsd, { cents: true }).replace('US$', '').split('.');

  return (
    <div className="mx-auto w-full max-w-xl space-y-5 md:space-y-6">
      {/* ── Balance ─────────────────────────────────────────────────── */}
      <section className="rounded-card border border-line-hairline bg-surface-slab px-5 pb-5 pt-4" aria-label="Total balance">
        <div className="flex items-center justify-between">
          <p className="mb-0 text-sm text-content-muted">Total balance</p>
          <button
            type="button"
            onClick={() => {
              onRefresh();
              void refetchNFTs();
            }}
            disabled={refreshing}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-content-muted transition-colors duration-base hover:bg-surface-inset hover:text-content-primary disabled:opacity-50"
            aria-label="Refresh balances"
          >
            <RefreshIcon className={`h-[18px] w-[18px] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="mb-0 font-mono text-4xl font-bold leading-none tabular-nums tracking-tight text-content-primary">
          {unavailable ? (
            <span className="text-content-faint">{isLoading ? '…' : '—'}</span>
          ) : (
            <>
              <span className="mr-1 align-top text-lg font-medium text-content-muted">US$</span>
              {whole}
              <span className="text-2xl text-content-muted">.{cents}</span>
            </>
          )}
        </p>
        {isError && (
          <p className="mb-0 mt-3 text-sm text-content-muted">
            Balances did not load.{' '}
            <button type="button" onClick={onRefresh} className="font-medium text-eth-blue-text hover:underline">
              Try again
            </button>
          </p>
        )}
        {unpriced && <p className="mb-0 mt-3 text-sm text-content-muted">Some tokens have no price right now and are not counted.</p>}
      </section>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <Action label="Send" icon={<SendIcon className="h-[18px] w-[18px]" />} onClick={() => openSend(null)} />
        <Action label="Receive" icon={<ReceiveIcon className="h-[18px] w-[18px]" />} onClick={() => setIsReceiveOpen(true)} />
        <Action label="Swap" icon={<SwapIcon className="h-[18px] w-[18px]" />} onClick={() => setIsSwapOpen(true)} />
      </div>

      {/* ── Assets ──────────────────────────────────────────────────── */}
      <section aria-labelledby="assets-title" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="assets-title" className="text-lg font-bold text-content-primary">Assets</h2>
          <div className="inline-flex rounded-control bg-surface-inset p-1" role="tablist" aria-label="Asset type">
            {(['tokens', 'collectibles'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`h-9 rounded-chip px-3 text-sm font-medium transition-colors duration-base ${
                  tab === t ? 'bg-surface-ridge text-content-primary' : 'text-content-muted hover:text-content-primary'
                }`}
              >
                {t === 'tokens' ? 'Tokens' : 'Collectibles'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'tokens' ? (
          <div className="overflow-hidden rounded-card border border-line-hairline bg-surface-slab">
            {visibleRows.length > 0 ? (
              <ul className="divide-y divide-line-hairline">
                {visibleRows.map((row) => (
                  <TokenRow key={row.symbol} row={row} usd={unavailable ? null : usdOf(row)} loading={unavailable} onOpen={openSend} />
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="mb-0 text-[15px] font-medium text-content-primary">Nothing here yet</p>
                <p className="mb-0 mt-1 text-sm text-content-muted">Tap Receive to get your address and fund the wallet.</p>
              </div>
            )}
            {empty.length > 0 && (
              <button
                type="button"
                onClick={() => setShowEmpty((v) => !v)}
                aria-expanded={showEmpty}
                className="flex min-h-tap w-full items-center justify-center gap-1.5 border-t border-line-hairline text-sm text-content-muted transition-colors duration-base hover:text-content-primary"
              >
                {showEmpty ? 'Hide empty' : `Show ${empty.length} empty`}
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-base ${showEmpty ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-line-hairline bg-surface-slab">
            {isLoadingNFTs ? (
              <p className="mb-0 px-4 py-6 text-center text-sm text-content-muted">Loading collectibles…</p>
            ) : nfts.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="mb-0 text-[15px] font-medium text-content-primary">No collectibles yet</p>
                <p className="mb-0 mt-1 text-sm text-content-muted">Swag you buy lands here as an NFT.</p>
                <Link
                  href="/swag"
                  className="mt-4 inline-flex min-h-tap items-center rounded-control bg-eth-blue px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
                >
                  Browse swag
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-line-hairline">
                {nfts.map((nft) => (
                  <NFTRow key={`${nft.designAddress}-${nft.tokenId.toString()}`} nft={nft} />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {isQRScannerOpen && <QRScanner onScan={handleQRScan} onClose={() => setIsQRScannerOpen(false)} />}

      {isSendOpen && (
        <SendTokenModal
          options={sendOptions}
          initialSymbol={sendSymbol ?? undefined}
          initialRecipient={scannedAddress ?? ''}
          priceOf={priceOf}
          onClose={() => {
            setIsSendOpen(false);
            setScannedAddress(null);
          }}
          onSent={onRefresh}
        />
      )}

      {isReceiveOpen && (
        <ReceiveModal
          address={address}
          onClose={() => setIsReceiveOpen(false)}
          onScanQR={() => {
            setIsReceiveOpen(false);
            setIsQRScannerOpen(true);
          }}
        />
      )}

      {isSwapOpen && (
        <SwapModal
          userAddress={address}
          onClose={() => setIsSwapOpen(false)}
          onSuccess={() => {
            setIsSwapOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default WalletInfo;

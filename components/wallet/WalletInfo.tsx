import Image from 'next/image';
import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatUnits } from 'viem';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { useUserNFTs } from '../../hooks/useUserNFTs';
import type { BalanceRow } from '../../hooks/useBalances';
import SendTokenModal, { type SendOption } from './SendTokenModal';
import QRScanner from './QRScanner';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import { NFTCard } from './NFTCard';

interface WalletInfoProps {
  address: string;
  /** ETH and every registry token, from `useBalances`. */
  rows: BalanceRow[];
  isLoading: boolean;
  /** The read failed: the rows are zeros and must not be shown as balances. */
  isError: boolean;
  onRefresh: () => void;
}

const formatUsd = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/** Display precision per row: ETH gets 4 places, stablecoins 2. */
function displayAmount(row: BalanceRow): string {
  return formatTokenBalance(formatUnits(row.balance, row.decimals), row.isNative ? 4 : 2);
}

interface TokenRowProps {
  row: BalanceRow;
  usd: number | null;
  loading: boolean;
  onSend: (symbol: string) => void;
}

/** One token: logo, name, amount, fiat, and a Send chip. Nothing to expand. */
const TokenRow: React.FC<TokenRowProps> = ({ row, usd, loading, onSend }) => (
  <li className="flex items-center gap-2 border-b border-line-hairline pr-2 last:border-b-0">
    <div className="flex min-h-tap min-w-0 flex-1 items-center gap-3 px-4 py-2">
      <Image src={getTokenLogoUrl(row.symbol)} alt="" width={32} height={32} className="h-8 w-8 rounded-full" unoptimized />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-content-primary">{row.name}</span>
        <span className="font-mono text-[11px] text-content-faint">{row.symbol}</span>
      </span>
      <span className="flex flex-col items-end">
        <span className="font-mono text-sm text-content-primary">{loading ? '…' : displayAmount(row)}</span>
        <span className="font-mono text-[11px] text-content-faint">
          {loading || usd === null ? '—' : formatUsd(usd)}
        </span>
      </span>
    </div>
    <button
      type="button"
      onClick={() => onSend(row.symbol)}
      disabled={loading}
      className="inline-flex min-h-[36px] shrink-0 items-center rounded-chip border border-line-hairline px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-content-secondary transition-colors hover:border-line-brand hover:text-eth-blue-text disabled:cursor-not-allowed disabled:opacity-50"
      title={`Send ${row.symbol}`}
    >
      Send
    </button>
  </li>
);

const actionButton =
  'inline-flex min-h-tap flex-1 items-center justify-center rounded-control border border-line-strong px-4 font-mono text-xs uppercase tracking-[0.12em] text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text';

const WalletInfo: React.FC<WalletInfoProps> = ({ address, rows, isLoading, isError, onRefresh }) => {
  const { getPriceForToken } = useTokenPrices();

  const [activeTab, setActiveTab] = useState<'tokens' | 'collectibles'>('tokens');
  const [sendSymbol, setSendSymbol] = useState<string | null>(null);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);

  const { data: nfts = [], isLoading: isLoadingNFTs, refetch: refetchNFTs } = useUserNFTs();

  /** USD per whole token from CoinGecko. Null when we honestly do not know, and the UI shows nothing rather than $0.00. */
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

  const totalUsd = useMemo(() => rows.reduce((sum, row) => sum + (usdOf(row) ?? 0), 0), [rows, usdOf]);

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

  return (
    <div className="space-y-4">
      {/* Portfolio header */}
      <div className="rounded-card border border-line-hairline bg-surface-slab p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">Total balance</p>
        <p className="mt-1 font-mono text-3xl font-bold text-content-primary">
          {isLoading || isError ? '…' : formatUsd(totalUsd)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => openSend(null)} className={actionButton}>
            Send
          </button>
          <button type="button" onClick={() => setIsReceiveOpen(true)} className={actionButton}>
            Receive
          </button>
          <button type="button" onClick={() => setIsSwapOpen(true)} className={actionButton}>
            Swap
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-line-hairline">
        {(['tokens', 'collectibles'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`min-h-tap border-b-2 px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              activeTab === tab
                ? 'border-eth-blue text-eth-blue-text'
                : 'border-transparent text-content-muted hover:text-content-primary'
            }`}
          >
            {tab}
          </button>
        ))}
        <button
          type="button"
          onClick={() => (activeTab === 'tokens' ? onRefresh() : refetchNFTs())}
          className="ml-auto min-h-tap px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-content-faint hover:text-content-primary"
        >
          Refresh
        </button>
      </div>

      {activeTab === 'tokens' ? (
        <section className="rounded-card border border-line-hairline bg-surface-slab" aria-label="Balances">
          {isError && (
            <p className="flex items-center justify-between gap-3 border-b border-line-hairline px-4 py-3 font-mono text-xs">
              <span className="text-signal-reverted">Balances not loaded.</span>
              <button type="button" onClick={onRefresh} className="uppercase tracking-[0.12em] text-content-faint hover:text-content-primary">
                Retry
              </button>
            </p>
          )}
          <ul>
            {rows.map((row) => (
              <TokenRow
                key={row.symbol}
                row={row}
                usd={isLoading || isError ? null : usdOf(row)}
                loading={isLoading || isError}
                onSend={openSend}
              />
            ))}
          </ul>
        </section>
      ) : (
        <div className="rounded-card border border-line-hairline bg-surface-slab p-4">
          {isLoadingNFTs ? (
            <Loading size="small" text="Loading collectibles…" />
          ) : nfts.length === 0 ? (
            <div className="py-8 text-center">
              <h4 className="text-base font-semibold text-content-primary">No collectibles yet</h4>
              <p className="mt-1 text-sm text-content-muted">Your NFTs and collectibles will appear here.</p>
              <Link
                href="/swag"
                className="mt-4 inline-flex min-h-tap items-center rounded-control bg-eth-blue px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
              >
                Browse ETH Cali swag
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-content-faint">
                {nfts.length} collectible{nfts.length === 1 ? '' : 's'}
              </p>
              <div className="grid gap-4">
                {nfts.map((nft) => (
                  <NFTCard key={`${nft.designAddress}-${nft.tokenId.toString()}`} nft={nft} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isQRScannerOpen && (
        <QRScanner onScan={handleQRScan} onClose={() => setIsQRScannerOpen(false)} />
      )}

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

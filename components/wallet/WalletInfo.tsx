import Image from 'next/image';
import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatUnits } from 'viem';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { chainsFor } from '../../config/chains';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { useFxRates } from '../../hooks/donations/useDisplayCurrency';
import { useUserNFTs } from '../../hooks/useUserNFTs';
import type { BalanceRow, ChainBalances } from '../../hooks/useChainBalances';
import SendTokenModal, { type SendOption } from './SendTokenModal';
import QRScanner from './QRScanner';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import { NFTCard } from './NFTCard';

interface WalletInfoProps {
  address: string;
  /** One group per chain in `chainsFor('send')`, from `useChainBalances`. */
  balances: ChainBalances[];
  isLoading: boolean;
  onRefresh: () => void;
}

const SWAP_CHAINS = chainsFor('swap');

const formatUsd = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/** Display precision per row: the native coin gets 4 places, stablecoins and pesos 2. */
function displayAmount(row: BalanceRow): string {
  return formatTokenBalance(formatUnits(row.balance, row.decimals), row.isNative ? 4 : 2);
}

const actionButton =
  'inline-flex min-h-tap flex-1 items-center justify-center rounded-control border border-line-strong px-4 font-mono text-xs uppercase tracking-[0.12em] text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text';

const WalletInfo: React.FC<WalletInfoProps> = ({ address, balances, isLoading, onRefresh }) => {
  const { getPriceForToken } = useTokenPrices();
  const { data: fx } = useFxRates();

  const [activeTab, setActiveTab] = useState<'tokens' | 'collectibles'>('tokens');
  const [sendTarget, setSendTarget] = useState<{ chainId: number; symbol: string } | null>(null);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);

  const { data: nfts = [], isLoading: isLoadingNFTs, refetch: refetchNFTs } = useUserNFTs();

  /**
   * USD per whole token. CoinGecko for anything with an id; COPm is a peso, so
   * it is 1 / TRM. Null when we honestly do not know, and the UI shows nothing
   * rather than $0.00.
   */
  const priceOf = useCallback(
    (symbol: string): number | null => {
      if (symbol === 'COPm') return fx?.usdToCop ? 1 / fx.usdToCop : null;
      const { price } = getPriceForToken(symbol);
      return price > 0 ? price : null;
    },
    [getPriceForToken, fx?.usdToCop]
  );

  const usdOf = useCallback(
    (row: BalanceRow): number | null => {
      const price = priceOf(row.symbol);
      if (price === null) return null;
      return Number(formatUnits(row.balance, row.decimals)) * price;
    },
    [priceOf]
  );

  const totalUsd = useMemo(
    () =>
      balances.reduce(
        (sum, group) => sum + group.rows.reduce((s, row) => s + (usdOf(row) ?? 0), 0),
        0
      ),
    [balances, usdOf]
  );

  const sendOptions: SendOption[] = useMemo(
    () =>
      balances.flatMap((group) =>
        group.rows.map((row) => ({
          chainId: group.chain.id,
          chainName: group.chain.name,
          symbol: row.symbol,
          name: row.name,
          decimals: row.decimals,
          balance: row.balance,
        }))
      ),
    [balances]
  );

  const openSend = (target: { chainId: number; symbol: string } | null) => {
    setSendTarget(target ?? sendOptions.find((o) => o.balance > 0n) ?? sendOptions[0] ?? null);
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
          {isLoading ? '…' : formatUsd(totalUsd)}
        </p>
        <p className="mt-1 text-xs text-content-faint">
          Across {balances.length} networks · same address on each
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => openSend(null)} className={actionButton}>
            Send
          </button>
          <button type="button" onClick={() => setIsReceiveOpen(true)} className={actionButton}>
            Receive
          </button>
          {/* Swap only exists on chains with a LI.FI token list. */}
          {SWAP_CHAINS.length > 0 && (
            <button type="button" onClick={() => setIsSwapOpen(true)} className={actionButton}>
              Swap
            </button>
          )}
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
        <div className="space-y-3">
          {balances.map((group) => {
            const groupUsd = group.rows.reduce((s, row) => s + (usdOf(row) ?? 0), 0);
            return (
              <section
                key={group.chain.id}
                className="rounded-card border border-line-hairline bg-surface-slab"
                aria-label={group.chain.name}
              >
                <header className="flex items-center justify-between border-b border-line-hairline px-4 py-3">
                  <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-content-secondary">
                    {group.chain.name}
                  </h3>
                  <span className="font-mono text-xs text-content-muted">
                    {group.pending ? '…' : group.error ? 'Unavailable' : formatUsd(groupUsd)}
                  </span>
                </header>

                {group.error ? (
                  <p className="px-4 py-3 text-xs text-signal-reverted">
                    Could not read {group.chain.name}. Balances here are not shown rather than shown wrong.
                  </p>
                ) : group.pending ? (
                  <div className="px-4 py-4">
                    <Loading size="small" text={`Reading ${group.chain.name}…`} />
                  </div>
                ) : (
                  <ul>
                    {group.rows.map((row) => {
                      const usd = usdOf(row);
                      return (
                        <li key={`${group.chain.id}-${row.symbol}`}>
                          <button
                            type="button"
                            onClick={() => openSend({ chainId: group.chain.id, symbol: row.symbol })}
                            className="flex min-h-tap w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-inset"
                            title={`Send ${row.symbol} on ${group.chain.name}`}
                          >
                            <Image
                              src={getTokenLogoUrl(row.symbol)}
                              alt=""
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full"
                              unoptimized
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm text-content-primary">{row.name}</span>
                              <span className="font-mono text-[11px] text-content-faint">{row.symbol}</span>
                            </span>
                            <span className="flex flex-col items-end">
                              <span className="font-mono text-sm text-content-primary">{displayAmount(row)}</span>
                              <span className="font-mono text-[11px] text-content-faint">
                                {usd === null ? '—' : formatUsd(usd)}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
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
                  <NFTCard key={`${nft.chainId}-${nft.designAddress}-${nft.tokenId.toString()}`} nft={nft} />
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
          initial={sendTarget ?? undefined}
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

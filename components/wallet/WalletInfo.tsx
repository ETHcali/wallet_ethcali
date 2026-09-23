import Image from 'next/image';
import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatUnits } from 'viem';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { chainsFor, type ChainInfo } from '../../config/chains';
import { ChevronDownIcon } from '../shared/icons';
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

/** One token on one chain, with that chain's own read state carried along. */
interface TokenLine {
  chain: ChainInfo;
  row: BalanceRow;
  pending: boolean;
  error: boolean;
  usd: number | null;
}

/** One token across every chain it exists on. */
interface TokenGroup {
  symbol: string;
  name: string;
  isNative: boolean;
  lines: TokenLine[];
  /** Whole tokens summed over the chains that loaded. Chains still pending or failed add nothing. */
  total: number;
  totalUsd: number | null;
  pendingCount: number;
  errorCount: number;
  /** The loaded chain holding the most of this token — where Send starts from the summary row. */
  largest: TokenLine | null;
}

/** The order the summary shows; anything else (CELO) follows in registry order. */
const SYMBOL_ORDER = ['ETH', 'USDC', 'USDT', 'EURC', 'COPm'];

function groupBySymbol(
  balances: ChainBalances[],
  usdOf: (row: BalanceRow) => number | null,
  priceOf: (symbol: string) => number | null
): TokenGroup[] {
  const groups = new Map<string, TokenGroup>();

  for (const chainGroup of balances) {
    for (const row of chainGroup.rows) {
      const line: TokenLine = {
        chain: chainGroup.chain,
        row,
        pending: chainGroup.pending,
        error: chainGroup.error,
        usd: chainGroup.pending || chainGroup.error ? null : usdOf(row),
      };
      const group = groups.get(row.symbol) ?? {
        symbol: row.symbol,
        name: row.name,
        isNative: row.isNative,
        lines: [],
        total: 0,
        totalUsd: null,
        pendingCount: 0,
        errorCount: 0,
        largest: null,
      };
      group.lines.push(line);
      if (line.pending) group.pendingCount += 1;
      else if (line.error) group.errorCount += 1;
      else {
        const whole = Number(formatUnits(row.balance, row.decimals));
        group.total += whole;
        if (!group.largest || whole > Number(formatUnits(group.largest.row.balance, group.largest.row.decimals))) {
          group.largest = line;
        }
      }
      groups.set(row.symbol, group);
    }
  }

  for (const group of groups.values()) {
    const price = priceOf(group.symbol);
    group.totalUsd = price === null ? null : group.total * price;
  }

  const rank = (symbol: string) => {
    const i = SYMBOL_ORDER.indexOf(symbol);
    return i === -1 ? SYMBOL_ORDER.length : i;
  };
  return [...groups.values()].sort((a, b) => rank(a.symbol) - rank(b.symbol));
}

interface TokenRowProps {
  group: TokenGroup;
  onSend: (target: { chainId: number; symbol: string }) => void;
  onRetry: () => void;
}

/**
 * One token, summed across chains, with a disclosure for the per-chain lines.
 * Closed by default and remembers nothing: the state lives here and dies with
 * the row. Tapping the row opens the breakdown; the Send chip on the row
 * starts from the chain holding the most; a breakdown line starts from itself.
 */
const TokenRow: React.FC<TokenRowProps> = ({ group, onSend, onRetry }) => {
  const [open, setOpen] = useState(false);
  const panelId = `balance-${group.symbol}`;
  const loading = group.pendingCount > 0;

  return (
    <li className="border-b border-line-hairline last:border-b-0">
      <div className="flex items-center gap-2 pr-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-tap min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-inset"
        >
          <Image
            src={getTokenLogoUrl(group.symbol)}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
            unoptimized
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm text-content-primary">{group.name}</span>
            <span className="font-mono text-[11px] text-content-faint">
              {group.symbol} · {group.lines.length} network{group.lines.length === 1 ? '' : 's'}
              {group.errorCount > 0 && (
                <span className="text-signal-reverted"> · {group.errorCount} not loaded</span>
              )}
            </span>
          </span>
          <span className="flex flex-col items-end">
            <span className="font-mono text-sm text-content-primary">
              {loading ? '…' : formatTokenBalance(String(group.total), group.isNative ? 4 : 2)}
            </span>
            <span className="font-mono text-[11px] text-content-faint">
              {loading || group.totalUsd === null ? '—' : formatUsd(group.totalUsd)}
            </span>
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-content-faint transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={() => group.largest && onSend({ chainId: group.largest.chain.id, symbol: group.symbol })}
          disabled={!group.largest}
          className="inline-flex min-h-[36px] shrink-0 items-center rounded-chip border border-line-hairline px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-content-secondary transition-colors hover:border-line-brand hover:text-eth-blue-text disabled:cursor-not-allowed disabled:opacity-50"
          title={group.largest ? `Send ${group.symbol} from ${group.largest.chain.name}` : `No ${group.symbol} loaded yet`}
        >
          Send
        </button>
      </div>

      {open && (
        <ul id={panelId} className="border-t border-line-hairline bg-surface-inset/40">
          {group.lines.map((line) => {
            const key = `${line.chain.id}-${line.row.symbol}`;
            if (line.pending) {
              return (
                <li key={key} className="flex min-h-[44px] items-center justify-between px-4 pl-[60px] font-mono text-xs">
                  <span className="text-content-secondary">{line.chain.name}</span>
                  <span className="text-content-faint">Reading…</span>
                </li>
              );
            }
            if (line.error) {
              return (
                <li key={key} className="flex min-h-[44px] items-center justify-between gap-3 px-4 pl-[60px] font-mono text-xs">
                  <span className="text-content-secondary">{line.chain.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-signal-reverted">Not loaded</span>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="uppercase tracking-[0.12em] text-content-faint hover:text-content-primary"
                    >
                      Retry
                    </button>
                  </span>
                </li>
              );
            }
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSend({ chainId: line.chain.id, symbol: line.row.symbol })}
                  className="flex min-h-[44px] w-full items-center justify-between px-4 pl-[60px] text-left transition-colors hover:bg-surface-inset"
                  title={`Send ${line.row.symbol} on ${line.chain.name}`}
                >
                  <span className="font-mono text-xs text-content-secondary">{line.chain.name}</span>
                  <span className="flex flex-col items-end">
                    <span className="font-mono text-xs text-content-primary">{displayAmount(line.row)}</span>
                    <span className="font-mono text-[11px] text-content-faint">
                      {line.usd === null ? '—' : formatUsd(line.usd)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

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

  const tokenGroups = useMemo(() => groupBySymbol(balances, usdOf, priceOf), [balances, usdOf, priceOf]);

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
        <section className="rounded-card border border-line-hairline bg-surface-slab" aria-label="Balances">
          <ul>
            {tokenGroups.map((group) => (
              <TokenRow key={group.symbol} group={group} onSend={openSend} onRetry={onRefresh} />
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

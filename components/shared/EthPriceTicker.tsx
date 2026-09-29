import { EthIcon } from './icons';
import { usePricesQuery } from '../../hooks/useTokenPrices';
import { formatUsd } from '../../utils/money';

/**
 * ETH/USD in the navbar: the diamond, the price, the 24h move. Refreshes
 * every 15 minutes with the shared price query, which is edge-cached at the
 * same interval, so the ticker costs nothing extra.
 *
 * The move is ▲/▼ in neutral text, not green/red: the signal colours are
 * reserved for on-chain state. When no source answers it shows a dash with
 * the reason on hover — never a stale or invented number.
 */
export function EthPriceTicker({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, isError } = usePricesQuery();
  const eth = data?.prices.ethereum;
  const change = eth?.change24h ?? null;

  const title = eth
    ? `ETH ${formatUsd(eth.usd, { cents: true })} · ${data!.source === 'coingecko' ? 'CoinGecko' : 'Coinbase'} · updated ${new Date(
        data!.fetchedAt
      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · refreshes every 15 min`
    : isError
      ? 'ETH price unavailable right now'
      : 'Loading ETH price';

  return (
    <span
      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-chip border border-line-hairline bg-surface-inset/60 px-2.5 font-mono text-[11px] tabular-nums text-content-secondary"
      title={title}
      aria-label={title}
    >
      <EthIcon className="h-4 w-4 text-eth-blue-text" strokeWidth={1.7} />
      <span className="text-content-primary">{eth ? formatUsd(compact ? Math.round(eth.usd) : eth.usd, { cents: !compact }) : isLoading ? '…' : '—'}</span>
      {!compact && change !== null && (
        <span className="text-content-muted">
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

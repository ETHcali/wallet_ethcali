/**
 * USD prices for the assets the app shows, server side.
 *
 * CoinGecko first (it carries the 24h change); Coinbase spot if CoinGecko
 * fails or rate-limits. If both fail this throws — there is no fallback
 * number. A made-up price shown as a real one is worse than no price: the
 * old client-side fallback of $3,500 for ETH overstated every dollar figure
 * by ~31% against the real ~$2,666 on 2026-09-28.
 */
export type PriceId = 'ethereum' | 'usd-coin' | 'tether' | 'euro-coin';

export interface PriceQuote {
  usd: number;
  /** 24h change in percent; null when the source does not give one (Coinbase spot). */
  change24h: number | null;
}

export interface PricesResponse {
  prices: Partial<Record<PriceId, PriceQuote>>;
  source: 'coingecko' | 'coinbase';
  fetchedAt: string;
}

const IDS: readonly PriceId[] = ['ethereum', 'usd-coin', 'tether', 'euro-coin'];
const COINBASE_PAIR: Record<PriceId, string> = {
  ethereum: 'ETH-USD',
  'usd-coin': 'USDC-USD',
  tether: 'USDT-USD',
  'euro-coin': 'EURC-USD',
};
const TIMEOUT_MS = 5000;

const valid = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

async function fromCoinGecko(): Promise<PricesResponse> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${IDS.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
  const prices: PricesResponse['prices'] = {};
  for (const id of IDS) {
    const q = data[id];
    if (q && valid(q.usd)) prices[id] = { usd: q.usd, change24h: typeof q.usd_24h_change === 'number' ? q.usd_24h_change : null };
  }
  if (!prices.ethereum) throw new Error('CoinGecko returned no ETH price');
  return { prices, source: 'coingecko', fetchedAt: new Date().toISOString() };
}

async function fromCoinbase(): Promise<PricesResponse> {
  const prices: PricesResponse['prices'] = {};
  await Promise.all(
    IDS.map(async (id) => {
      try {
        const res = await fetch(`https://api.coinbase.com/v2/prices/${COINBASE_PAIR[id]}/spot`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (!res.ok) return;
        const usd = Number(((await res.json()) as { data?: { amount?: string } }).data?.amount);
        if (valid(usd)) prices[id] = { usd, change24h: null };
      } catch {
        // One missing pair is not fatal; a missing ETH is, below.
      }
    })
  );
  if (!prices.ethereum) throw new Error('Coinbase returned no ETH price');
  return { prices, source: 'coinbase', fetchedAt: new Date().toISOString() };
}

export async function fetchPrices(): Promise<PricesResponse> {
  try {
    return await fromCoinGecko();
  } catch {
    return fromCoinbase();
  }
}

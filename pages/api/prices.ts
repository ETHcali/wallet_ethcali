/**
 * GET /api/prices — USD prices for ETH, USDC, USDT and EURC.
 *
 * Cached at Vercel's edge for 15 minutes, so every visitor shares one
 * upstream call per window instead of each browser hitting CoinGecko's free
 * tier (which rate-limits, and was the reason a fake fallback existed).
 * 503 when no source answers; the UI then shows no price rather than a guess.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchPrices, type PricesResponse } from '../../lib/prices';
import { logger } from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse<PricesResponse | { error: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = await fetchPrices();
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=300');
    return res.status(200).json(body);
  } catch (e) {
    logger.error('[api/prices] every source failed', e);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Prices are unavailable right now' });
  }
}

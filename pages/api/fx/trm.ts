/**
 * TRM — Tasa Representativa del Mercado, the official COP/USD rate.
 *
 * Why this exists rather than pricing COP off CoinGecko: CoinGecko does not
 * support COP at all (it is absent from /simple/supported_vs_currencies), so
 * the previous approach of deriving the rate from an asset quoted in both
 * currencies always failed and silently fell back to a hardcoded 4000 — while
 * the real rate was ~3063, overstating every peso figure on the site by ~31%.
 *
 * It is also the rate a Colombian tax document has to use. A donation in crypto
 * to an ESAL is a donation *en especie*, valued at its commercial value on the
 * date of the donation, and the certificate has to convert to pesos at a rate
 * DIAN recognises. That is the TRM published by the Superintendencia
 * Financiera, not an exchange's mid-price.
 *
 * Source: Superintendencia Financiera via datos.gov.co, dataset 32sa-8pi3.
 *
 *   GET /api/fx/trm                 → the rate in force right now
 *   GET /api/fx/trm?date=2026-08-16 → the rate in force on that date
 *
 * The date form matters: the TRM carries a validity RANGE, not one day. A
 * donation made on Sunday 16 August 2026 is valued at the rate published for
 * 15–18 August. Asking for "the rate on that day" and getting nothing back is
 * the bug this range query avoids.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';

const DATASET = 'https://www.datos.gov.co/resource/32sa-8pi3.json';
const SOURCE = 'superfinanciera-trm';

export interface TrmResponse {
  /** How many COP one USD buys. */
  rate: number;
  /** Inclusive first day this rate is in force, ISO date. */
  validFrom: string;
  /** Inclusive last day this rate is in force, ISO date. */
  validTo: string;
  source: typeof SOURCE;
}

interface TrmRow {
  valor: string;
  vigenciadesde: string;
  vigenciahasta: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function fetchTrm(date?: string): Promise<TrmResponse> {
  const query = date
    ? `?$where=${encodeURIComponent(
        `vigenciadesde <= '${date}T00:00:00' AND vigenciahasta >= '${date}T00:00:00'`
      )}&$limit=1`
    : '?$limit=1&$order=vigenciadesde%20DESC';

  const res = await fetch(`${DATASET}${query}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`datos.gov.co responded ${res.status}`);

  const rows = (await res.json()) as TrmRow[];
  const row = rows[0];
  if (!row) throw new Error(date ? `no TRM published covering ${date}` : 'no TRM rows returned');

  const rate = Number(row.valor);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`unusable TRM value "${row.valor}"`);

  return {
    rate,
    validFrom: row.vigenciadesde.slice(0, 10),
    validTo: row.vigenciahasta.slice(0, 10),
    source: SOURCE,
  };
}

/**
 * Keep a copy of every rate we observe.
 *
 * A certificate issued today may be re-checked years later, and datos.gov.co is
 * not a contract we control. Snapshotting means the peso figure on a document
 * can always be traced to the exact rate and validity window it was computed
 * from. Failing to snapshot must never fail the request — the caller still gets
 * a correct rate.
 */
async function snapshot(trm: TrmResponse): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('fx_rates').upsert(
      {
        base_symbol: 'USD',
        quote_symbol: 'COP',
        rate: trm.rate,
        source: SOURCE,
        observed_at: `${trm.validFrom}T00:00:00Z`,
      },
      { onConflict: 'base_symbol,quote_symbol,source,observed_at', ignoreDuplicates: true }
    );
    if (error) logger.error('[trm] snapshot failed', error);
  } catch (e) {
    logger.error('[trm] snapshot threw', e);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrmResponse | { error: string }>
) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const raw = req.query.date;
  const date = typeof raw === 'string' ? raw : undefined;
  if (date && !ISO_DATE.test(date)) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  }

  try {
    const trm = await fetchTrm(date);
    await snapshot(trm);

    // The TRM changes at most once a day, so this is very cacheable. A historic
    // date is immutable and can be cached far longer than "today".
    res.setHeader(
      'Cache-Control',
      date
        ? 'public, s-maxage=86400, stale-while-revalidate=604800'
        : 'public, s-maxage=3600, stale-while-revalidate=86400'
    );
    return res.status(200).json(trm);
  } catch (e) {
    logger.error('[trm] lookup failed', e);
    // No stale fallback on purpose. A wrong peso figure that looks authoritative
    // is worse than an absent one, especially on a document a donor files.
    return res.status(502).json({ error: (e as Error).message });
  }
}

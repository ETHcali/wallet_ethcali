/**
 * Supabase clients for the donation index.
 *
 * Architecture rule: the chain is the source of truth for money. Supabase holds a
 * derived index plus app-only presentation content, and is never authoritative
 * for a balance or for an authorization decision.
 *
 * Two clients, deliberately separated:
 *   - `supabase`       browser-safe, publishable key, SELECT only (RLS enforced)
 *   - `supabaseAdmin`  server-only, service_role key, used exclusively by the indexer
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the app has been configured with Supabase credentials. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Browser client. Read-only in practice: every table grants SELECT to `anon`
 * and nothing else, so a write attempt fails at the database, not just in the UI.
 *
 * Returns null when unconfigured so the donate flow can fall back to reading
 * directly from the chain rather than crashing.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: { persistSession: false },
    })
  : null;

/**
 * Server-side client with the service_role key. NEVER import this into a
 * component or any file reachable from the browser bundle — service_role
 * bypasses RLS entirely.
 *
 * Only `pages/api/**` may use it.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() must never be called in the browser');
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — the indexer cannot write'
    );
  }

  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

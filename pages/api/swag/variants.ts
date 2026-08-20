/**
 * Swag artwork pipeline — read and update variant state.
 *
 * Admin-only. Uses the service role, so the gate is the only thing standing
 * between the internet and this table; see lib/adminAuth.ts.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { requireAdmin, AdminAuthError } from '../../../lib/adminAuth';
import { logger } from '../../../utils/logger';

/** Only these may be written from the client. status is derived, never sent. */
const WRITABLE = ['drive_url', 'drive_file_id', 'image_cid', 'metadata_cid', 'notes'] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let admin: string;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    const err = e as AdminAuthError;
    return res.status(err.status ?? 401).json({ error: err.message });
  }

  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('swag_variants')
      .select('*')
      .order('sku', { ascending: true })
      .order('token_id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ variants: data ?? [] });
  }

  if (req.method === 'PATCH') {
    const { id, ...rest } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof id !== 'number') {
      return res.status(400).json({ error: 'id is required' });
    }

    const patch: Record<string, unknown> = {};
    for (const key of WRITABLE) {
      if (key in rest) patch[key] = rest[key] === '' ? null : rest[key];
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    // Status is derived from what actually exists, never taken from the
    // client. A CID is the only thing that can promote a variant, which is the
    // same rule the database enforces with a check constraint.
    const { data: current, error: readError } = await supabase
      .from('swag_variants')
      .select('drive_url, metadata_cid, collection_address, status')
      .eq('id', id)
      .maybeSingle();

    if (readError) return res.status(500).json({ error: readError.message });
    if (!current) return res.status(404).json({ error: 'No such variant' });

    const merged = { ...current, ...patch } as {
      drive_url: string | null;
      metadata_cid: string | null;
      collection_address: string | null;
      status: string;
    };

    // 'live' is set by the deploy path, not here — never demote it.
    if (merged.status !== 'live') {
      patch.status = merged.metadata_cid
        ? 'pinned'
        : merged.drive_url
          ? 'artwork_ready'
          : 'draft';
    }

    const { data, error } = await supabase
      .from('swag_variants')
      .update(patch)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    logger.info(`[swag] ${admin} updated variant ${id}: ${Object.keys(patch).join(', ')}`);
    return res.status(200).json({ variant: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Swag artwork pipeline — read and update variant state.
 *
 * Admin-only. Uses the service role, so the gate is the only thing standing
 * between the internet and these tables; see lib/adminAuth.ts.
 *
 * A row here is a design on a chain (swag_variants) joined to the design
 * itself (swag_products). Drive links and notes belong to the per-chain row;
 * the CIDs belong to the design, because the same asset is pinned once and
 * used on every chain.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { requireAdmin, AdminAuthError } from '../../../lib/adminAuth';
import { logger } from '../../../utils/logger';

/** Only these may be written from the client. status is derived, never sent. */
const VARIANT_WRITABLE = ['drive_url', 'drive_file_id', 'notes'] as const;
const PRODUCT_WRITABLE = ['image_cid', 'metadata_cid'] as const;

const PRODUCT_SELECT =
  'product:swag_products(id, sku, category, name_es, name_en, image_path, image_cid, metadata_cid, active)';

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
      .select(`*, ${PRODUCT_SELECT}`)
      .order('chain_id', { ascending: true })
      .order('token_id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ variants: data ?? [] });
  }

  if (req.method === 'PATCH') {
    const { id, ...rest } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof id !== 'number') {
      return res.status(400).json({ error: 'id is required' });
    }

    const variantPatch: Record<string, unknown> = {};
    for (const key of VARIANT_WRITABLE) {
      if (key in rest) variantPatch[key] = rest[key] === '' ? null : rest[key];
    }
    const productPatch: Record<string, unknown> = {};
    for (const key of PRODUCT_WRITABLE) {
      if (key in rest) productPatch[key] = rest[key] === '' ? null : rest[key];
    }
    if (Object.keys(variantPatch).length === 0 && Object.keys(productPatch).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const { data: current, error: readError } = await supabase
      .from('swag_variants')
      .select('product_id, drive_url, status, product:swag_products(metadata_cid)')
      .eq('id', id)
      .maybeSingle();

    if (readError) return res.status(500).json({ error: readError.message });
    if (!current) return res.status(404).json({ error: 'No such variant' });

    const row = current as unknown as {
      product_id: number;
      drive_url: string | null;
      status: string;
      product: { metadata_cid: string | null } | null;
    };

    if (Object.keys(productPatch).length > 0) {
      const { error: productError } = await supabase
        .from('swag_products')
        .update(productPatch)
        .eq('id', row.product_id);
      if (productError) return res.status(500).json({ error: productError.message });
    }

    // Status is derived from what actually exists, never taken from the
    // client. A metadata CID on the design is the only thing that can promote
    // a variant, which is the same rule the database enforces with a trigger.
    // 'live' is set by the deploy path, not here — never demote it.
    const metadataCid =
      'metadata_cid' in productPatch
        ? (productPatch.metadata_cid as string | null)
        : (row.product?.metadata_cid ?? null);
    const driveUrl =
      'drive_url' in variantPatch ? (variantPatch.drive_url as string | null) : row.drive_url;

    if (row.status !== 'live') {
      variantPatch.status = metadataCid ? 'pinned' : driveUrl ? 'artwork_ready' : 'draft';
    }

    const { data, error } = await supabase
      .from('swag_variants')
      .update(variantPatch)
      .eq('id', id)
      .select(`*, ${PRODUCT_SELECT}`)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    const changed = [...Object.keys(productPatch), ...Object.keys(variantPatch)];
    logger.info(`[swag] ${admin} updated variant ${id}: ${changed.join(', ')}`);
    return res.status(200).json({ variant: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

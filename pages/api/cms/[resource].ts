/**
 * Site CMS — create, update and delete the content behind ethcali.org.
 *
 * Admin-only. This route holds the service role, so requireAdmin() is the only
 * thing standing between the internet and the site's content; see lib/adminAuth.ts,
 * which verifies the Privy session and then checks ADMIN_ROLE on chain. The
 * database grants anon and authenticated SELECT and nothing else, so there is no
 * second way in — which is the point.
 *
 * One route rather than four near-identical files. Each resource declares its
 * table, what may be written, and what must be present to create a row; the
 * handler is the same shape for all of them.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { requireAdmin, AdminAuthError } from '../../../lib/adminAuth';
import { logger } from '../../../utils/logger';
import {
  EVENT_KINDS,
  EVENT_ROLES,
  EVENT_SCOPES,
  PARTNER_KINDS,
  VENUE_STATUSES,
} from '../../../types/content';

/** A column whose value must be one of a fixed set, checked before it reaches SQL. */
type EnumRule = { column: string; allowed: readonly string[] };

interface ResourceDef {
  table: string;
  /** Columns the client may set. Anything else in the body is ignored, not rejected. */
  writable: readonly string[];
  /** Columns that must be non-empty to create a row. */
  required: readonly string[];
  /** Server-side enum validation, so a typo returns 400 and not a raw SQL error. */
  enums?: readonly EnumRule[];
  orderBy: { column: string; ascending: boolean };
}

const RESOURCES: Record<string, ResourceDef> = {
  events: {
    table: 'events',
    writable: [
      'slug', 'kind', 'role', 'scope', 'starts_on', 'ends_on', 'city', 'country',
      'venue_id', 'location_url', 'name_es', 'name_en', 'summary_es', 'summary_en',
      'body_es', 'body_en', 'poster_path', 'luma_slug', 'registration_url',
      'rsvp_count', 'social_url', 'recap_url', 'photos_url', 'drive_folder_url',
      'youtube_url', 'is_published',
    ],
    required: ['slug', 'kind', 'role', 'scope', 'starts_on', 'name_es'],
    enums: [
      { column: 'kind', allowed: EVENT_KINDS },
      { column: 'role', allowed: EVENT_ROLES },
      { column: 'scope', allowed: EVENT_SCOPES },
    ],
    orderBy: { column: 'starts_on', ascending: false },
  },
  venues: {
    table: 'venues',
    writable: ['slug', 'name', 'kind', 'status', 'maps_url', 'lat', 'lng', 'is_published'],
    required: ['slug', 'name'],
    enums: [{ column: 'status', allowed: VENUE_STATUSES }],
    orderBy: { column: 'name', ascending: true },
  },
  team: {
    table: 'team_members',
    writable: [
      'slug', 'name', 'role_es', 'role_en', 'status', 'since', 'image_path',
      'linkedin_url', 'twitter_url', 'github_url', 'sort_order', 'is_published',
    ],
    required: ['slug', 'name'],
    orderBy: { column: 'sort_order', ascending: true },
  },
  partners: {
    table: 'partners',
    writable: ['slug', 'name', 'kind', 'logo_path', 'url', 'sort_order', 'is_published'],
    required: ['slug', 'name', 'kind'],
    enums: [{ column: 'kind', allowed: PARTNER_KINDS }],
    orderBy: { column: 'sort_order', ascending: true },
  },
};

/** Mirrors the slug check constraint, so a bad slug fails here with a readable message. */
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Keep only writable columns, and turn '' into null.
 *
 * The empty string matters: an HTML input that has been cleared submits '', and
 * storing that would put a zero-length string where the site checks for null,
 * rendering an empty link rather than hiding the field.
 */
function pickWritable(body: unknown, def: ResourceDef): Record<string, unknown> {
  const source = (body ?? {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const key of def.writable) {
    if (!(key in source)) continue;
    const value = source[key];
    patch[key] = typeof value === 'string' && value.trim() === '' ? null : value;
  }
  return patch;
}

/** Returns an error message, or null when the patch is acceptable. */
function validate(patch: Record<string, unknown>, def: ResourceDef, creating: boolean): string | null {
  if (creating) {
    for (const key of def.required) {
      const value = patch[key];
      if (value === undefined || value === null || value === '') {
        return `${key} is required`;
      }
    }
  }

  for (const rule of def.enums ?? []) {
    const value = patch[rule.column];
    if (value === undefined || value === null) continue;
    if (!rule.allowed.includes(String(value))) {
      return `${rule.column} must be one of: ${rule.allowed.join(', ')}`;
    }
  }

  if (typeof patch.slug === 'string' && !SLUG_RE.test(patch.slug)) {
    return 'slug must be lowercase letters, numbers and single hyphens';
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = String(req.query.resource ?? '');
  const def = RESOURCES[key];
  if (!def) {
    return res.status(404).json({ error: `Unknown resource "${key}"` });
  }

  let admin: string;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    const err = e as AdminAuthError;
    return res.status(err.status ?? 401).json({ error: err.message });
  }

  const supabase = getSupabaseAdmin();

  // The admin list deliberately includes unpublished rows — that is the whole
  // point of a draft. Public reads go through the anon key, where RLS hides them.
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from(def.table)
      .select('*')
      .order(def.orderBy.column, { ascending: def.orderBy.ascending });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ rows: data ?? [] });
  }

  if (req.method === 'POST') {
    const patch = pickWritable(req.body, def);
    const invalid = validate(patch, def, true);
    if (invalid) return res.status(400).json({ error: invalid });

    const { data, error } = await supabase.from(def.table).insert(patch).select().single();

    if (error) {
      // 23505 is unique_violation. Slug collisions are the common case and the
      // one an editor can actually fix, so name it rather than leaking SQL.
      if (error.code === '23505') {
        return res.status(409).json({ error: 'That slug is already taken' });
      }
      return res.status(500).json({ error: error.message });
    }

    logger.info('[cms] created', { table: def.table, slug: patch.slug, admin });
    return res.status(201).json({ row: data });
  }

  if (req.method === 'PATCH') {
    const { id } = (req.body ?? {}) as { id?: unknown };
    if (typeof id !== 'number') return res.status(400).json({ error: 'id is required' });

    const patch = pickWritable(req.body, def);
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const invalid = validate(patch, def, false);
    if (invalid) return res.status(400).json({ error: invalid });

    const { data, error } = await supabase
      .from(def.table)
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'That slug is already taken' });
      }
      return res.status(500).json({ error: error.message });
    }

    logger.info('[cms] updated', { table: def.table, id, admin });
    return res.status(200).json({ row: data });
  }

  // Unpublishing is almost always what an editor means, and it is reversible.
  // A real delete stays available, but it cascades to POAP and NFT rows, so the
  // caller has to ask for it explicitly.
  if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id is required' });
    if (req.query.confirm !== 'true') {
      return res.status(400).json({
        error: 'Deleting is permanent and removes linked POAP and NFT rows. Pass confirm=true, or set is_published=false instead.',
      });
    }

    const { error } = await supabase.from(def.table).delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    logger.info('[cms] deleted', { table: def.table, id, admin });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

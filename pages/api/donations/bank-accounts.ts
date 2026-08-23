/**
 * Fiat donation accounts for a campaign.
 *
 * Reads are public — a donor cannot transfer to an account they cannot see, and
 * RLS already limits the anon role to active accounts on published campaigns.
 * Writes are admin-only and go through the service role, so a published account
 * number can only ever be changed by an operator.
 *
 * Nothing here records money. Amounts raised in fiat will be reconciled from
 * bank notifications into their own table; this one only says where to send it.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getSupabaseAdmin } from '../../../lib/supabase';
import { requireAdmin, AdminAuthError } from '../../../lib/adminAuth';
import { logger } from '../../../utils/logger';

/** Columns an operator may set. Anything else is derived or immutable. */
const WRITABLE = [
  'label',
  'bank_name',
  'account_type',
  'account_number',
  'currency',
  'account_holder',
  'holder_document_type',
  'holder_document_number',
  'swift_bic',
  'iban',
  'reference_note',
  'is_active',
  'sort_order',
] as const;

const REQUIRED = [
  'label',
  'bank_name',
  'account_type',
  'account_number',
  'currency',
  'account_holder',
  'holder_document_number',
] as const;

/** Mirrors the database check constraints so the user gets a real message. */
const ACCOUNT_TYPES = ['ahorros', 'corriente', 'nequi', 'daviplata', 'internacional'];
const CURRENCIES = ['COP', 'USD'];
const DOCUMENT_TYPES = ['NIT', 'CC', 'CE'];

function pick(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of WRITABLE) {
    if (key in body) out[key] = body[key] === '' ? null : body[key];
  }
  return out;
}

function validate(row: Record<string, unknown>, partial: boolean): string | null {
  if (!partial) {
    for (const key of REQUIRED) {
      if (row[key] === undefined || row[key] === null || row[key] === '') {
        return `${key} is required`;
      }
    }
  }
  if (row.account_type !== undefined && !ACCOUNT_TYPES.includes(String(row.account_type))) {
    return `account_type must be one of ${ACCOUNT_TYPES.join(', ')}`;
  }
  if (row.currency !== undefined && !CURRENCIES.includes(String(row.currency))) {
    return `currency must be COP or USD`;
  }
  if (
    row.holder_document_type !== undefined &&
    !DOCUMENT_TYPES.includes(String(row.holder_document_type))
  ) {
    return `holder_document_type must be one of ${DOCUMENT_TYPES.join(', ')}`;
  }
  if (row.account_type === 'internacional' && !row.swift_bic && !row.iban) {
    return 'an international account needs a SWIFT/BIC or IBAN';
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── Public read ──────────────────────────────────────────────────────────
  if (req.method === 'GET' && !req.headers.authorization) {
    if (!supabase) return res.status(503).json({ error: 'Supabase is not configured' });

    const campaignId = Number(req.query.campaignId);
    if (!Number.isInteger(campaignId)) {
      return res.status(400).json({ error: 'campaignId is required' });
    }

    const { data, error } = await supabase
      .from('campaign_bank_accounts')
      .select(
        'id, label, bank_name, account_type, account_number, currency, account_holder, holder_document_type, holder_document_number, swift_bic, iban, reference_note'
      )
      .eq('campaign_id', campaignId)
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ accounts: data ?? [] });
  }

  // ── Everything else is operator-only ─────────────────────────────────────
  let admin: string;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    const err = e as AdminAuthError;
    return res.status(err.status ?? 401).json({ error: err.message });
  }

  const db = getSupabaseAdmin();

  if (req.method === 'GET') {
    const campaignId = Number(req.query.campaignId);
    if (!Number.isInteger(campaignId)) {
      return res.status(400).json({ error: 'campaignId is required' });
    }
    // Operators see inactive rows too; that is the point of the admin view.
    const { data, error } = await db
      .from('campaign_bank_accounts')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ accounts: data ?? [] });
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const campaignId = Number(body.campaign_id);
    if (!Number.isInteger(campaignId)) {
      return res.status(400).json({ error: 'campaign_id is required' });
    }

    const row = pick(body);
    const invalid = validate(row, false);
    if (invalid) return res.status(400).json({ error: invalid });

    const { data, error } = await db
      .from('campaign_bank_accounts')
      .insert({ ...row, campaign_id: campaignId })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    logger.info(`[bank-accounts] ${admin} added account ${data.id} to campaign ${campaignId}`);
    return res.status(201).json({ account: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...rest } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof id !== 'number') return res.status(400).json({ error: 'id is required' });

    const patch = pick(rest);
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    const invalid = validate(patch, true);
    if (invalid) return res.status(400).json({ error: invalid });

    const { data, error } = await db
      .from('campaign_bank_accounts')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'No such account' });
    logger.info(`[bank-accounts] ${admin} updated account ${id}`);
    return res.status(200).json({ account: data });
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id is required' });

    const { error } = await db.from('campaign_bank_accounts').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    logger.info(`[bank-accounts] ${admin} deleted account ${id}`);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

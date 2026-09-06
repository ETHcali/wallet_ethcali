/**
 * Site content admin — the CMS behind ethcali.org.
 *
 * This edits editorial content only. It holds no money and grants no permission:
 * every write goes to /api/cms/*, which re-checks ADMIN_ROLE on chain. What is
 * visible here is a convenience; what is allowed is decided by the contract.
 */
import { useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/admin/AdminShell';
import ContentEditor, { type FieldDef } from '../../components/admin/ContentEditor';
import { useCmsResource, type CmsResource } from '../../hooks/content';
import {
  EVENT_KINDS,
  EVENT_ROLES,
  EVENT_SCOPES,
  PARTNER_KINDS,
  VENUE_STATUSES,
} from '../../types/content';

interface Row {
  id: number;
  [key: string]: unknown;
}

const SLUG_HELP = 'Lowercase, hyphens only. This becomes /events/<slug>.';

const EVENT_FIELDS: readonly FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text', required: true, inList: true, lockedAfterCreate: true, help: SLUG_HELP },
  { key: 'name_es', label: 'Nombre (ES)', type: 'text', required: true, inList: true },
  { key: 'name_en', label: 'Name (EN)', type: 'text', help: 'Optional. Falls back to Spanish.' },
  { key: 'starts_on', label: 'Starts', type: 'date', required: true, inList: true },
  { key: 'ends_on', label: 'Ends', type: 'date', help: 'Only for multi-day events.' },
  { key: 'kind', label: 'Kind', type: 'select', options: EVENT_KINDS, required: true, inList: true },
  { key: 'role', label: 'Our role', type: 'select', options: EVENT_ROLES, required: true, inList: true },
  { key: 'scope', label: 'Scope', type: 'select', options: EVENT_SCOPES, required: true, inList: true, help: 'International means we were there — not that it happened abroad.' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'poster_path', label: 'Poster path', type: 'text', help: 'e.g. /events/2025%2006%2013%20Hackathon.png' },
  { key: 'registration_url', label: 'Registration URL', type: 'text' },
  { key: 'luma_slug', label: 'Luma slug', type: 'text', help: 'The lu.ma/<slug> part, for the embed.' },
  { key: 'rsvp_count', label: 'RSVPs', type: 'number' },
  { key: 'social_url', label: 'Social post', type: 'text' },
  { key: 'recap_url', label: 'Recap', type: 'text' },
  { key: 'photos_url', label: 'Photos', type: 'text' },
  { key: 'youtube_url', label: 'YouTube', type: 'text' },
  { key: 'drive_folder_url', label: 'Drive folder', type: 'text' },
  { key: 'location_url', label: 'Map link', type: 'text' },
  { key: 'summary_es', label: 'Resumen (ES)', type: 'textarea' },
  { key: 'summary_en', label: 'Summary (EN)', type: 'textarea' },
  { key: 'body_es', label: 'Contenido (ES)', type: 'textarea' },
  { key: 'body_en', label: 'Body (EN)', type: 'textarea' },
  { key: 'is_published', label: 'Status', type: 'boolean', inList: true },
];

const VENUE_FIELDS: readonly FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text', required: true, inList: true, lockedAfterCreate: true },
  { key: 'name', label: 'Name', type: 'text', required: true, inList: true },
  { key: 'kind', label: 'Kind', type: 'text', inList: true },
  { key: 'status', label: 'Status', type: 'select', options: VENUE_STATUSES, inList: true },
  { key: 'maps_url', label: 'Maps URL', type: 'text' },
  { key: 'lat', label: 'Latitude', type: 'text', help: 'Both coordinates or neither — one alone is rejected.' },
  { key: 'lng', label: 'Longitude', type: 'text' },
  { key: 'is_published', label: 'Status', type: 'boolean', inList: true },
];

const TEAM_FIELDS: readonly FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text', required: true, inList: true, lockedAfterCreate: true },
  { key: 'name', label: 'Name', type: 'text', required: true, inList: true },
  { key: 'role_es', label: 'Rol (ES)', type: 'text', inList: true },
  { key: 'role_en', label: 'Role (EN)', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'since', label: 'Since', type: 'date' },
  { key: 'image_path', label: 'Image path', type: 'text' },
  { key: 'linkedin_url', label: 'LinkedIn', type: 'text' },
  { key: 'twitter_url', label: 'X / Twitter', type: 'text' },
  { key: 'github_url', label: 'GitHub', type: 'text' },
  { key: 'sort_order', label: 'Order', type: 'number', inList: true },
  { key: 'is_published', label: 'Status', type: 'boolean', inList: true },
];

const PARTNER_FIELDS: readonly FieldDef[] = [
  { key: 'slug', label: 'Slug', type: 'text', required: true, inList: true, lockedAfterCreate: true },
  { key: 'name', label: 'Name', type: 'text', required: true, inList: true },
  { key: 'kind', label: 'Kind', type: 'select', options: PARTNER_KINDS, required: true, inList: true },
  { key: 'url', label: 'URL', type: 'text' },
  { key: 'logo_path', label: 'Logo path', type: 'text' },
  { key: 'sort_order', label: 'Order', type: 'number', inList: true },
  { key: 'is_published', label: 'Status', type: 'boolean', inList: true },
];

const TABS: { id: CmsResource; label: string; fields: readonly FieldDef[] }[] = [
  { id: 'events', label: 'Events', fields: EVENT_FIELDS },
  { id: 'venues', label: 'Venues', fields: VENUE_FIELDS },
  { id: 'team', label: 'Team', fields: TEAM_FIELDS },
  { id: 'partners', label: 'Partners', fields: PARTNER_FIELDS },
];

function cell(row: Row, field: FieldDef): string {
  const value = row[field.key];
  if (field.type === 'boolean') return value ? 'Published' : 'Draft';
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

/**
 * One row's publish toggle. It owns its own pending flag rather than sharing the
 * table's, so toggling one event never freezes the others.
 */
function PublishToggle({
  row,
  onToggle,
}: {
  row: Row;
  onToggle: (next: boolean) => Promise<unknown>;
}) {
  const [pending, setPending] = useState(false);
  const published = row.is_published === true;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await onToggle(!published);
        } finally {
          setPending(false);
        }
      }}
      className={`min-h-[32px] rounded-full px-2.5 text-[10px] font-semibold transition-colors disabled:opacity-50 ${
        published
          ? 'bg-signal-confirmed/15 text-signal-confirmed hover:bg-signal-confirmed/25'
          : 'bg-surface-ridge text-content-secondary hover:bg-surface-ridge'
      }`}
      title={published ? 'Visible on ethcali.org' : 'Hidden from the public site'}
    >
      {pending ? '…' : published ? 'Published' : 'Draft'}
    </button>
  );
}

export default function ContentAdmin() {
  const [tab, setTab] = useState<CmsResource>('events');
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);

  const active = TABS.find((t) => t.id === tab) as (typeof TABS)[number];
  const { rows, isLoading, error, create, update } = useCmsResource<Row>(tab);

  const columns = active.fields.filter((f) => f.inList && f.key !== 'is_published');

  return (
    <>
      <Head>
        <title>Site content · ETH Cali admin</title>
      </Head>
      <AdminShell
        active="content"
        title="Site content"
        subtitle="Events, venues, team and partners for ethcali.org. Publishing here changes the public site."
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setEditing(undefined);
              }}
              className={`min-h-[36px] rounded-full px-3.5 text-xs font-semibold transition-colors ${
                t.id === tab
                  ? 'bg-eth-blue/15 text-eth-blue-text'
                  : 'border border-line-hairline text-content-muted hover:text-content-primary'
              }`}
            >
              {t.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setEditing(null)}
            className="ml-auto min-h-[36px] rounded-full border border-eth-blue/40 px-3.5 text-xs font-semibold text-eth-blue-text transition-colors hover:bg-eth-blue/10"
          >
            + New {active.label.replace(/s$/, '').toLowerCase()}
          </button>
        </div>

        {editing !== undefined && (
          <div className="mb-6 rounded-card border border-line-hairline bg-surface-inset/50 p-4">
            <h2 className="mb-4 text-sm font-semibold text-content-primary">
              {editing === null ? `New ${active.label.replace(/s$/, '').toLowerCase()}` : `Editing ${String(editing.slug ?? editing.id)}`}
            </h2>
            <ContentEditor
              fields={active.fields}
              row={editing}
              onCancel={() => setEditing(undefined)}
              onSave={async (values) =>
                editing === null
                  ? create.mutateAsync(values as Partial<Row>)
                  : update.mutateAsync(values as Partial<Row> & { id: number })
              }
            />
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-control border border-signal-reverted/40 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-content-faint">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-content-faint">Nothing here yet.</p>
        ) : (
          // Wide tables scroll inside their own container; the page itself never
          // scrolls sideways.
          <div className="overflow-x-auto rounded-card border border-line-hairline">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface-inset/60 text-[10px] uppercase tracking-wide text-content-faint">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="px-3 py-2 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line-hairline">
                {rows.map((row) => (
                  <tr key={row.id} className="text-content-secondary">
                    {columns.map((c) => (
                      <td key={c.key} className="max-w-[220px] truncate px-3 py-2" title={cell(row, c)}>
                        {cell(row, c)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <PublishToggle
                        row={row}
                        onToggle={(next) =>
                          update.mutateAsync({ id: row.id, is_published: next } as Partial<Row> & { id: number })
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="text-xs font-semibold text-eth-blue-text hover:text-eth-blue-text"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminShell>
    </>
  );
}

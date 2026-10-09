/**
 * Every event that issues certificates, and a way to start the next one.
 *
 * The events themselves are ethcali.org's (Site content); starting
 * certificates for one creates its certificate settings, prefilled from the
 * event row, and opens it.
 */
import { useState } from 'react';
import Link from 'next/link';
import Button from '../../shared/Button';
import { useAdminApi, inputClass } from './useAdminApi';
import type { CertEventSettings, CertEventsResponse } from '../../../types/certificates';

export interface EventCounts {
  people: number;
  team: number;
  builders: number;
  issued: number;
  emailed: number;
}

export default function EventsIndex({
  data,
  counts,
  onCreated,
}: {
  data: CertEventsResponse;
  counts: Record<string, EventCounts>;
  onCreated: (key: string) => void;
}) {
  const api = useAdminApi();
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (busy || !pick) return;
    setBusy(true);
    setError(null);
    try {
      const { settings } = await api<{ settings: CertEventSettings }>('/api/certificates/admin/events', { method: 'POST', body: { eventId: Number(pick) } });
      onCreated(settings.key);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start certificates');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {data.events.map(({ settings, site }) => {
          const c = counts[settings.key] ?? { people: 0, team: 0, builders: 0, issued: 0, emailed: 0 };
          return (
            <Link
              key={settings.key}
              href={{ pathname: '/admin/certificates', query: { event: settings.key } }}
              className="block rounded-card border border-line-hairline bg-surface-slab p-5 transition-colors hover:border-line-brand"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-eth-blue-text">{settings.eventDates}</p>
              <p className="mt-1 text-lg font-bold text-content-primary">{settings.headline}</p>
              <p className="text-sm text-content-muted">{site.venue ?? site.city ?? '—'}</p>
              <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                {(
                  [
                    ['Builders', c.builders],
                    ['Team', c.team],
                    ['Issued', c.issued],
                    ['Emailed', c.emailed],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-control bg-surface-inset py-2">
                    <dd className="text-lg font-bold text-content-primary">{value}</dd>
                    <dt className="text-[10px] uppercase tracking-wide text-content-faint">{label}</dt>
                  </div>
                ))}
              </dl>
              <p className="mt-3 font-mono text-[11px] text-content-faint">
                {settings.key} · {settings.credentialPrefix}-…
              </p>
            </Link>
          );
        })}
        {data.events.length === 0 && (
          <p className="rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-content-muted">No event issues certificates yet.</p>
        )}
      </div>

      <div className="mt-6 rounded-card border border-line-hairline bg-surface-slab p-5">
        <p className="font-semibold text-content-primary">Start certificates for an event</p>
        <p className="mb-3 text-xs text-content-muted">
          Pick one of ethcali.org&apos;s events. Its certificate settings are prefilled from the event and you edit them next. Missing an event? Add it in Site
          content first.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className={`${inputClass} sm:max-w-md`} aria-label="Event">
            <option value="">Choose an event…</option>
            {data.candidates.map((e) => (
              <option key={e.id} value={e.id}>
                {e.startsOn} · {e.name}
                {e.isPublished ? '' : ' (draft)'}
              </option>
            ))}
          </select>
          <Button size="small" onClick={create} disabled={busy || !pick}>
            {busy ? 'Starting…' : 'Start certificates'}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-signal-reverted">{error}</p>}
      </div>
    </>
  );
}

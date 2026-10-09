/**
 * Event — what the event is (ethcali.org's row, read-only here) and what its
 * certificates say about it (certificate_events, edited here).
 *
 * Diplomas already pinned to IPFS do not change when these do: the warning
 * says so, and the runbook says how to re-pin and re-point a minted token.
 */
import { useState } from 'react';
import Link from 'next/link';
import Button from '../../shared/Button';
import { useAdminApi, inputClass } from './useAdminApi';
import type { CertEventSettings, SiteEventSummary } from '../../../types/certificates';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-content-muted">
      {label}
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-0.5 text-[11px] text-content-faint">{hint}</p>}
    </label>
  );
}

export function PinnedWarning({ pinned }: { pinned: number }) {
  if (pinned === 0) return null;
  return (
    <p className="mb-4 rounded-control border border-signal-pending/40 bg-signal-pending/10 px-3 py-2 text-xs text-signal-pending">
      {pinned} diploma{pinned === 1 ? ' is' : 's are'} already pinned to IPFS. Changes here show on the credential page, new PDFs and new diplomas;
      a pinned image only changes if it is re-pinned and its token re-pointed with Actualizar metadata.
    </p>
  );
}

export default function EventTab({
  settings,
  site,
  pinned,
  onSaved,
}: {
  settings: CertEventSettings;
  site: SiteEventSummary;
  pinned: number;
  onSaved: () => void;
}) {
  const api = useAdminApi();
  const [d, setD] = useState({ ...settings, skillsText: settings.skills.join(', ') });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof d, v: string) => {
    setSaved(false);
    setD((x) => ({ ...x, [k]: v }));
  };

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const { skillsText, ...rest } = d;
      await api('/api/certificates/admin/events', {
        method: 'PUT',
        body: { ...rest, skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean) },
      });
      setSaved(true);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  const text = (k: keyof typeof d) => (d[k] ?? '') as string;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <section className="rounded-card border border-line-hairline bg-surface-slab p-5">
        <p className="text-sm font-semibold text-content-primary">The event on ethcali.org</p>
        <p className="mb-4 text-xs text-content-muted">
          From Site content.{' '}
          <Link href="/admin/content" className="text-eth-blue-text hover:underline">
            Edit it there
          </Link>
          .
        </p>
        <dl className="space-y-2 text-sm">
          {(
            [
              ['Name', site.name],
              ['Kind', site.kind],
              ['Dates', site.endsOn && site.endsOn !== site.startsOn ? `${site.startsOn} → ${site.endsOn}` : site.startsOn],
              ['Venue', site.venue ?? '—'],
              ['City', site.city ?? '—'],
              ['On the site', site.isPublished ? 'Published' : 'Draft'],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-t border-line-hairline pt-2 first:border-t-0 first:pt-0">
              <dt className="text-content-faint">{k}</dt>
              <dd className="text-right text-content-primary">{v}</dd>
            </div>
          ))}
        </dl>
        {site.summary && <p className="mt-4 text-xs leading-relaxed text-content-muted">{site.summary}</p>}
        <a
          href={`https://www.ethcali.org/en/events/${site.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-xs text-eth-blue-text hover:underline"
        >
          View on ethcali.org ↗
        </a>
      </section>

      <section className="rounded-card border border-line-hairline bg-surface-slab p-5">
        <p className="text-sm font-semibold text-content-primary">What its certificates say</p>
        <p className="mb-4 text-xs text-content-muted">Printed on the diploma, the credential page, LinkedIn and the email.</p>
        <PinnedWarning pinned={pinned} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Diploma headline" hint={'Under the name: "at <headline>".'}>
            <input className={inputClass} value={text('headline')} onChange={(e) => set('headline', e.target.value)} />
          </Field>
          <Field label="Chapter line" hint="Small line under the headline. Optional.">
            <input className={inputClass} value={text('chapter')} onChange={(e) => set('chapter', e.target.value)} />
          </Field>
          <Field label="Diploma location" hint="Footer, e.g. Universidad Icesi, Cali.">
            <input className={inputClass} value={text('diplomaLocation')} onChange={(e) => set('diplomaLocation', e.target.value)} />
          </Field>
          <Field label="Event dates" hint="Footer, e.g. Sep 19–20, 2026.">
            <input className={inputClass} value={text('eventDates')} onChange={(e) => set('eventDates', e.target.value)} />
          </Field>
          <Field label="LinkedIn name for builders" hint={'Team roles read "<Role> at <headline>".'}>
            <input className={inputClass} value={text('credentialName')} onChange={(e) => set('credentialName', e.target.value)} />
          </Field>
          <Field label="Title" hint="Claim page and PDF metadata.">
            <input className={inputClass} value={text('title')} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Credential prefix" hint={pinned > 0 ? 'Existing ids keep their prefix; new ones use this.' : 'Credential ids read PREFIX-XXXXXXXX.'}>
            <input className={`${inputClass} font-mono uppercase`} value={text('credentialPrefix')} onChange={(e) => set('credentialPrefix', e.target.value.toUpperCase())} />
          </Field>
          <Field label="LinkedIn skills" hint="Comma-separated; suggested on the claim page.">
            <input className={inputClass} value={d.skillsText} onChange={(e) => set('skillsText', e.target.value)} />
          </Field>
          <Field label="Event name on the credential page" hint={`Empty: "${site.name}".`}>
            <input className={inputClass} value={text('eventName')} onChange={(e) => set('eventName', e.target.value)} />
          </Field>
          <Field label="Event link on the credential page" hint="Empty: the event's page on ethcali.org.">
            <input className={inputClass} value={text('eventUrl')} placeholder="https://" onChange={(e) => set('eventUrl', e.target.value)} />
          </Field>
          <Field label="Venue on the credential page" hint={`Empty: "${site.venue ?? '—'}".`}>
            <input className={inputClass} value={text('venueLabel')} onChange={(e) => set('venueLabel', e.target.value)} />
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {saved && <span className="text-sm text-signal-confirmed">Saved. Check it on the Certificate tab.</span>}
          {error && <span className="text-sm text-signal-reverted">{error}</span>}
        </div>
      </section>
    </div>
  );
}

/**
 * Certificate — what the diploma will look like, before anyone is pinned.
 *
 * Two previews, both rendered by the same function that makes the real PDF:
 * a sample person in any role (POST /api/certificates/admin/preview, from the
 * event's current settings and sponsors), or a real person on the list (the
 * public /api/certificates/<id>/pdf, cache-busted so an edit shows at once).
 */
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../../shared/Button';
import { CERT_ROLES, credentialPdfPath, roleCredentialName, type CertEvent, type CertRole } from '../../../lib/certificates/events';
import { inputClass } from './useAdminApi';
import type { AdminCertificate } from '../../../types/certificates';

export default function PreviewTab({ ev, rows }: { ev: CertEvent; rows: AdminCertificate[] }) {
  const { getAccessToken } = usePrivy();
  const [mode, setMode] = useState<'sample' | 'person'>('sample');
  const [role, setRole] = useState<CertRole>('builder');
  const [name, setName] = useState('Camila Rodríguez');
  const [project, setProject] = useState('Sample Project');
  const [person, setPerson] = useState(rows[0]?.credentialId ?? '');
  const [src, setSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs hold the PDF in memory until revoked.
  useEffect(() => () => {
    if (src?.startsWith('blob:')) URL.revokeObjectURL(src);
  }, [src]);

  async function render() {
    if (busy) return;
    setError(null);
    if (mode === 'person') {
      if (!person) return;
      setSrc(`${credentialPdfPath(person)}?v=${Date.now()}`);
      return;
    }
    setBusy(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/certificates/admin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event: ev.key, role, memberName: name, projectName: project }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Preview failed (${res.status})`);
      }
      setSrc(URL.createObjectURL(await res.blob()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed');
    } finally {
      setBusy(false);
    }
  }

  const missingLogos = ev.sponsors.filter((s) => !s.printLogo);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="space-y-4 rounded-card border border-line-hairline bg-surface-slab p-5">
        <div>
          <p className="text-sm font-semibold text-content-primary">What it prints</p>
          <dl className="mt-2 space-y-1.5 text-xs">
            <div>
              <dt className="text-content-faint">Heading</dt>
              <dd className="text-content-primary">{CERT_ROLES[role].heading}</dd>
            </div>
            <div>
              <dt className="text-content-faint">Line</dt>
              <dd className="text-content-primary">
                {role === 'builder' ? `built and shipped <project>` : `contributed as ${CERT_ROLES[role].label.en}`} · at {ev.headline}
              </dd>
            </div>
            <div>
              <dt className="text-content-faint">Footer</dt>
              <dd className="text-content-primary">
                {ev.location} · {ev.eventDates}
              </dd>
            </div>
            <div>
              <dt className="text-content-faint">LinkedIn</dt>
              <dd className="text-content-primary">{roleCredentialName(ev, role)}</dd>
            </div>
            <div>
              <dt className="text-content-faint">Sponsors</dt>
              <dd className="text-content-primary">{ev.sponsors.map((s) => s.name).join(' · ') || 'none'}</dd>
            </div>
          </dl>
          {missingLogos.length > 0 && (
            <p className="mt-2 text-xs text-signal-reverted">Skipped for lack of a print logo: {missingLogos.map((s) => s.name).join(', ')}.</p>
          )}
        </div>

        <div className="flex gap-1">
          {(['sample', 'person'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`min-h-[36px] flex-1 rounded-full px-3 text-xs font-semibold ${
                mode === m ? 'bg-eth-blue/15 text-eth-blue-text' : 'border border-line-hairline text-content-muted hover:text-content-primary'
              }`}
            >
              {m === 'sample' ? 'Sample' : 'A real person'}
            </button>
          ))}
        </div>

        {mode === 'sample' ? (
          <div className="space-y-3">
            <label className="block text-xs text-content-muted">
              Role
              <select value={role} onChange={(e) => setRole(e.target.value as CertRole)} className={`mt-1 ${inputClass}`}>
                {(Object.keys(CERT_ROLES) as CertRole[]).map((r) => (
                  <option key={r} value={r}>
                    {CERT_ROLES[r].label.en}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-content-muted">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${inputClass}`} />
            </label>
            {role === 'builder' && (
              <label className="block text-xs text-content-muted">
                Project
                <input value={project} onChange={(e) => setProject(e.target.value)} className={`mt-1 ${inputClass}`} />
              </label>
            )}
          </div>
        ) : (
          <label className="block text-xs text-content-muted">
            Person
            <select value={person} onChange={(e) => setPerson(e.target.value)} className={`mt-1 ${inputClass}`}>
              {rows.map((r) => (
                <option key={r.credentialId} value={r.credentialId}>
                  {r.memberName} · {r.projectName ?? CERT_ROLES[r.role].label.en}
                </option>
              ))}
            </select>
            {rows.length === 0 && <span className="mt-1 block text-content-faint">Nobody on this event yet.</span>}
          </label>
        )}

        <Button onClick={render} disabled={busy || (mode === 'person' && !person)} fullWidth>
          {busy ? 'Rendering…' : 'Preview diploma'}
        </Button>
        {error && <p className="text-sm text-signal-reverted">{error}</p>}
      </section>

      <section className="min-h-[420px] overflow-hidden rounded-card border border-line-hairline bg-surface-void">
        {src ? (
          <iframe title="Diploma preview" src={src} className="h-[70vh] min-h-[420px] w-full" />
        ) : (
          <div className="flex h-full min-h-[420px] items-center justify-center p-6 text-center text-sm text-content-muted">
            Choose a sample or a person and press Preview diploma.
          </div>
        )}
      </section>
    </div>
  );
}

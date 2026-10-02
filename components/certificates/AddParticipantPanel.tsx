/**
 * Add one person to an event's roster from the admin page — step 1 of the
 * runbook without SQL. Name, email(s), role; a project for builders. By
 * default the server also finds or creates their ETH Cali wallet from the
 * email, so the certificate can be pinned and issued right away; they can
 * still sign in and change it until it is issued.
 */
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../shared/Button';
import { CERT_EVENTS, CERT_ROLES, type CertRole } from '../../lib/certificates/events';
import { truncateAddress } from '../../utils/linkedAccounts';
import type { AddParticipantBody, AddParticipantResponse } from '../../types/certificates';

const field =
  'w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2.5 text-sm text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none';

export default function AddParticipantPanel({ onAdded }: { onAdded: () => void }) {
  const { getAccessToken } = usePrivy();
  const events = Object.keys(CERT_EVENTS);
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState(events[events.length - 1] ?? '');
  const [role, setRole] = useState<CertRole>('organizer');
  const [memberName, setMemberName] = useState('');
  const [emails, setEmails] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [createWallet, setCreateWallet] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<AddParticipantResponse | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const list = emails.split(/[,\s]+/).map((e) => e.trim()).filter(Boolean);
      const body: AddParticipantBody = {
        event,
        role,
        memberName,
        email: list[0] ?? '',
        emails: list.slice(1),
        createWallet,
        ...(role === 'builder' ? { projectName, projectSlug } : {}),
      };
      const token = await getAccessToken();
      const res = await fetch('/api/certificates/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as AddParticipantResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Could not add (${res.status})`);
      setDone(data);
      setMemberName('');
      setEmails('');
      setProjectName('');
      setProjectSlug('');
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add this person.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-card border border-line-hairline bg-surface-slab p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-content-primary">Add a person</p>
          <p className="text-xs text-content-muted">
            Team or builder. Creates the row, the credential id and, by default, their ETH Cali wallet from the email.
          </p>
        </div>
        <Button variant="secondary" size="small" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close' : 'Add a person'}
        </Button>
      </div>

      {open && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="block text-xs text-content-muted">
            Event
            <select value={event} onChange={(e) => setEvent(e.target.value)} className={`mt-1 ${field}`}>
              {events.map((k) => (
                <option key={k} value={k}>
                  {CERT_EVENTS[k].headline}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-content-muted">
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as CertRole)} className={`mt-1 ${field}`}>
              {(Object.keys(CERT_ROLES) as CertRole[]).map((r) => (
                <option key={r} value={r}>
                  {CERT_ROLES[r].label.en}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-content-muted">
            Full name
            <input value={memberName} onChange={(e) => setMemberName(e.target.value)} required placeholder="Camila Rodríguez" className={`mt-1 ${field}`} />
          </label>
          <label className="block text-xs text-content-muted">
            Email(s) — the first is the primary; separate several with commas
            <input value={emails} onChange={(e) => setEmails(e.target.value)} required placeholder="camila@ethcali.org, camila@uni.edu.co" className={`mt-1 ${field}`} />
          </label>
          {role === 'builder' && (
            <>
              <label className="block text-xs text-content-muted">
                Project name
                <input value={projectName} onChange={(e) => setProjectName(e.target.value)} required placeholder="Phycos" className={`mt-1 ${field}`} />
              </label>
              <label className="block text-xs text-content-muted">
                Devfolio project slug
                <input value={projectSlug} onChange={(e) => setProjectSlug(e.target.value)} required placeholder="phycos-a1b2" className={`mt-1 ${field}`} />
              </label>
            </>
          )}
          <label className="flex items-center gap-2 text-xs text-content-secondary sm:col-span-2">
            <input type="checkbox" checked={createWallet} onChange={(e) => setCreateWallet(e.target.checked)} className="h-4 w-4 accent-eth-blue" />
            Create their ETH Cali wallet now from the email (they can change it until the certificate is issued)
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" size="small" disabled={busy}>
              {busy ? (createWallet ? 'Adding and creating wallet…' : 'Adding…') : 'Add'}
            </Button>
          </div>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-signal-reverted">{error}</p>}
      {done && (
        <p className="mt-3 text-xs text-signal-confirmed">
          Added {done.certificate.memberName} as {CERT_ROLES[done.certificate.role].label.en} ·{' '}
          <span className="font-mono">{done.certificate.credentialId}</span>
          {done.certificate.wallet ? (
            <>
              {' '}· wallet <span className="font-mono">{truncateAddress(done.certificate.wallet)}</span>
              {done.walletCreated ? ' (new)' : ' (existing)'}
            </>
          ) : (
            ' · no wallet yet; they claim at /certificate'
          )}
          . Next: pin, then issue.
        </p>
      )}
    </div>
  );
}

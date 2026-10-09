/**
 * The team, ready to certify.
 *
 * Every member of team_members (the public about-page roster) with their
 * private contact (team_member_contacts) and the certificates they already
 * hold for the chosen event. The admin fixes an email inline, picks a role
 * per person (defaulted from their team status), ticks who gets one, and
 * presses Add: one POST /api/certificates/admin/participants per person, in
 * order, each creating the row, the credential id and their ETH Cali wallet
 * from the email. Someone already holding that role's certificate for the
 * event is shown as such and cannot be added twice.
 */
import { useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import Button from '../shared/Button';
import { CheckIcon } from '../shared/icons';
import { CERT_ROLES, type CertEvent, type CertRole } from '../../lib/certificates/events';
import type {
  AddParticipantBody,
  AddParticipantResponse,
  TeamForCertsResponse,
  TeamMemberForCerts,
} from '../../types/certificates';

const field =
  'rounded-control border border-line-hairline bg-surface-inset px-2.5 py-1.5 text-xs text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none';

/** The role a team status most likely played at an event; the admin can change it per person. */
function defaultRole(status: string | null): CertRole {
  if (!status) return 'organizer';
  return /volunt/i.test(status) ? 'volunteer' : 'organizer';
}

function ContactCell({
  member,
  onSaved,
}: {
  member: TeamMemberForCerts;
  onSaved: () => void;
}) {
  const { getAccessToken } = usePrivy();
  const [value, setValue] = useState(member.contact?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setValue(member.contact?.email ?? ''), [member.contact?.email]);

  async function save() {
    const email = value.trim().toLowerCase();
    if (email === (member.contact?.email ?? '')) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // Replace the primary; the other addresses stay.
        body: JSON.stringify({
          id: member.id,
          contact: { email: email || null, emails: (member.contact?.emails ?? []).filter((e) => e !== member.contact?.email) },
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Could not save (${res.status})`);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => void save()}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        placeholder="no email yet"
        aria-label={`Email for ${member.name}`}
        className={`${field} w-full min-w-[220px] font-mono ${saving ? 'opacity-60' : ''}`}
      />
      {member.contact?.emails && member.contact.emails.length > 1 && (
        <p className="mt-0.5 text-[11px] text-content-faint">+ {member.contact.emails.filter((e) => e !== member.contact?.email).join(', ')}</p>
      )}
      {error && <p className="mt-0.5 text-[11px] text-signal-reverted">{error}</p>}
    </div>
  );
}

export default function TeamPanel({ ev, onAdded }: { ev: CertEvent; onAdded: () => void }) {
  const { getAccessToken } = usePrivy();
  const event = ev.key;
  const [roles, setRoles] = useState<Record<number, CertRole>>({});
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<{ ok: boolean; text: string }[]>([]);

  const query = useQuery({
    queryKey: ['certificates-team', event],
    enabled: Boolean(event),
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/certificates/admin/team?event=${encodeURIComponent(event)}`, { headers: { Authorization: `Bearer ${token}` } });
      const body = (await res.json().catch(() => ({}))) as TeamForCertsResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      return body.team;
    },
  });
  const team = useMemo(() => query.data ?? [], [query.data]);

  const roleOf = (m: TeamMemberForCerts) => roles[m.id] ?? defaultRole(m.status);
  const hasRole = (m: TeamMemberForCerts, r: CertRole) => m.certificates.some((c) => c.role === r);
  const canAdd = (m: TeamMemberForCerts) => Boolean(m.contact?.email) && !hasRole(m, roleOf(m));
  const addable = team.filter(canAdd);
  const selected = team.filter((m) => picked.has(m.id) && canAdd(m));

  async function addSelected() {
    if (busy || selected.length === 0) return;
    setLog([]);
    const token = await getAccessToken();
    const out: { ok: boolean; text: string }[] = [];
    for (const m of selected) {
      setBusy(`Adding ${m.name}…`);
      const body: AddParticipantBody = {
        event,
        role: roleOf(m),
        memberName: m.name,
        email: m.contact!.email as string,
        emails: m.contact!.emails,
        createWallet: true,
        teamMemberId: m.id,
      };
      try {
        const res = await fetch('/api/certificates/admin/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as AddParticipantResponse & { error?: string };
        if (!res.ok) throw new Error(data.error ?? `${res.status}`);
        out.push({ ok: true, text: `${m.name} · ${CERT_ROLES[roleOf(m)].label.en} · ${data.certificate.credentialId}${data.walletCreated ? ' · new wallet' : ''}` });
      } catch (e) {
        out.push({ ok: false, text: `${m.name} · ${e instanceof Error ? e.message : 'failed'}` });
      }
      setLog([...out]);
    }
    setBusy(null);
    setPicked(new Set());
    void query.refetch();
    onAdded();
  }

  return (
    <div className="mb-4 rounded-card border border-line-hairline bg-surface-slab p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-content-primary">Who from the team took part</p>
          <p className="text-xs text-content-muted">
            From the team master list. Tick who worked on this event, set their role, and add them; each gets a certificate and their ETH Cali
            wallet from the email. Missing an email? Fix it here or on the Team page.
          </p>
        </div>

      </div>

      <>
          {query.isLoading && <p className="mt-3 text-xs text-content-muted">Loading the team…</p>}
          {query.isError && <p className="mt-3 text-xs text-signal-reverted">{(query.error as Error).message}</p>}
          {team.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-card border border-line-hairline">
              <table className="w-full min-w-[820px] text-left text-xs">
                <thead className="bg-surface-inset text-[11px] uppercase tracking-wide text-content-faint">
                  <tr>
                    <th className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label="Select everyone who can be added"
                        disabled={addable.length === 0}
                        checked={addable.length > 0 && addable.every((m) => picked.has(m.id))}
                        onChange={(e) => setPicked(e.target.checked ? new Set(addable.map((m) => m.id)) : new Set())}
                        className="h-4 w-4 accent-eth-blue"
                      />
                    </th>
                    <th className="px-3 py-2 font-semibold">Member</th>
                    <th className="px-3 py-2 font-semibold">Email (private)</th>
                    <th className="px-3 py-2 font-semibold">Role</th>
                    <th className="px-3 py-2 font-semibold">Certificates · {ev.headline}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-hairline">
                  {team.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          aria-label={`Select ${m.name}`}
                          disabled={!canAdd(m)}
                          checked={picked.has(m.id)}
                          onChange={(e) =>
                            setPicked((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(m.id);
                              else next.delete(m.id);
                              return next;
                            })
                          }
                          className="h-4 w-4 accent-eth-blue"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-content-primary">{m.name}</p>
                        <p className="text-content-faint">
                          {m.status ?? '—'}
                          {!m.isPublished && ' · unpublished'}
                          {m.contact?.telegram && ` · ${m.contact.telegram}`}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <ContactCell
                          member={m}
                          onSaved={() => void query.refetch()}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <select value={roleOf(m)} onChange={(e) => setRoles((r) => ({ ...r, [m.id]: e.target.value as CertRole }))} className={field} aria-label={`Role for ${m.name}`}>
                          {(Object.keys(CERT_ROLES) as CertRole[]).filter((r) => r !== 'builder').map((r) => (
                            <option key={r} value={r}>
                              {CERT_ROLES[r].label.en}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        {m.certificates.length === 0 ? (
                          <span className="text-content-faint">{m.contact?.email ? 'none yet' : 'needs an email first'}</span>
                        ) : (
                          m.certificates.map((c) => (
                            <p key={c.credentialId} className="inline-flex items-center gap-1 text-content-secondary">
                              {c.issued && <CheckIcon className="h-3 w-3 text-signal-confirmed" />}
                              {CERT_ROLES[c.role].label.en} · <span className="font-mono">{c.credentialId}</span>
                              <span className="text-content-faint">{c.notified ? ' · emailed' : c.issued ? ' · issued' : ' · pending'}</span>
                            </p>
                          ))
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="small" onClick={addSelected} disabled={Boolean(busy) || selected.length === 0}>
              {busy ?? `Add ${selected.length} to ${ev.headline}`}
            </Button>
            <span className="text-xs text-content-muted">Each one gets a credential id and their ETH Cali wallet from the email. Next: pin, then issue.</span>
          </div>
          {log.length > 0 && (
            <div className="mt-2 space-y-0.5 text-xs">
              {log.map((l, i) => (
                <p key={i} className={l.ok ? 'text-signal-confirmed' : 'text-signal-reverted'}>
                  {l.text}
                </p>
              ))}
            </div>
          )}
      </>
    </div>
  );
}

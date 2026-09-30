/**
 * Send the certificate email for the selected, already-minted certificates.
 *
 * Three buttons, each with its own pending state: a dry run (who would get
 * what, nothing leaves), a test to the operator's own inbox, and the real
 * send. The server (POST /api/certificates/admin/notify) decides what goes:
 * only issued certificates without a notified_at, and it stamps each one it
 * sends, so a second click cannot send twice.
 */
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../shared/Button';
import type { AdminCertificate, NotifyResponse } from '../../types/certificates';

type Mode = 'dry' | 'test' | 'send';

export default function NotifyPanel({ selected, onSent }: { selected: AdminCertificate[]; onSent: () => void }) {
  const { user, getAccessToken } = usePrivy();
  const [busy, setBusy] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(NotifyResponse & { mode: Mode }) | null>(null);

  const myEmail = user?.email?.address ?? null;
  const issued = selected.filter((r) => r.issuedTx && r.tokenId);
  const pending = issued.filter((r) => !r.notifiedAt);
  const alreadySent = issued.length - pending.length;
  const notIssued = selected.length - issued.length;

  async function run(mode: Mode) {
    if (busy) return;
    setBusy(mode);
    setError(null);
    setResult(null);
    try {
      const token = await getAccessToken();
      const ids = (mode === 'test' ? issued : pending).map((r) => r.credentialId);
      const res = await fetch('/api/certificates/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          credentialIds: ids,
          ...(mode === 'dry' ? { dryRun: true } : {}),
          ...(mode === 'test' ? { testTo: myEmail } : {}),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as NotifyResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `No se pudo enviar (${res.status})`);
      setResult({ ...body, mode });
      if (mode === 'send' && body.sent.length) onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar.');
    } finally {
      setBusy(null);
    }
  }

  const LABEL: Record<Mode, string> = { dry: 'Revisando…', test: 'Enviando prueba…', send: 'Enviando…' };

  return (
    <div className="mb-4 rounded-card border border-line-hairline bg-surface-slab p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-content-primary">Enviar correo del certificado</p>
          <p className="text-xs text-content-muted">
            Diploma adjunto, credencial, LinkedIn y el NFT · a cada correo del builder · una vez por certificado
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="small" onClick={() => run('dry')} disabled={Boolean(busy) || pending.length === 0}>
            {busy === 'dry' ? LABEL.dry : 'Revisar'}
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => run('test')}
            disabled={Boolean(busy) || issued.length === 0 || !myEmail}
          >
            {busy === 'test' ? LABEL.test : `Prueba a ${myEmail ?? 'mi correo'}`}
          </Button>
          <Button size="small" onClick={() => run('send')} disabled={Boolean(busy) || pending.length === 0}>
            {busy === 'send' ? LABEL.send : `Enviar ${pending.length} correo${pending.length === 1 ? '' : 's'}`}
          </Button>
        </div>
      </div>

      {selected.length === 0 && <p className="mt-2 text-xs text-content-muted">Selecciona certificados emitidos en la tabla.</p>}
      {(notIssued > 0 || alreadySent > 0) && (
        <p className="mt-2 text-xs text-content-muted">
          {notIssued > 0 && `${notIssued} sin emitir todavía. `}
          {alreadySent > 0 && `${alreadySent} ya recibieron su correo.`}
        </p>
      )}
      {error && <p className="mt-2 text-sm text-signal-reverted">{error}</p>}
      {result && (
        <div className="mt-3 space-y-1 text-xs">
          <p className={result.mode === 'dry' ? 'text-content-secondary' : 'text-signal-confirmed'}>
            {result.mode === 'dry'
              ? `Se enviarían ${result.sent.length}. Nada salió.`
              : result.mode === 'test'
                ? `${result.sent.length} prueba${result.sent.length === 1 ? '' : 's'} en tu correo. Nada quedó marcado.`
                : `${result.sent.length} correo${result.sent.length === 1 ? '' : 's'} enviado${result.sent.length === 1 ? '' : 's'}.`}
          </p>
          {result.sent.map((s) => (
            <p key={s.credentialId} className="font-mono text-content-muted">
              {s.credentialId} → {s.to.join(', ')}
            </p>
          ))}
          {result.skipped.map((s) => (
            <p key={s.credentialId} className="font-mono text-content-faint">
              {s.credentialId} · {s.reason}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

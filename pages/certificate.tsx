/**
 * /certificate — a builder's certificates, and the three things to do with one.
 *
 * Signed-in only. The list comes from GET /api/certificates, which matches the
 * caller's Privy-verified emails against the event roster; nothing on this page
 * decides who built what. Signing in with the Devfolio email is the whole
 * proof, and a builder with no wallet gets one from that same sign-in.
 *
 * Per certificate, in order of what people want first:
 *   1. Add it to LinkedIn — one link, every field LinkedIn accepts prefilled,
 *      and a guide with copy buttons for the fields it does not.
 *   2. Download the PDF diploma.
 *   3. Choose the wallet the NFT goes to (issued later; changeable until then).
 *
 * Spanish, unlike the rest of the app: the page exists for one room of
 * Colombian builders, and the email that sends them here is in Spanish.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePrivy, type WalletWithMetadata } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navigation from '../components/Navigation';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Button from '../components/shared/Button';
import { CheckIcon, CopyIcon } from '../components/shared/icons';
import { DEFAULT_CHAIN, explorerAddress, explorerTx } from '../config/chains';
import { isEmbeddedWallet, truncateAddress } from '../utils/linkedAccounts';
import { CERT_ROLES, LINKEDIN_ORG, credentialPdfPath, credentialUrl, honorLabel, linkedInAddUrl, roleCredentialName, type CertEvent } from '../lib/certificates/events';
import { openseaUrl } from '../lib/certificates/nft';
import type {
  CertificateClaimResponse,
  CertificatesResponse,
  CertificateView,
} from '../types/certificates';

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

async function api<T>(path: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

export default function CertificatePage() {
  const router = useRouter();
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const [pending, setPending] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [choice, setChoice] = useState<Record<number, string>>({});

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace(`/?next=${encodeURIComponent('/certificate')}`);
    }
  }, [ready, authenticated, router]);

  // The embedded wallet first: it is the one every signed-in builder has.
  const wallets = useMemo(() => {
    const list = (user?.linkedAccounts ?? []).filter(
      (a): a is WalletWithMetadata => a.type === 'wallet' && a.chainType === 'ethereum'
    );
    return [...list.filter(isEmbeddedWallet), ...list.filter((a) => !isEmbeddedWallet(a))].map((a) => ({
      address: a.address.toLowerCase(),
      embedded: isEmbeddedWallet(a),
    }));
  }, [user?.linkedAccounts]);

  const query = useQuery({
    queryKey: ['certificates', user?.id],
    enabled: ready && authenticated,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not signed in');
      return api<CertificatesResponse>('/api/certificates', token);
    },
  });

  const claim = useCallback(
    async (cert: CertificateView, to: string | undefined) => {
      const id = cert.id;
      setErrors((prev) => ({ ...prev, [id]: '' }));
      setPending((prev) => ({ ...prev, [id]: true }));
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Not signed in');
        await api<CertificateClaimResponse>('/api/certificates', token, { id, ...(to ? { to } : {}) });
        await queryClient.invalidateQueries({ queryKey: ['certificates'] });
      } catch (e) {
        setErrors((prev) => ({ ...prev, [id]: e instanceof Error ? e.message : 'No se pudo guardar' }));
      } finally {
        // Always, so a failed request never locks the button.
        setPending((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [getAccessToken, queryClient]
  );

  if (!ready) return <Loading fullScreen text="Cargando…" />;
  if (!authenticated) return <Loading fullScreen text="Redirigiendo…" />;

  const certificates = query.data?.certificates ?? [];
  const events = query.data?.events ?? {};
  const signedInAs = user?.email?.address ?? user?.google?.email ?? null;

  return (
    <div className="min-h-screen bg-surface-void">
      <Navigation />
      <Layout>
        <div className="mb-5 md:mb-8">
          <h1 className="text-2xl font-bold text-content-primary md:text-3xl">Tu certificado ETH Cali</h1>
          <p className="mb-0 mt-1 text-sm text-content-muted">
            Fuiste parte de un evento, como builder o en el equipo. Súmalo a tu LinkedIn, descarga el
            diploma y elige la wallet donde recibirás el NFT.
          </p>
        </div>

        {query.isLoading && <Loading text="Buscándote…" />}

        {query.isError && (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-signal-reverted">
            No pudimos cargar tus certificados. {(query.error as Error).message}
          </div>
        )}

        {query.isSuccess && certificates.length === 0 && (
          <div className="rounded-card border border-line-hairline bg-surface-slab px-5 py-8 text-center">
            <p className="text-lg font-medium text-content-secondary">No hay certificado para este correo</p>
            <p className="mt-2 text-sm text-content-muted">
              {signedInAs ? (
                <>
                  Entraste como <span className="text-content-secondary">{signedInAs}</span>.{' '}
                </>
              ) : null}
              Los certificados van al correo con el que te inscribiste en Devfolio. Entra con ese, o
              escríbenos a hola@ethcali.org.
            </p>
          </div>
        )}

        <ul className="space-y-6">
          {certificates.map((cert) => (
            <li key={cert.id} className="overflow-hidden rounded-card border border-line-hairline bg-surface-slab">
              <CertificateHeader cert={cert} ev={events[cert.event]} />
              <LinkedInBlock cert={cert} ev={events[cert.event]} />
              <WalletBlock
                cert={cert}
                wallets={wallets}
                selected={choice[cert.id] ?? cert.wallet ?? wallets[0]?.address ?? ''}
                onSelect={(a) => setChoice((prev) => ({ ...prev, [cert.id]: a }))}
                busy={Boolean(pending[cert.id])}
                error={errors[cert.id]}
                onClaim={(to) => claim(cert, to)}
              />
            </li>
          ))}
        </ul>
      </Layout>
    </div>
  );
}

function CertificateHeader({ cert, ev }: { cert: CertificateView; ev?: CertEvent }) {
  return (
    <div className="border-b border-line-hairline p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-eth-blue-text">
        {ev?.title ?? cert.event}
      </p>
      <p className="mt-1 text-xl font-bold text-content-primary">{cert.projectName ?? CERT_ROLES[cert.role].label.es}</p>
      <p className="text-sm text-content-muted">{cert.memberName}</p>
      {cert.honors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cert.honors.map((h) => (
            <span key={`${h.track}-${h.place}`} className="rounded-chip bg-eth-blue px-2.5 py-1 text-xs font-bold text-on-brand">
              {honorLabel(h, 'es')}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`${credentialPdfPath(cert.credentialId)}?download=1`}
          className="inline-flex min-h-tap items-center justify-center rounded-control border border-line-hairline px-4 text-sm font-semibold text-content-primary hover:border-eth-blue"
        >
          Descargar diploma (PDF)
        </a>
        <Link
          href={`/certificate/${cert.credentialId}`}
          className="inline-flex min-h-tap items-center justify-center rounded-control px-4 text-sm font-semibold text-content-muted hover:text-content-primary"
        >
          Ver credencial pública ↗
        </Link>
      </div>
    </div>
  );
}

/**
 * LinkedIn: the add-link fills Name, Issuing organization, Issue date,
 * Credential ID and Credential URL. Skills and Media cannot be prefilled, so
 * the guide lists every field with its value and a copy button, in the order
 * LinkedIn's form asks for them.
 */
function LinkedInBlock({ cert, ev }: { cert: CertificateView; ev?: CertEvent }) {
  const addUrl = ev ? linkedInAddUrl(ev, cert.credentialId, cert.issueDate, cert.role) : null;
  const [, mm] = cert.issueDate.split('-').map(Number);
  const year = cert.issueDate.slice(0, 4);

  const fields: { label: string; value: string; note?: string }[] = ev
    ? [
        { label: 'Nombre · Name', value: roleCredentialName(ev, cert.role) },
        { label: 'Organización emisora · Issuing organization', value: LINKEDIN_ORG.name, note: 'Elige la página "ETH CALI" que sale con el logo.' },
        { label: 'Fecha de expedición · Issue date', value: `${MONTHS_ES[mm - 1]} ${year}`, note: 'Mes y año.' },
        { label: 'Fecha de caducidad · Expiration date', value: 'Déjala vacía', note: 'Este certificado no expira.' },
        { label: 'ID de la credencial · Credential ID', value: cert.credentialId },
        { label: 'URL de la credencial · Credential URL', value: credentialUrl(cert.credentialId) },
        { label: 'Aptitudes · Skills', value: ev.skills.join(', '), note: 'Agrega una por una; con una basta.' },
        { label: 'Multimedia · Media', value: 'Sube el diploma en PDF', note: 'Descárgalo arriba y súbelo como archivo.' },
      ]
    : [];

  return (
    <div className="border-b border-line-hairline p-5">
      <h2 className="text-base font-semibold text-content-primary">1 · Añádelo a tu LinkedIn</h2>
      <p className="mt-1 text-sm text-content-muted">
        Un clic abre LinkedIn con el certificado ya llenado. Revisa, agrega una aptitud y guarda.
      </p>
      {addUrl && (
        <a
          href={addUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-[#0A66C2] px-5 text-sm font-bold text-white hover:bg-[#004182] sm:w-auto"
        >
          <LinkedInGlyph />
          Añadir a mi perfil de LinkedIn
        </a>
      )}

      {fields.length > 0 && (
        <details className="group mt-4 rounded-control border border-line-hairline bg-surface-inset">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-content-secondary">
            Guía paso a paso (si prefieres llenarlo a mano)
          </summary>
          <ol className="space-y-3 px-4 pb-4 text-sm">
            <li className="text-content-muted">
              En LinkedIn: tu perfil → <strong className="text-content-secondary">Añadir sección</strong> →{' '}
              <strong className="text-content-secondary">Licencias y certificaciones</strong>. Luego copia cada campo:
            </li>
            {fields.map((f) => (
              <li key={f.label} className="rounded-control border border-line-hairline bg-surface-slab p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-content-faint">{f.label}</p>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <span className="break-all text-content-primary">{f.value}</span>
                  {!f.value.startsWith('Déjala') && !f.value.startsWith('Sube') && <CopyButton value={f.value} />}
                </div>
                {f.note && <p className="mt-1 text-xs text-content-muted">{f.note}</p>}
              </li>
            ))}
            <li className="text-content-muted">
              Y síguenos en{' '}
              <a href={LINKEDIN_ORG.url} target="_blank" rel="noopener noreferrer" className="text-eth-blue-text hover:underline">
                LinkedIn de ETH Cali
              </a>{' '}
              para que tu certificado muestre nuestro logo.
            </li>
          </ol>
        </details>
      )}
    </div>
  );
}

function WalletBlock({
  cert,
  wallets,
  selected,
  onSelect,
  busy,
  error,
  onClaim,
}: {
  cert: CertificateView;
  wallets: { address: string; embedded: boolean }[];
  selected: string;
  onSelect: (address: string) => void;
  busy: boolean;
  error?: string;
  onClaim: (to: string | undefined) => void;
}) {
  const unchanged = cert.wallet !== null && selected === cert.wallet;

  return (
    <div className="p-5">
      <h2 className="text-base font-semibold text-content-primary">2 · Tu NFT</h2>

      {cert.issuedTx ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1 font-medium text-signal-confirmed">
            <CheckIcon className="h-4 w-4" />
            NFT #{cert.tokenId} en tu wallet
          </span>
          {cert.wallet && <AddressLink address={cert.wallet} />}
          {cert.tokenId && (
            <a href={openseaUrl(cert.tokenId)} target="_blank" rel="noopener noreferrer" className="text-xs text-eth-blue-text hover:underline">
              Ver en OpenSea ↗
            </a>
          )}
          <a
            href={explorerTx(DEFAULT_CHAIN.id, cert.issuedTx)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-eth-blue-text hover:underline"
          >
            {truncateAddress(cert.issuedTx)}
          </a>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-content-muted">
            Tu certificado también es un NFT soulbound en Ethereum, emitido por ETH Cali sin costo de gas
            para ti. Va a la wallet de abajo; puedes cambiarla hasta que lo emitamos.
          </p>

          {cert.wallet && (
            <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 text-sm text-content-secondary">
              <CheckIcon className="h-4 w-4 text-signal-confirmed" />
              Guardado — irá a <AddressLink address={cert.wallet} />
            </p>
          )}

          {wallets.length > 1 && (
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-content-faint">
                Enviarlo a
              </span>
              <select
                value={selected}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2.5 font-mono text-sm text-content-primary focus:border-eth-blue focus:outline-none sm:w-auto"
              >
                {wallets.map((w) => (
                  <option key={w.address} value={w.address}>
                    {truncateAddress(w.address)} {w.embedded ? '· wallet de ETH Cali' : '· wallet conectada'}
                  </option>
                ))}
              </select>
            </label>
          )}

          {wallets.length === 1 && !cert.wallet && (
            <p className="mt-3 text-sm text-content-muted">
              Irá a tu {wallets[0].embedded ? 'wallet de ETH Cali' : 'wallet'}{' '}
              <AddressLink address={wallets[0].address} />
            </p>
          )}

          {!unchanged && (
            <Button onClick={() => onClaim(selected || undefined)} disabled={busy} className="mt-4 w-full sm:w-auto">
              {busy ? 'Guardando…' : cert.wallet ? 'Cambiar wallet' : 'Reclamar NFT en esta wallet'}
            </Button>
          )}
          {error && <p className="mt-2 text-sm text-signal-reverted">{error}</p>}
        </>
      )}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-chip border border-line-hairline px-2 py-1 text-xs text-content-muted hover:text-content-primary"
      aria-label="Copiar"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5 text-signal-confirmed" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

/** Truncated, linked to the explorer, one tap to copy. Never a bare string. */
function AddressLink({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5">
      <a
        href={explorerAddress(DEFAULT_CHAIN.id, address)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-eth-blue-text hover:underline"
        title={address}
      >
        {truncateAddress(address)}
      </a>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="text-content-faint hover:text-content-primary"
        aria-label="Copiar dirección"
      >
        {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

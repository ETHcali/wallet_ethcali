/**
 * /certificate/<credentialId> — the public credential page.
 *
 * This is the "Credential URL" a builder puts on LinkedIn, so it has to work
 * for a recruiter who has never heard of us: no sign-in, real HTML with the
 * builder's name in the OG tags, and the diploma readable at a glance.
 *
 * Prerendered at build and revalidated, never rendered per request: _app
 * mounts PrivyProvider, and loading @privy-io/react-auth in a Vercel request
 * function fails (its ESM build imports named exports from CommonJS
 * styled-components). Every other page in the app is static for the same
 * reason. A failed revalidation keeps serving the last good page. It shows the diploma now; once
 * the certificate is minted as an NFT it also shows the token, so the URL on
 * a profile never has to change.
 */
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getSupabaseAdmin } from '../../lib/supabase';
import { getPublicCertificate } from '../../lib/certificates/rows';
import {
  CERT_EVENTS,
  LINKEDIN_ORG,
  credentialPdfPath,
  credentialUrl,
  honorLabel,
} from '../../lib/certificates/events';
import { DEFAULT_CHAIN, explorerAddress, explorerTx } from '../../config/chains';
import { truncateAddress } from '../../utils/linkedAccounts';
import { CheckIcon } from '../../components/shared/icons';
import type { PublicCertificate } from '../../types/certificates';

interface Props {
  cert: PublicCertificate;
}

const OG_IMAGE = 'https://www.ethcali.org/tour/builders-tour-closing.jpg';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function CredentialPage({ cert }: Props) {
  const ev = CERT_EVENTS[cert.event];
  const url = credentialUrl(cert.credentialId);
  const title = `${cert.memberName} — ${ev?.credentialName ?? 'Builder certificate'}`;
  const description = `${cert.memberName} built and shipped ${cert.projectName} at ${
    ev?.title ?? 'an ETH Cali event'
  }. Issued by ETH Cali.`;

  return (
    <div className="min-h-screen bg-surface-void">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:url" property="og:url" content={url} />
        <meta key="og:title" property="og:title" content={title} />
        <meta key="og:description" property="og:description" content={description} />
        <meta key="og:image" property="og:image" content={OG_IMAGE} />
        <meta key="twitter:card" property="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" property="twitter:title" content={title} />
        <meta key="twitter:description" property="twitter:description" content={description} />
        <meta key="twitter:image" property="twitter:image" content={OG_IMAGE} />
      </Head>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-14">
        {/* The diploma, as the PDF draws it. */}
        <article className="rounded-card border-2 border-eth-blue bg-black p-2">
          <div className="rounded-[10px] border border-line-hairline px-5 py-10 text-center sm:px-10 sm:py-14">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand mark */}
            <img src="/logo_eth_cali.png" alt="ETH Cali" className="mx-auto h-24 w-auto sm:h-28" />
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.25em] text-eth-blue-text">
              Certificado de builder · Builder certificate
            </p>
            <p className="mt-3 text-sm text-content-muted">Se certifica que · This certifies that</p>
            <h1 className="mt-2 text-3xl font-bold text-content-primary sm:text-5xl">{cert.memberName}</h1>
            <div className="mx-auto mt-3 h-px w-2/3 bg-eth-blue" />
            <p className="mt-5 text-sm text-content-muted">construyó y publicó · built and shipped</p>
            <p className="mt-1 text-2xl font-bold text-eth-blue-text sm:text-3xl">{cert.projectName}</p>
            {ev && (
              <>
                <p className="mt-4 text-base text-content-primary">{ev.title}</p>
                <p className="mt-1 text-xs text-content-muted">
                  {ev.venue} · {ev.dates.es}
                </p>
              </>
            )}
            {cert.honors.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {cert.honors.map((h) => (
                  <span
                    key={`${h.track}-${h.place}`}
                    className="rounded-chip bg-eth-blue px-3 py-1 text-xs font-bold text-on-brand"
                  >
                    {honorLabel(h, 'es')} · {honorLabel(h, 'en')}
                  </span>
                ))}
              </div>
            )}

            <dl className="mt-10 grid gap-4 text-center sm:grid-cols-3">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">
                  Emitido por · Issued by
                </dt>
                <dd className="mt-1 text-sm text-content-primary">
                  <a href={LINKEDIN_ORG.url} target="_blank" rel="noopener noreferrer" className="hover:text-eth-blue-text">
                    ETH Cali
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">Fecha · Date</dt>
                <dd className="mt-1 text-sm text-content-primary">{formatDate(cert.issueDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">
                  ID de credencial · Credential ID
                </dt>
                <dd className="mt-1 font-mono text-sm text-content-primary">{cert.credentialId}</dd>
              </div>
            </dl>
          </div>
        </article>

        {/* Verified, and where the NFT is once it exists. */}
        <section className="mt-6 rounded-card border border-line-hairline bg-surface-slab p-5 text-sm">
          <p className="inline-flex items-center gap-2 font-medium text-signal-confirmed">
            <CheckIcon className="h-4 w-4" />
            Certificado válido, emitido por ETH Cali · Valid certificate issued by ETH Cali
          </p>
          {cert.issuedTx && cert.wallet ? (
            <p className="mt-2 text-content-secondary">
              NFT emitido a{' '}
              <a
                href={explorerAddress(DEFAULT_CHAIN.id, cert.wallet)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-eth-blue-text hover:underline"
              >
                {truncateAddress(cert.wallet)}
              </a>{' '}
              ·{' '}
              <a
                href={explorerTx(DEFAULT_CHAIN.id, cert.issuedTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-eth-blue-text hover:underline"
              >
                ver transacción
              </a>
            </p>
          ) : (
            <p className="mt-2 text-content-muted">
              La versión onchain (NFT) se emite pronto y aparecerá aquí. · The onchain version (NFT) is
              issued soon and will appear here.
            </p>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={`${credentialPdfPath(cert.credentialId)}?download=1`}
            className="inline-flex min-h-tap items-center justify-center rounded-control bg-eth-blue px-5 text-sm font-bold text-on-brand hover:bg-eth-blue-lift"
          >
            Descargar PDF · Download PDF
          </a>
          <a
            href={`https://devfolio.co/projects/${cert.projectSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-tap items-center justify-center rounded-control border border-line-hairline px-5 text-sm font-semibold text-content-secondary hover:text-content-primary"
          >
            Ver el proyecto · See the project ↗
          </a>
          <Link
            href="/certificate"
            className="inline-flex min-h-tap items-center justify-center rounded-control px-5 text-sm font-semibold text-content-muted hover:text-content-primary"
          >
            ¿Es tuyo? Reclámalo · Yours? Claim it
          </Link>
        </div>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data, error } = await getSupabaseAdmin().from('builder_certificates').select('credential_id');
  if (error) throw new Error(error.message);
  return {
    paths: ((data ?? []) as { credential_id: string }[]).map((r) => ({ params: { credentialId: r.credential_id } })),
    // Unknown ids 404. A new roster is loaded rarely and ships with a deploy.
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const raw = params?.credentialId;
  if (typeof raw !== 'string') return { notFound: true };
  const cert = await getPublicCertificate(getSupabaseAdmin(), raw);
  if (!cert) return { notFound: true };
  // Picks up the NFT once issued_tx is set.
  return { props: { cert }, revalidate: 300 };
};

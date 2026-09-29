/**
 * /certificate/<credentialId> — the public credential page.
 *
 * This is the "Credential URL" a builder puts on LinkedIn, so it has to work
 * for a recruiter who has never heard of us: no sign-in, real HTML with the
 * builder's name in the OG tags, and the diploma itself — the same PNG that is
 * the NFT's image on IPFS — rather than a re-drawing of it. Once the
 * certificate is minted, the NFT panel shows the token, the wallet holding it,
 * and links to Etherscan, OpenSea and the metadata, so the URL on a profile
 * never has to change.
 *
 * The NFT panel is filled from /api/certificates/<id>/status in the browser,
 * because the page cannot be re-rendered on the server (below), and a mint
 * happens after the build.
 *
 * Prerendered at build and revalidated, never rendered per request: _app
 * mounts PrivyProvider, and loading @privy-io/react-auth in a Vercel request
 * function fails (its ESM build imports named exports from CommonJS
 * styled-components). Every other page in the app is static for the same
 * reason. A failed revalidation keeps serving the last good page.
 */
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { getSupabaseAdmin } from '../../lib/supabase';
import { getPublicCertificate } from '../../lib/certificates/rows';
import {
  CERT_EVENTS,
  credentialPdfPath,
  credentialUrl,
  honorLabel,
} from '../../lib/certificates/events';
import {
  CERT_ADDRESS,
  etherscanContractTokenUrl,
  etherscanTokenUrl,
  ipfsHttp,
  openseaUrl,
} from '../../lib/certificates/nft';
import { DEFAULT_CHAIN, explorerAddress, explorerTx } from '../../config/chains';
import { truncateAddress } from '../../utils/linkedAccounts';
import { CheckIcon } from '../../components/shared/icons';
import type { PublicCertificate } from '../../types/certificates';

interface Props {
  cert: PublicCertificate;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line-hairline py-2.5 first:border-t-0">
      <dt className="text-xs text-content-faint">{label}</dt>
      <dd className="text-sm text-content-primary">{children}</dd>
    </div>
  );
}

const link = 'text-eth-blue-text hover:underline';

/**
 * The Ethereum diamond, drawn to the text it sits beside: 1em tall, the
 * foundation's four facet tones, no raster padding to throw off alignment.
 */
function EthereumMark() {
  return (
    <svg viewBox="0 0 256 417" className="h-[1.05em] w-auto shrink-0" aria-hidden>
      <path fill="#8C8C8C" d="M127.96 0 125.2 9.5v275.67l2.76 2.75 127.96-75.64z" />
      <path fill="#E8E8E8" d="M127.96 0 0 212.28l127.96 75.64V154.16z" />
      <path fill="#8C8C8C" d="M127.96 312.19 126.4 314.1v98.2l1.56 4.57L256 236.59z" />
      <path fill="#E8E8E8" d="M127.96 416.87V312.19L0 236.59z" />
      <path fill="#3C3C3B" d="m127.96 287.92 127.96-75.64-127.96-58.12z" />
      <path fill="#8C8C8C" d="m0 212.28 127.96 75.64V154.16z" />
    </svg>
  );
}

export default function CredentialPage({ cert: built }: Props) {
  // What can change after the build (the mint) is read live; see the status route.
  const [cert, setCert] = useState<PublicCertificate>(built);
  useEffect(() => {
    let live = true;
    fetch(`/api/certificates/${built.credentialId}/status`)
      .then((r) => (r.ok ? (r.json() as Promise<PublicCertificate>) : null))
      .then((fresh) => {
        if (live && fresh) setCert(fresh);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [built.credentialId]);
  const ev = CERT_EVENTS[cert.event];
  const url = credentialUrl(cert.credentialId);
  const title = `${cert.memberName} — ${ev?.credentialName ?? 'Builder certificate'}`;
  const description = `${cert.memberName} built and shipped ${cert.projectName} at ${
    ev?.title ?? 'an ETH Cali event'
  }. Issued by ETH Cali.`;
  const image = cert.imageCid ? ipfsHttp(cert.imageCid) : null;
  const minted = Boolean(cert.issuedTx && cert.tokenId);

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
        {image && <meta key="og:image" property="og:image" content={image} />}
        <meta key="twitter:card" property="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" property="twitter:title" content={title} />
        <meta key="twitter:description" property="twitter:description" content={description} />
        {image && <meta key="twitter:image" property="twitter:image" content={image} />}
      </Head>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
        <header className="mb-6 flex items-center justify-between gap-4">
          <a href="https://ethcali.org" aria-label="ETH Cali">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand mark */}
            <img src="/logo_eth_cali_white.png" alt="ETH Cali" className="h-10 w-auto" />
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-chip border border-signal-confirmed/40 bg-signal-confirmed/10 px-3 py-1 text-xs font-medium text-signal-confirmed">
            <CheckIcon className="h-3.5 w-3.5" />
            Valid certificate
          </span>
        </header>

        {/* The diploma, as pinned — the NFT's own image. */}
        {image ? (
          <div className="overflow-hidden rounded-card border border-line-hairline bg-white shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element -- IPFS gateway, not a Next image host */}
            <img src={image} alt={`Builder certificate — ${cert.memberName}, ${cert.projectName}`} className="h-auto w-full" />
          </div>
        ) : (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-10 text-center">
            <p className="text-3xl font-bold text-content-primary">{cert.memberName}</p>
            <p className="mt-2 text-xl text-eth-blue-text">{cert.projectName}</p>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <a
            href={`${credentialPdfPath(cert.credentialId)}?download=1`}
            className="inline-flex min-h-tap items-center justify-center rounded-control bg-eth-blue px-5 text-sm font-bold text-on-brand hover:bg-eth-blue-lift"
          >
            Download certificate (PDF)
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* What it certifies */}
          <section className="rounded-card border border-line-hairline bg-surface-slab p-5">
            <h2 className="text-lg font-bold text-content-primary">Certificate details</h2>
            <dl className="mt-4">
              <Row label="Name">
                <span className="font-semibold">{cert.memberName}</span>
              </Row>
              <Row label="Project">
                <a href={`https://devfolio.co/projects/${cert.projectSlug}`} target="_blank" rel="noopener noreferrer" className={link}>
                  {cert.projectName}
                </a>
              </Row>
              {ev && (
                <Row label="Event">
                  <a href={ev.eventUrl} target="_blank" rel="noopener noreferrer" className={link}>
                    {ev.eventName}
                  </a>
                </Row>
              )}
              {ev && (
                <Row label="Venue">
                  <a href={ev.venueMapsUrl} target="_blank" rel="noopener noreferrer" className={link}>
                    {ev.venueName}
                  </a>
                </Row>
              )}
              {ev && <Row label="Event dates">{ev.eventDates}</Row>}
              <Row label="Issue date (UTC)">{formatDate(cert.issueDate)}</Row>
              {cert.honors.length > 0 && (
                <Row label="Prizes">
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {cert.honors.map((h) => (
                      <span key={`${h.track}-${h.place}`} className="rounded-chip bg-eth-blue px-2 py-0.5 text-xs font-bold text-on-brand">
                        {honorLabel(h, 'en')}
                      </span>
                    ))}
                  </span>
                </Row>
              )}
              <Row label="Credential ID">
                <span className="font-mono">{cert.credentialId}</span>
              </Row>
              <Row label="Issuer">
                <a href="https://www.ethcali.org" target="_blank" rel="noopener noreferrer" className={link}>
                  ETH Cali
                </a>
              </Row>
            </dl>
          </section>

          {/* The NFT */}
          <section className="flex flex-col rounded-card border border-line-hairline bg-surface-slab p-5">
            <h2 className="text-lg font-bold text-content-primary">Blockchain issuance</h2>
            <p className="text-sm text-content-muted">
              {minted ? 'Issued' : 'Pending'}
            </p>
            <dl className="mt-4">
              <Row label="Token">Non-Fungible Token (NFT)</Row>
              <Row label="Ownership">Soulbound</Row>
              <Row label="Blockchain">
                <span className="inline-flex items-center gap-1.5">
                  <EthereumMark />
                  Ethereum
                </span>
              </Row>
              <Row label="Contract">
                <a href={etherscanContractTokenUrl} target="_blank" rel="noopener noreferrer" className={`font-mono ${link}`}>
                  {truncateAddress(CERT_ADDRESS)}
                </a>
              </Row>
              <Row label="Token ID">
                {minted ? (
                  <a href={etherscanTokenUrl(cert.tokenId as string)} target="_blank" rel="noopener noreferrer" className={`font-mono ${link}`}>
                    {cert.tokenId}
                  </a>
                ) : (
                  <span className="text-content-muted">—</span>
                )}
              </Row>
              {minted && cert.wallet && (
                <Row label="Held by">
                  <a href={explorerAddress(DEFAULT_CHAIN.id, cert.wallet)} target="_blank" rel="noopener noreferrer" className={`font-mono ${link}`}>
                    {truncateAddress(cert.wallet)}
                  </a>
                </Row>
              )}
              {minted && (
                <Row label="Transaction">
                  <a href={explorerTx(DEFAULT_CHAIN.id, cert.issuedTx as string)} target="_blank" rel="noopener noreferrer" className={`font-mono ${link}`}>
                    {truncateAddress(cert.issuedTx as string)}
                  </a>
                </Row>
              )}
            </dl>
            {minted && (
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <a
                  href={openseaUrl(cert.tokenId as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-tap items-center justify-center rounded-control bg-[#2081E2] px-4 text-sm font-bold text-white hover:bg-[#1868B7]"
                >
                  View on OpenSea ↗
                </a>
              </div>
            )}
          </section>
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

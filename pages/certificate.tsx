/**
 * /certificate — a builder says which wallet their certificate goes to.
 *
 * Signed-in only. The list comes from GET /api/certificates, which matches the
 * caller's Privy-verified emails against the event roster; nothing on this page
 * decides who built what. Signing in with the Devfolio email is the whole
 * proof, and a builder with no wallet gets one from that same sign-in.
 *
 * Nothing here is onchain yet: the page records an address, and the
 * certificate is issued to it later. Each row's button owns its own pending
 * state, and the choice can change until the certificate is issued.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { usePrivy, type WalletWithMetadata } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navigation from '../components/Navigation';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Button from '../components/shared/Button';
import { CheckIcon, CopyIcon } from '../components/shared/icons';
import { DEFAULT_CHAIN, explorerAddress, explorerTx } from '../config/chains';
import { isEmbeddedWallet, truncateAddress } from '../utils/linkedAccounts';
import type {
  CertificateClaimResponse,
  CertificatesResponse,
  CertificateView,
} from '../types/certificates';

const EVENT_LABEL: Record<string, string> = {
  'eag-cali-2026': 'EAG Global Buildathon · Cali, September 2026',
};

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
      const { certificates } = await api<CertificatesResponse>('/api/certificates', token);
      return certificates;
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
        setErrors((prev) => ({ ...prev, [id]: e instanceof Error ? e.message : 'Could not save' }));
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

  if (!ready) return <Loading fullScreen text="Loading…" />;
  if (!authenticated) return <Loading fullScreen text="Redirecting…" />;

  const certificates = query.data ?? [];
  const signedInAs = user?.email?.address ?? user?.google?.email ?? null;

  return (
    <div className="min-h-screen bg-surface-void">
      <Navigation />
      <Layout>
        <div className="mb-5 md:mb-8">
          <h1 className="text-2xl font-bold text-content-primary md:text-3xl">Builder certificate</h1>
          <p className="mb-0 mt-1 text-sm text-content-muted">
            You built and shipped a project. Choose the wallet your onchain certificate goes to — we
            issue it there, gas covered.
          </p>
        </div>

        {query.isLoading && <Loading text="Looking you up…" />}

        {query.isError && (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-signal-reverted">
            Could not load your certificates. {(query.error as Error).message}
          </div>
        )}

        {query.isSuccess && certificates.length === 0 && (
          <div className="rounded-card border border-line-hairline bg-surface-slab px-5 py-8 text-center">
            <p className="text-lg font-medium text-content-secondary">No certificate for this email</p>
            <p className="mt-2 text-sm text-content-muted">
              {signedInAs ? (
                <>
                  You are signed in as <span className="text-content-secondary">{signedInAs}</span>.{' '}
                </>
              ) : null}
              Certificates are matched to the email on your Devfolio team. Sign in with that one, or
              write to hola@ethcali.org.
            </p>
          </div>
        )}

        {certificates.length > 0 && (
          <ul className="space-y-4">
            {certificates.map((cert) => {
              const busy = Boolean(pending[cert.id]);
              const error = errors[cert.id];
              const selected = choice[cert.id] ?? cert.wallet ?? wallets[0]?.address ?? '';
              const unchanged = cert.wallet !== null && selected === cert.wallet;
              return (
                <li key={cert.id} className="rounded-card border border-line-hairline bg-surface-slab p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-content-faint">
                    {EVENT_LABEL[cert.event] ?? cert.event}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-content-primary">{cert.projectName}</p>
                  <p className="text-sm text-content-muted">{cert.memberName}</p>

                  {cert.issuedTx ? (
                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="inline-flex items-center gap-1 font-medium text-signal-confirmed">
                        <CheckIcon className="h-4 w-4" />
                        Issued
                      </span>
                      {cert.wallet && <AddressLink address={cert.wallet} />}
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
                    <div className="mt-4">
                      {cert.wallet && (
                        <p className="mb-3 inline-flex flex-wrap items-center gap-x-2 text-sm text-content-secondary">
                          <CheckIcon className="h-4 w-4 text-signal-confirmed" />
                          Saved — it will be issued to <AddressLink address={cert.wallet} />
                        </p>
                      )}

                      {wallets.length > 1 && (
                        <label className="mb-3 block">
                          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-content-faint">
                            Send it to
                          </span>
                          <select
                            value={selected}
                            onChange={(e) => setChoice((prev) => ({ ...prev, [cert.id]: e.target.value }))}
                            className="w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2.5 font-mono text-sm text-content-primary focus:border-eth-blue focus:outline-none sm:w-auto"
                          >
                            {wallets.map((w) => (
                              <option key={w.address} value={w.address}>
                                {truncateAddress(w.address)} {w.embedded ? '· ETH Cali wallet' : '· connected wallet'}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      {wallets.length === 1 && !cert.wallet && (
                        <p className="mb-3 text-sm text-content-muted">
                          It goes to your {wallets[0].embedded ? 'ETH Cali wallet' : 'wallet'}{' '}
                          <AddressLink address={wallets[0].address} />
                        </p>
                      )}

                      {!unchanged && (
                        <Button
                          onClick={() => claim(cert, selected || undefined)}
                          disabled={busy}
                          className="w-full sm:w-auto"
                        >
                          {busy ? 'Saving…' : cert.wallet ? 'Change wallet' : 'Claim certificate'}
                        </Button>
                      )}
                      {error && <p className="mt-2 text-sm text-signal-reverted">{error}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Layout>
    </div>
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
        aria-label="Copy address"
      >
        {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

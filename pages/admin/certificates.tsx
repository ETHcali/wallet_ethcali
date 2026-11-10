/**
 * Certificates admin — events first, then everything about one event.
 *
 *   /admin/certificates                     every event that issues certificates
 *   /admin/certificates?event=<key>&tab=…   one event, in six tabs:
 *
 *     Event        ethcali.org's facts (read-only) + what certificates say
 *     Team         who from the team master list took part, with a role
 *     Builders     the hackathon roster
 *     Sponsors     the partners the diploma prints, in order
 *     Certificate  a live diploma preview
 *     Mint         prepare (token id, diploma, metadata on IPFS), then mint
 *     Send         the email, once minted and the credential page is live
 *
 * Every route behind it re-checks ADMIN_ROLE on BuilderCertificate on chain;
 * what this page shows or hides is presentation only.
 */
import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import AdminShell from '../../components/admin/AdminShell';
import Loading from '../../components/shared/Loading';
import TeamPanel from '../../components/certificates/TeamPanel';
import EventsIndex, { type EventCounts } from '../../components/certificates/admin/EventsIndex';
import EventTab from '../../components/certificates/admin/EventTab';
import BuildersTab from '../../components/certificates/admin/BuildersTab';
import SponsorsTab from '../../components/certificates/admin/SponsorsTab';
import PreviewTab from '../../components/certificates/admin/PreviewTab';
import MintTab from '../../components/certificates/admin/MintTab';
import SendTab from '../../components/certificates/admin/SendTab';
import { useAdminApi } from '../../components/certificates/admin/useAdminApi';
import type { AdminCertificatesResponse, CertEventsResponse } from '../../types/certificates';
import { Tabs } from '../../components/admin/primitives';

const TABS = [
  { id: 'event', label: 'Event' },
  { id: 'team', label: 'Team' },
  { id: 'builders', label: 'Builders' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'mint', label: 'Mint' },
  { id: 'send', label: 'Send' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function CertificatesAdmin() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const api = useAdminApi();
  const eventKey = typeof router.query.event === 'string' ? router.query.event : null;
  const tab: TabId = TABS.some((t) => t.id === router.query.tab) ? (router.query.tab as TabId) : 'event';

  const certs = useQuery({
    queryKey: ['certificates-admin'],
    enabled: ready && authenticated,
    queryFn: () => api<AdminCertificatesResponse>('/api/certificates/admin'),
  });
  const events = useQuery({
    queryKey: ['certificates-admin-events'],
    enabled: ready && authenticated,
    queryFn: () => api<CertEventsResponse>('/api/certificates/admin/events'),
  });
  const refetch = () => {
    void certs.refetch();
    void events.refetch();
  };

  const all = useMemo(() => certs.data?.certificates ?? [], [certs.data]);
  const counts = useMemo(() => {
    const out: Record<string, EventCounts> = {};
    for (const r of all) {
      const c = (out[r.event] ??= { people: 0, team: 0, builders: 0, issued: 0, emailed: 0 });
      c.people++;
      if (r.role === 'builder') c.builders++;
      else c.team++;
      if (r.issuedTx) c.issued++;
      if (r.notifiedAt) c.emailed++;
    }
    return out;
  }, [all]);

  const current = eventKey ? events.data?.events.find((e) => e.settings.key === eventKey) : undefined;
  const ev = eventKey ? certs.data?.events[eventKey] : undefined;
  const rows = useMemo(() => all.filter((r) => r.event === eventKey), [all, eventKey]);
  const pinned = rows.filter((r) => r.metadataCid).length;

  const go = (query: Record<string, string>) => void router.push({ pathname: '/admin/certificates', query }, undefined, { shallow: true });

  const loading = !ready || !router.isReady || certs.isLoading || events.isLoading;
  const error = (certs.error ?? events.error) as Error | null;

  return (
    <AdminShell
      active="certificates"
      title={current ? current.settings.headline : 'Certificates'}
      subtitle={
        current
          ? `${current.settings.eventDates} · ${current.site.venue ?? current.site.city ?? ''}`
          : 'Pick an event to set up its certificates, choose who gets one, preview the diploma, and issue.'
      }
    >
      <Head>
        <title>{`${current ? `${current.settings.headline} · Certificates` : 'Certificates'} · Admin · ETH Cali`}</title>
      </Head>

      {loading ? (
        <Loading text="Loading certificates…" />
      ) : error ? (
        <div className="rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-signal-reverted">{error.message}</div>
      ) : !eventKey ? (
        <EventsIndex data={events.data as CertEventsResponse} counts={counts} onCreated={(key) => {
          refetch();
          go({ event: key, tab: 'event' });
        }} />
      ) : !current || !ev ? (
        <div className="rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-content-muted">
          No certificate event called <span className="font-mono">{eventKey}</span>.{' '}
          <Link href="/admin/certificates" className="text-eth-blue-text hover:underline">
            All events
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 space-y-3">
            <Link href="/admin/certificates" className="inline-flex min-h-[36px] items-center text-xs font-semibold text-content-muted hover:text-content-primary">
              ← All events
            </Link>
            <Tabs
              label="Certificate event sections"
              value={tab}
              onChange={(next) => go({ event: eventKey, tab: next })}
              tabs={TABS.map((t) => ({
                ...t,
                count: t.id === 'team' ? counts[eventKey]?.team : t.id === 'builders' ? counts[eventKey]?.builders : undefined,
              }))}
            />
          </div>

          {tab === 'event' && <EventTab key={current.settings.key} settings={current.settings} site={current.site} pinned={pinned} onSaved={refetch} />}
          {tab === 'team' && <TeamPanel ev={ev} onAdded={refetch} />}
          {tab === 'builders' && <BuildersTab ev={ev} rows={rows.filter((r) => r.role === 'builder')} onChanged={refetch} />}
          {tab === 'sponsors' && <SponsorsTab eventKey={ev.key} pinned={pinned} onChanged={refetch} />}
          {tab === 'certificate' && <PreviewTab ev={ev} rows={rows} />}
          {tab === 'mint' && <MintTab rows={rows} onChanged={refetch} />}
          {tab === 'send' && <SendTab eventKey={ev.key} rows={rows} onChanged={refetch} />}
        </>
      )}
    </AdminShell>
  );
}

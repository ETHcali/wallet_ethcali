import { useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/admin/AdminShell';
import { usePrivy } from '@privy-io/react-auth';
import { useSwagArtwork, type SwagVariant, type ArtworkStatus } from '../../hooks/swag';

const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

const STATUS_STYLE: Record<ArtworkStatus, { label: string; className: string }> = {
  draft:         { label: 'Draft',    className: 'bg-surface-ridge text-content-secondary' },
  artwork_ready: { label: 'In Drive', className: 'bg-signal-pending/15 text-signal-pending' },
  pinned:        { label: 'Pinned',   className: 'bg-eth-blue/15 text-eth-blue-text' },
  live:          { label: 'Live',     className: 'bg-signal-confirmed/15 text-signal-confirmed' },
};

function StatusPill({ status }: { status: ArtworkStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}

function VariantRow({ variant }: { variant: SwagVariant }) {
  const { update, pin } = useSwagArtwork();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [driveDraft, setDriveDraft] = useState(variant.drive_url ?? '');

  // Per-row pending state. One shared flag across 18 rows would disable the
  // whole table on every upload.
  const isPinning = pin.isPending && pin.variables?.id === variant.id;
  const isSaving = update.isPending && update.variables?.id === variant.id;

  const onPick = async (file?: File) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That is not an image.');
      return;
    }
    try {
      await pin.mutateAsync({ id: variant.id, file });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const saveDrive = async () => {
    if (driveDraft === (variant.drive_url ?? '')) return;
    setError(null);
    try {
      await update.mutateAsync({ id: variant.id, drive_url: driveDraft });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    }
  };

  return (
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-content-primary">
            {variant.label}
            <span className="ml-2 text-xs font-normal text-content-faint">#{variant.token_id}</span>
          </h3>
        </div>
        <StatusPill status={variant.status} />
      </div>

      {/* Pinned preview, from IPFS — never from Drive */}
      {variant.image_cid && (
        <a
          href={`${PINATA_GATEWAY}/ipfs/${variant.image_cid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 block overflow-hidden rounded-control border border-line-hairline"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${PINATA_GATEWAY}/ipfs/${variant.image_cid}`}
            alt={`${variant.label} product image`}
            className="h-32 w-full object-cover"
            loading="lazy"
          />
        </a>
      )}

      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-content-faint">
        Drive artwork
      </label>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={driveDraft}
          onChange={(e) => setDriveDraft(e.target.value)}
          onBlur={saveDrive}
          placeholder="https://drive.google.com/…"
          className="min-w-0 flex-1 rounded-control border border-line-hairline bg-surface-slab px-3 py-2 text-base text-content-primary outline-none focus:border-eth-blue sm:text-xs"
        />
        {variant.drive_url && (
          <a
            href={variant.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-control border border-line-hairline bg-surface-inset px-3 text-xs font-semibold text-content-secondary hover:border-eth-blue hover:text-eth-blue-text"
          >
            Open ↗
          </a>
        )}
      </div>

      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-content-faint">
        Product image (IPFS)
      </label>
      {variant.image_cid ? (
        <p className="mb-2 break-all font-mono text-[11px] text-eth-blue-text">{variant.image_cid}</p>
      ) : (
        <p className="mb-2 text-[11px] text-content-faint">
          Not pinned. The NFT cannot ship until this exists.
        </p>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={isPinning || isSaving}
        className="min-h-tap w-full rounded-control bg-eth-blue px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-muted"
      >
        {isPinning
          ? 'Pinning to IPFS…'
          : variant.image_cid
            ? 'Replace image'
            : 'Upload & pin image'}
      </button>

      {error && (
        <p className="mt-2 rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-2 text-[11px] text-signal-reverted">
          {error}
        </p>
      )}
    </div>
  );
}

export default function SwagArtworkPage() {
  const { authenticated, ready, login } = usePrivy();
  const { variants } = useSwagArtwork();

  const grouped = useMemo(() => {
    const out = new Map<string, SwagVariant[]>();
    for (const v of variants.data ?? []) {
      const list = out.get(v.sku) ?? [];
      list.push(v);
      out.set(v.sku, list);
    }
    return [...out.entries()];
  }, [variants.data]);

  const pinnedCount = (variants.data ?? []).filter((v) => v.image_cid).length;
  const total = (variants.data ?? []).length;

  return (
    <AdminShell
      active="artwork"
      title="Swag artwork"
      subtitle="Drive is where the artwork is made. IPFS is what the NFT points at. A Drive link can never be the NFT image — it serves an HTML sign-in page, not an image."
    >
      <Head>
        <title>Swag artwork · ETH Cali</title>
      </Head>

      {ready && !authenticated && (
        <div className="mx-auto max-w-md rounded-card border border-line-hairline bg-surface-inset/50 p-6 text-center sm:p-8">
          <h2 className="mb-2 text-lg font-bold text-content-primary">Operator sign-in required</h2>
          <p className="mb-5 text-sm text-content-muted">
            Artwork state is internal. Connect a wallet holding ADMIN_ROLE to view and pin
            product images.
          </p>
          <button
            type="button"
            onClick={login}
            className="min-h-tap w-full rounded-control bg-eth-blue px-4 font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift"
          >
            Connect wallet
          </button>
        </div>
      )}

      {authenticated && variants.isLoading && (
        <p className="text-sm text-content-faint">Loading…</p>
      )}

      {authenticated && variants.error && (
        <div className="rounded-card border border-signal-reverted/40 bg-signal-reverted/10 p-4 text-sm text-signal-reverted">
          {variants.error instanceof Error ? variants.error.message : 'Could not load artwork'}
        </div>
      )}

      {authenticated && !variants.isLoading && !variants.error && (
        <>
          <div className="mb-6 rounded-card border border-line-hairline bg-surface-inset/50 p-4">
            <p className="text-sm text-content-secondary">
              <span className="font-bold text-content-primary">{pinnedCount}</span> of {total} variants
              pinned to IPFS.
            </p>
            {pinnedCount < total && (
              <p className="mt-1 text-xs text-signal-pending">
                {total - pinnedCount} still unpinned — those NFTs would render broken if the
                collection were deployed today.
              </p>
            )}
          </div>

          <div className="space-y-8">
            {grouped.map(([sku, items]) => (
              <section key={sku}>
                <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-content-muted">
                  {sku}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((v) => (
                    <VariantRow key={v.id} variant={v} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}

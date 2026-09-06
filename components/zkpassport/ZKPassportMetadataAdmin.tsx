import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useZKPassportMetadata, useUpdateZKPassportMetadata, ZKPassportMetadata } from '../../hooks/useZKPassportAdmin';

export function ZKPassportMetadataAdmin() {
  const { metadata, isLoading, error, refetch } = useZKPassportMetadata();
  const { updateMetadata, canUpdate } = useUpdateZKPassportMetadata();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<ZKPassportMetadata>({
    imageURI: '',
    description: '',
    externalURL: '',
    useIPFS: false,
  });

  // Sync form with loaded metadata
  useEffect(() => {
    if (metadata) {
      setForm(metadata);
    }
  }, [metadata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    if (!form.imageURI.trim()) {
      setSubmitError('Image URI is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateMetadata(form);
      setSuccess(true);
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update metadata');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = metadata && (
    form.imageURI !== metadata.imageURI ||
    form.description !== metadata.description ||
    form.externalURL !== metadata.externalURL ||
    form.useIPFS !== metadata.useIPFS
  );

  if (isLoading) {
    return (
      <div className="rounded-card border border-line-hairline bg-surface-slab/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-eth-blue border-t-transparent" />
          <span className="ml-3 text-content-muted">Loading metadata...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-signal-reverted/40 bg-signal-reverted/10 p-6">
        <p className="text-signal-reverted">Error loading metadata: {error}</p>
        <button onClick={() => refetch()} className="mt-3 text-sm text-eth-blue-text hover:text-eth-blue-text">
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-line-hairline bg-surface-slab/60 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-content-primary">NFT Metadata Settings</h2>
          <p className="text-sm text-content-faint">Configure the image, description, and URL for all ZKPassport NFTs</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-eth-blue-text hover:text-eth-blue-text transition"
        >
          Refresh
        </button>
      </div>

      {/* Preview Card */}
      <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
        <p className="text-xs text-content-faint uppercase tracking-wider mb-3">Preview</p>
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-control border border-line-strong bg-surface-ridge overflow-hidden flex-shrink-0">
            {form.imageURI ? (
              <Image
                src={form.imageURI}
                alt="NFT Preview"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-content-faint text-xs">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-content-primary font-medium">ZKPassport NFT</h3>
            <p className="text-sm text-content-muted line-clamp-2 mt-1">
              {form.description || 'No description set'}
            </p>
            {form.externalURL && (
              <a
                href={form.externalURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-eth-blue-text hover:text-eth-blue-text mt-2 inline-block"
              >
                {form.externalURL}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm text-content-muted">Image URI</label>
          <input
            type="text"
            value={form.imageURI}
            onChange={(e) => setForm({ ...form, imageURI: e.target.value })}
            className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none font-mono text-sm"
            placeholder="https://ipfs.io/ipfs/... or https://..."
            disabled={isSubmitting}
          />
          <p className="text-xs text-content-faint">
            IPFS URI (ipfs://...) or HTTP URL for the NFT image
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-content-muted">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none resize-none"
            placeholder="ZKPassport Verification NFT - Proof of unique personhood..."
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-content-muted">External URL</label>
          <input
            type="text"
            value={form.externalURL}
            onChange={(e) => setForm({ ...form, externalURL: e.target.value })}
            className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none"
            placeholder="https://ethcali.org"
            disabled={isSubmitting}
          />
          <p className="text-xs text-content-faint">
            Link shown on NFT marketplaces (OpenSea, etc.)
          </p>
        </div>

        <div className="flex items-center justify-between rounded-control border border-line-hairline bg-surface-inset p-4">
          <div>
            <p className="text-content-primary font-medium">Use IPFS Gateway</p>
            <p className="text-xs text-content-faint">
              Convert ipfs:// URIs to HTTP gateway URLs in tokenURI
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, useIPFS: !form.useIPFS })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              form.useIPFS ? 'bg-eth-blue' : 'bg-surface-ridge'
            }`}
            disabled={isSubmitting}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-paper transition-transform ${
                form.useIPFS ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Current On-Chain Values */}
      {metadata && (
        <div className="rounded-control border border-line-hairline bg-surface-inset/30 p-4 space-y-2">
          <p className="text-xs text-content-faint uppercase tracking-wider">Current On-Chain Values</p>
          <div className="grid gap-2 text-xs">
            <div>
              <span className="text-content-faint">Image:</span>
              <span className="ml-2 text-content-secondary font-mono break-all">{metadata.imageURI || '(not set)'}</span>
            </div>
            <div>
              <span className="text-content-faint">Description:</span>
              <span className="ml-2 text-content-secondary">{metadata.description || '(not set)'}</span>
            </div>
            <div>
              <span className="text-content-faint">External URL:</span>
              <span className="ml-2 text-content-secondary">{metadata.externalURL || '(not set)'}</span>
            </div>
            <div>
              <span className="text-content-faint">Use IPFS:</span>
              <span className="ml-2 text-content-secondary">{metadata.useIPFS ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3">
          <p className="text-sm text-signal-reverted">{submitError}</p>
        </div>
      )}

      {success && (
        <div className="rounded-control border border-signal-confirmed/40 bg-signal-confirmed/10 p-3">
          <p className="text-sm text-signal-confirmed">Metadata updated successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !canUpdate || !hasChanges}
        className="w-full rounded-card bg-eth-blue hover:bg-eth-blue-lift p-3 font-medium text-content-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? 'Updating Metadata...' : hasChanges ? 'Update Metadata' : 'No Changes'}
      </button>
    </form>
  );
}

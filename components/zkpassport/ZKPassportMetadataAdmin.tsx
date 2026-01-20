import { useState, useEffect } from 'react';
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading metadata...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading metadata: {error}</p>
        <button onClick={() => refetch()} className="mt-3 text-sm text-cyan-400 hover:text-cyan-300">
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">NFT Metadata Settings</h2>
          <p className="text-sm text-slate-500">Configure the image, description, and URL for all ZKPassport NFTs</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          Refresh
        </button>
      </div>

      {/* Preview Card */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Preview</p>
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-lg border border-slate-600 bg-slate-700 overflow-hidden flex-shrink-0">
            {form.imageURI ? (
              <img
                src={form.imageURI}
                alt="NFT Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium">ZKPassport NFT</h3>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
              {form.description || 'No description set'}
            </p>
            {form.externalURL && (
              <a
                href={form.externalURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 inline-block"
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
          <label className="block text-sm text-slate-400">Image URI</label>
          <input
            type="text"
            value={form.imageURI}
            onChange={(e) => setForm({ ...form, imageURI: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono text-sm"
            placeholder="https://ipfs.io/ipfs/... or https://..."
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500">
            IPFS URI (ipfs://...) or HTTP URL for the NFT image
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-slate-400">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
            placeholder="ZKPassport Verification NFT - Proof of unique personhood..."
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-slate-400">External URL</label>
          <input
            type="text"
            value={form.externalURL}
            onChange={(e) => setForm({ ...form, externalURL: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="https://ethcali.org"
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500">
            Link shown on NFT marketplaces (OpenSea, etc.)
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4">
          <div>
            <p className="text-white font-medium">Use IPFS Gateway</p>
            <p className="text-xs text-slate-500">
              Convert ipfs:// URIs to HTTP gateway URLs in tokenURI
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, useIPFS: !form.useIPFS })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              form.useIPFS ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
            disabled={isSubmitting}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                form.useIPFS ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Current On-Chain Values */}
      {metadata && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Current On-Chain Values</p>
          <div className="grid gap-2 text-xs">
            <div>
              <span className="text-slate-500">Image:</span>
              <span className="ml-2 text-slate-300 font-mono break-all">{metadata.imageURI || '(not set)'}</span>
            </div>
            <div>
              <span className="text-slate-500">Description:</span>
              <span className="ml-2 text-slate-300">{metadata.description || '(not set)'}</span>
            </div>
            <div>
              <span className="text-slate-500">External URL:</span>
              <span className="ml-2 text-slate-300">{metadata.externalURL || '(not set)'}</span>
            </div>
            <div>
              <span className="text-slate-500">Use IPFS:</span>
              <span className="ml-2 text-slate-300">{metadata.useIPFS ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-sm text-red-300">{submitError}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3">
          <p className="text-sm text-green-300">Metadata updated successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !canUpdate || !hasChanges}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3 font-medium text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? 'Updating Metadata...' : hasChanges ? 'Update Metadata' : 'No Changes'}
      </button>
    </form>
  );
}

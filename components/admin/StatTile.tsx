/** One headline number. Never renders a raw base unit — callers format first. */
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-content-primary" title={value}>
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-[11px] text-content-faint" title={hint}>{hint}</p>}
    </div>
  );
}

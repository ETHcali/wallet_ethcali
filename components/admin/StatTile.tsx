import Link from 'next/link';

/**
 * One headline number. Never renders a raw base unit — callers format first.
 * With `href` the tile is a link to the list behind the number.
 */
export function StatTile({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-content-primary" title={value}>
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-[11px] text-content-faint" title={hint}>{hint}</p>}
    </>
  );
  const frame = 'block rounded-card border border-line-hairline bg-surface-inset/50 p-4';
  return href ? (
    <Link href={href} className={`${frame} transition-colors hover:border-line-brand`}>
      {body}
    </Link>
  ) : (
    <div className={frame}>{body}</div>
  );
}

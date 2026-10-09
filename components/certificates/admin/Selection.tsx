/**
 * What the Mint and Send tabs share: a role filter (builders / team / all)
 * and a row selection that keeps its picks when the filter changes.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminCertificate } from '../../../types/certificates';

export type RoleScope = 'builders' | 'team' | 'all';

export function inScope(r: AdminCertificate, scope: RoleScope): boolean {
  return scope === 'all' || (scope === 'builders' ? r.role === 'builder' : r.role !== 'builder');
}

export function RoleChips({ scope, setScope, rows }: { scope: RoleScope; setScope: (s: RoleScope) => void; rows: AdminCertificate[] }) {
  const n = (s: RoleScope) => rows.filter((r) => inScope(r, s)).length;
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {(
        [
          ['builders', 'Builders'],
          ['team', 'Team'],
          ['all', 'Everyone'],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setScope(id)}
          aria-pressed={scope === id}
          className={`min-h-[36px] rounded-full px-3.5 text-xs font-semibold transition-colors ${
            scope === id ? 'bg-eth-blue/15 text-eth-blue-text' : 'border border-line-hairline text-content-muted hover:text-content-primary'
          }`}
        >
          {label} · {n(id)}
        </button>
      ))}
    </div>
  );
}

/** Picks by row id; `canPick` decides which rows the header box selects. */
export function useSelection(rows: AdminCertificate[], canPick: (r: AdminCertificate) => boolean) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const pickable = useMemo(() => rows.filter(canPick), [rows, canPick]);
  const all = pickable.length > 0 && pickable.every((r) => picked.has(r.id));
  const some = !all && pickable.some((r) => picked.has(r.id));
  const headerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = some;
  }, [some]);
  return {
    picked,
    selected: rows.filter((r) => picked.has(r.id)),
    clear: () => setPicked(new Set()),
    header: {
      ref: headerRef,
      checked: all,
      disabled: pickable.length === 0,
      onChange: () =>
        setPicked((prev) => {
          const next = new Set(prev);
          for (const r of pickable) {
            if (all) next.delete(r.id);
            else next.add(r.id);
          }
          return next;
        }),
    },
    toggle: (id: number, on: boolean) =>
      setPicked((prev) => {
        const next = new Set(prev);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      }),
  };
}

export const who = (r: AdminCertificate, roleLabel: string) => (r.role === 'builder' ? r.projectName ?? '—' : roleLabel);

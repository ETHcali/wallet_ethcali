/**
 * The CMS form. One field schema drives both the list columns and the editor, so
 * a new column is added in exactly one place.
 *
 * Every mutating control owns its own pending state. There is no shared
 * `isLoading` here on purpose: with one flag, saving a row disables the publish
 * toggle on every other row, and a failed save leaves the whole table dead.
 */
import React, { useEffect, useState } from 'react';

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'boolean';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  /** Shown in the list view as a column. */
  inList?: boolean;
  required?: boolean;
  help?: string;
  /** Once a row exists this field is read-only — slugs are permanent URLs. */
  lockedAfterCreate?: boolean;
}

interface Props<T> {
  fields: readonly FieldDef[];
  /** null means "create a new row". */
  row: T | null;
  onSave: (values: Record<string, unknown>) => Promise<unknown>;
  onCancel: () => void;
}

function initialValues<T extends Record<string, unknown>>(
  fields: readonly FieldDef[],
  row: T | null
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of fields) {
    const raw = row?.[f.key];
    if (f.type === 'boolean') values[f.key] = raw === true ? 'true' : 'false';
    else values[f.key] = raw === null || raw === undefined ? '' : String(raw);
  }
  return values;
}

/** '' means "leave this empty", which the API turns into SQL NULL. */
function toPayload(fields: readonly FieldDef[], values: Record<string, string>) {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.key] ?? '';
    if (f.type === 'boolean') payload[f.key] = v === 'true';
    else if (f.type === 'number') payload[f.key] = v.trim() === '' ? null : Number(v);
    else payload[f.key] = v;
  }
  return payload;
}

export function ContentEditor<T extends Record<string, unknown>>({
  fields,
  row,
  onSave,
  onCancel,
}: Props<T>) {
  const [values, setValues] = useState(() => initialValues(fields, row));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when the editor is pointed at a different row, or the previous row's
  // text would persist into the next one.
  useEffect(() => setValues(initialValues(fields, row)), [fields, row]);

  const creating = row === null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = toPayload(fields, values);
      if (!creating) payload.id = row?.id;
      // A locked field must not be sent on update — the server would accept it.
      if (!creating) {
        for (const f of fields) if (f.lockedAfterCreate) delete payload[f.key];
      }
      await onSave(payload);
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      // Always clears, including on a rejected save — otherwise the button
      // stays disabled and the row can never be fixed.
      setSaving(false);
    }
  }

  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const inputClass =
    'w-full rounded-control border border-line-hairline bg-surface-slab px-3 py-2 text-sm text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none';

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const locked = !creating && f.lockedAfterCreate;
          return (
            <label
              key={f.key}
              className={f.type === 'textarea' ? 'sm:col-span-2 block' : 'block'}
            >
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-content-faint">
                {f.label}
                {f.required && <span className="ml-1 text-signal-pending">*</span>}
              </span>

              {f.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={values[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                />
              ) : f.type === 'select' ? (
                <select
                  value={values[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === 'boolean' ? (
                <select
                  value={values[f.key] ?? 'false'}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              ) : (
                <input
                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  value={values[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  disabled={locked}
                  className={`${inputClass} ${locked ? 'cursor-not-allowed opacity-50' : ''}`}
                />
              )}

              {(f.help || locked) && (
                <span className="mt-1 block text-[11px] leading-relaxed text-content-faint">
                  {locked
                    ? 'Fixed after creation — this is the public URL, and changing it breaks every shared link.'
                    : f.help}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {error && (
        <p className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="min-h-tap rounded-control bg-eth-blue px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : creating ? 'Create' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-tap rounded-control border border-line-hairline px-4 text-sm font-semibold text-content-secondary transition-colors hover:border-line-strong hover:text-content-primary disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ContentEditor;

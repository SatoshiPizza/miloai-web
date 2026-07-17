"use client";

/**
 * EditableChips — renders what the AI extracted for one block as removable
 * chips (for list fields) and inline text (for scalar fields), so the user
 * can see exactly what was understood and prune anything wrong before it
 * feeds creative generation.
 *
 * This is the "AI fills → you correct" half of the intake loop. Editing here
 * is local; the parent decides when to persist (we re-extract on the next
 * answer, so light local pruning doesn't need its own round-trip — see the
 * intake page).
 */

import { X } from "lucide-react";

export type ChipField = {
  label: string;
  /** list of values (chips) OR a single scalar shown as text */
  values: string[];
  scalar?: boolean;
};

export function EditableChips({
  fields,
  onRemove,
}: {
  fields: ChipField[];
  onRemove?: (fieldLabel: string, value: string) => void;
}) {
  const nonEmpty = fields.filter((f) => f.values.length > 0);
  if (nonEmpty.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {nonEmpty.map((f) => (
        <div key={f.label}>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">
            {f.label}
          </div>
          {f.scalar ? (
            <div className="text-[13.5px] leading-relaxed text-[var(--ink)]">
              {f.values[0]}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {f.values.map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px]"
                  style={{
                    background: "var(--peach-wash)",
                    border: "1px solid var(--peach-soft)",
                    color: "var(--ink)",
                  }}
                >
                  {v}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(f.label, v)}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                      title="Убрать"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

export type ChipOption = { value: string; label: string };

/**
 * Chips rather than checkboxes for the short enumerations. They are a far
 * larger touch target than a 16px box, and on a phone this panel is driven with
 * a thumb.
 */
export function ChipGroup({
  options,
  selected,
  onToggle,
  label,
}: {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete",
              active
                ? "border-bete bg-bete text-paper"
                : "border-stone-soft bg-surface text-ink-soft hover:border-stone hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The "at least N" control for bedrooms and bathrooms. Single-select, because
 * asking for "2 or 3 bedrooms but not 4" is a distinction nobody makes when
 * house-hunting.
 */
export function CountSelector({
  value,
  onChange,
  label,
  anyLabel,
  formatCount,
  max = 4,
}: {
  value: number | undefined;
  onChange: (value: number | null) => void;
  label: string;
  anyLabel: string;
  formatCount: (count: number) => string;
  max?: number;
}) {
  const counts = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange(null)}
        className={cn(
          "min-w-14 rounded-full border px-3 py-1.5 text-sm transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete",
          !value
            ? "border-bete bg-bete text-paper"
            : "border-stone-soft bg-surface text-ink-soft hover:border-stone hover:text-ink",
        )}
      >
        {anyLabel}
      </button>
      {counts.map((count) => {
        const active = value === count;
        return (
          <button
            key={count}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : count)}
            className={cn(
              "min-w-14 rounded-full border px-3 py-1.5 text-sm transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete",
              active
                ? "border-bete bg-bete text-paper"
                : "border-stone-soft bg-surface text-ink-soft hover:border-stone hover:text-ink",
            )}
          >
            {formatCount(count)}
          </button>
        );
      })}
    </div>
  );
}

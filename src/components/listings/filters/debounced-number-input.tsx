"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Typing "1500000" should not fire seven searches. The field keeps its own
 * string state while the user types and only pushes to the URL once they pause,
 * but it still re-syncs when the URL changes underneath it — which happens on
 * "clear all" and on the back button.
 */
export function DebouncedNumberInput({
  value,
  onCommit,
  label,
  placeholder,
  delay = 500,
  className,
}: {
  value: number | undefined;
  onCommit: (value: number | null) => void;
  label: string;
  placeholder?: string;
  delay?: number;
  className?: string;
}) {
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value?.toString() ?? "");
    }
  }, [value]);

  useEffect(() => {
    const parsed = draft.trim() === "" ? null : Number(draft);
    const next = parsed !== null && Number.isFinite(parsed) ? parsed : null;
    if (next === (committed.current ?? null)) return;

    const timer = setTimeout(() => {
      committed.current = next ?? undefined;
      onCommit(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [draft, delay, onCommit]);

  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-ink-soft">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        className={cn(
          "w-full rounded-lg border border-stone-soft bg-surface px-3 py-2 text-sm text-ink",
          "placeholder:text-stone focus:border-bete focus:outline-none",
        )}
      />
    </label>
  );
}

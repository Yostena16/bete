"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useListingFilters } from "./filters/use-listing-filters";

/**
 * Free text is debounced like the numeric fields, and submits immediately on
 * Enter so the keyboard-first path is not made to wait out the timer.
 */
export function SearchBox({ className }: { className?: string }) {
  const t = useTranslations("filters");
  const { filters, apply } = useListingFilters();
  const [draft, setDraft] = useState(filters.q ?? "");
  const committed = useRef(filters.q);

  useEffect(() => {
    if (filters.q !== committed.current) {
      committed.current = filters.q;
      setDraft(filters.q ?? "");
    }
  }, [filters.q]);

  useEffect(() => {
    const next = draft.trim() || null;
    if (next === (committed.current ?? null)) return;
    const timer = setTimeout(() => {
      committed.current = next ?? undefined;
      apply({ q: next });
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, apply]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        committed.current = draft.trim() || undefined;
        apply({ q: draft.trim() || null });
      }}
      className={cn("relative", className)}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone"
        aria-hidden="true"
      />
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchLabel")}
        className="w-full rounded-lg border border-stone-soft bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-stone focus:border-bete focus:outline-none"
      />
    </form>
  );
}

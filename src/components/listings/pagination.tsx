"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useListingFilters } from "./filters/use-listing-filters";

/**
 * Windowed page numbers rather than a "load more" button, because a search
 * result someone wants to send to a spouse has to be a stable, linkable page.
 */
function pageWindow(current: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);

  const pages = new Set<number>([1, count, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < count) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const output: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) output.push("gap");
    output.push(page);
    previous = page;
  }
  return output;
}

export function Pagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const t = useTranslations("common");
  const { apply } = useListingFilters();

  if (pageCount <= 1) return null;

  const go = (target: number) => {
    apply({ page: target <= 1 ? null : target });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buttonBase =
    "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label={t("previous")}
        className={cn(buttonBase, "border-stone-soft bg-surface text-ink-soft")}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      {pageWindow(page, pageCount).map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-stone">
            &hellip;
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => go(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              buttonBase,
              entry === page
                ? "border-bete bg-bete text-paper"
                : "border-stone-soft bg-surface text-ink-soft hover:border-stone hover:text-ink",
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        aria-label={t("next")}
        className={cn(buttonBase, "border-stone-soft bg-surface text-ink-soft")}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

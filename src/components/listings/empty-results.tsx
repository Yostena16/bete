"use client";

import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useListingFilters } from "./filters/use-listing-filters";

/**
 * The empty state doubles as a place to explain why Bete returns fewer results
 * than its competitors. An empty search is the moment that difference looks
 * like a weakness, so it is also the moment to name it as a choice.
 */
export function EmptyResults() {
  const t = useTranslations("results");
  const { clearAll } = useListingFilters();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-stone-soft bg-surface px-6 py-16 text-center">
      <SearchX className="size-8 text-stone" aria-hidden="true" />
      <h2 className="font-display text-lg font-semibold text-ink">
        {t("emptyTitle")}
      </h2>
      <p className="max-w-md text-sm text-ink-soft">{t("emptyBody")}</p>
      <Button
        onClick={clearAll}
        className="mt-1 bg-bete text-paper hover:bg-bete-soft"
      >
        {t("emptyAction")}
      </Button>
      <p className="mt-4 max-w-lg border-t border-stone-soft pt-4 text-xs text-ink-soft">
        {t("emptyExpiredNote")}
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { countActiveFilters } from "@/lib/listings/search-params";
import { FilterPanel } from "./filter-panel";
import { useListingFilters } from "./use-listing-filters";
import type { AreaOption } from "./area-picker";
import type { ListingType } from "@/generated/prisma/enums";

/**
 * On phones the panel becomes a full-height sheet with a sticky footer showing
 * the live result count, so the cost of a filter is visible before the sheet is
 * dismissed. The count comes from the server render, which the panel has
 * already triggered as each filter is tapped.
 */
export function FilterSheet({
  areas,
  listingType,
  total,
}: {
  areas: AreaOption[];
  listingType: ListingType;
  total: number;
}) {
  const t = useTranslations("filters");
  const { filters } = useListingFilters();
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 border-stone-soft lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {t("openLabel", { count: activeCount })}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col gap-0 sm:max-w-sm">
        <SheetHeader className="border-b border-stone-soft">
          <SheetTitle className="font-display">{t("title")}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <FilterPanel areas={areas} listingType={listingType} />
        </div>

        <div className="border-t border-stone-soft p-4">
          <Button
            className="w-full bg-bete text-paper hover:bg-bete-soft"
            onClick={() => setOpen(false)}
          >
            {t("showResults", { count: total })}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

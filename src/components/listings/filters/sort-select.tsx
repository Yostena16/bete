"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORTS, type Sort } from "@/lib/listings/search-params";
import { useListingFilters } from "./use-listing-filters";

const LABEL_KEY: Record<Sort, string> = {
  fresh: "sortFresh",
  priceAsc: "sortPriceAsc",
  priceDesc: "sortPriceDesc",
  newest: "sortNewest",
};

/**
 * "Most recently confirmed" is first and is the default. Price sorting is
 * offered but never assumed, because a price-sorted default is precisely how
 * every competing site ends up leading with listings that went months ago.
 */
export function SortSelect() {
  const t = useTranslations("filters");
  const { filters, apply } = useListingFilters();

  return (
    <Select
      value={filters.sort}
      onValueChange={(value) => apply({ sort: value as Sort })}
    >
      <SelectTrigger
        aria-label={t("sort")}
        className="w-full border-stone-soft bg-surface sm:w-56"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORTS.map((sort) => (
          <SelectItem key={sort} value={sort}>
            {t(LABEL_KEY[sort] as "sortFresh")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

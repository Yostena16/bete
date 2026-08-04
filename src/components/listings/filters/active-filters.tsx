"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatArea, formatPrice } from "@/lib/format";
import { useListingFilters } from "./use-listing-filters";
import type { FilterPatch } from "@/lib/listings/filter-url";
import type { AreaOption } from "./area-picker";

type Chip = { key: string; label: string; patch: FilterPatch };

/**
 * A summary row above the results, so the reason a search returned four homes
 * is visible without reopening the panel. On mobile this is often the only part
 * of the filter UI on screen, which is why each chip removes exactly one
 * constraint rather than dumping the user back into the full panel.
 */
export function ActiveFilters({ areas }: { areas: AreaOption[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const { filters, apply, clearAll } = useListingFilters();
  const isAmharic = locale === "am";

  const areaName = (slug: string) => {
    const area = areas.find((candidate) => candidate.slug === slug);
    if (!area) return slug;
    return isAmharic ? area.nameAm : area.nameEn;
  };

  const chips: Chip[] = [];

  for (const slug of filters.area) {
    chips.push({
      key: `area:${slug}`,
      label: areaName(slug),
      patch: { area: filters.area.filter((item) => item !== slug) },
    });
  }
  for (const value of filters.property) {
    chips.push({
      key: `property:${value}`,
      label: t(`propertyType.${value}` as "propertyType.VILLA"),
      patch: { property: filters.property.filter((item) => item !== value) },
    });
  }
  for (const value of filters.furnishing) {
    chips.push({
      key: `furnishing:${value}`,
      label: t(`furnishing.${value}` as "furnishing.FURNISHED"),
      patch: { furnishing: filters.furnishing.filter((item) => item !== value) },
    });
  }
  for (const value of filters.lister) {
    chips.push({
      key: `lister:${value}`,
      label: t(`listerType.${value}` as "listerType.OWNER"),
      patch: { lister: filters.lister.filter((item) => item !== value) },
    });
  }
  for (const slug of filters.amenities) {
    chips.push({
      key: `amenity:${slug}`,
      label: t(`amenity.${slug}` as "amenity.generator"),
      patch: { amenities: filters.amenities.filter((item) => item !== slug) },
    });
  }
  if (filters.beds) {
    chips.push({
      key: "beds",
      label: `${t("filters.beds")} ${t("filters.plus", { count: filters.beds })}`,
      patch: { beds: null },
    });
  }
  if (filters.baths) {
    chips.push({
      key: "baths",
      label: `${t("filters.baths")} ${t("filters.plus", { count: filters.baths })}`,
      patch: { baths: null },
    });
  }
  if (filters.minPrice) {
    chips.push({
      key: "minPrice",
      label: `${t("filters.priceMin")} ${formatPrice(filters.minPrice, "ETB", locale)}`,
      patch: { minPrice: null },
    });
  }
  if (filters.maxPrice) {
    chips.push({
      key: "maxPrice",
      label: `${t("filters.priceMax")} ${formatPrice(filters.maxPrice, "ETB", locale)}`,
      patch: { maxPrice: null },
    });
  }
  if (filters.minArea) {
    chips.push({
      key: "minArea",
      label: `${t("filters.minArea")} ${formatArea(filters.minArea)}`,
      patch: { minArea: null },
    });
  }
  if (filters.advanceMax) {
    chips.push({
      key: "advanceMax",
      label: t("filters.advanceMax", { months: filters.advanceMax }),
      patch: { advanceMax: null },
    });
  }
  if (filters.rentPeriod) {
    chips.push({
      key: "rentPeriod",
      label: t(`filters.${filters.rentPeriod}` as "filters.MONTHLY"),
      patch: { rentPeriod: null },
    });
  }
  if (filters.negotiable) {
    chips.push({
      key: "negotiable",
      label: t("filters.negotiable"),
      patch: { negotiable: null },
    });
  }
  if (filters.q) {
    chips.push({ key: "q", label: `"${filters.q}"`, patch: { q: null } });
  }

  if (chips.length === 0) return null;

  return (
    <ul
      aria-label={t("filters.activeLabel")}
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => apply(chip.patch)}
            aria-label={t("filters.clearOne", { label: chip.label })}
            className="flex items-center gap-1 rounded-full border border-stone-soft bg-surface py-1 pl-3 pr-2 text-sm text-ink-soft transition-colors hover:border-stone hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
          >
            {chip.label}
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
      {chips.length > 1 ? (
        <li>
          <button
            type="button"
            onClick={clearAll}
            className="px-1 text-sm text-bete underline underline-offset-4 hover:text-bete-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
          >
            {t("filters.clearAll")}
          </button>
        </li>
      ) : null}
    </ul>
  );
}

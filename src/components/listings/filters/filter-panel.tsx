"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { countActiveFilters } from "@/lib/listings/search-params";
import { useListingFilters } from "./use-listing-filters";
import { FilterSection } from "./filter-section";
import { ChipGroup, CountSelector } from "./chip-group";
import { DebouncedNumberInput } from "./debounced-number-input";
import { AreaPicker, type AreaOption } from "./area-picker";
import type { ListingType } from "@/generated/prisma/enums";

const PROPERTY_TYPES = [
  "CONDOMINIUM",
  "APARTMENT",
  "VILLA",
  "SERVICE_QUARTER",
  "WHOLE_BUILDING",
  "SHOP",
  "OFFICE",
  "WAREHOUSE",
  "LAND",
] as const;

const FURNISHINGS = ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const;
const LISTER_TYPES = ["OWNER", "BROKER", "AGENCY"] as const;
const KEY_AMENITIES = ["generator", "water-tank"] as const;

export function FilterPanel({
  areas,
  listingType,
  className,
}: {
  areas: AreaOption[];
  listingType: ListingType;
  className?: string;
}) {
  const t = useTranslations();
  const { filters, apply, toggle, clearAll, isPending } = useListingFilters();
  const activeCount = countActiveFilters(filters);
  const isRent = listingType === "FOR_RENT";

  const setMinPrice = useCallback(
    (value: number | null) => apply({ minPrice: value }),
    [apply],
  );
  const setMaxPrice = useCallback(
    (value: number | null) => apply({ maxPrice: value }),
    [apply],
  );
  const setMinArea = useCallback(
    (value: number | null) => apply({ minArea: value }),
    [apply],
  );

  return (
    <div
      className={cn(
        "flex flex-col",
        isPending && "opacity-70 transition-opacity",
        className,
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-display text-base font-semibold text-ink">
          {t("filters.title")}
        </h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-bete underline underline-offset-4 hover:text-bete-soft"
          >
            {t("filters.clearAll")}
          </button>
        ) : null}
      </div>

      <FilterSection title={t("filters.price")} hint={t("filters.priceHint")}>
        <div className="grid grid-cols-2 gap-2">
          <DebouncedNumberInput
            value={filters.minPrice}
            onCommit={setMinPrice}
            label={t("filters.priceMin")}
            placeholder="0"
          />
          <DebouncedNumberInput
            value={filters.maxPrice}
            onCommit={setMaxPrice}
            label={t("filters.priceMax")}
          />
        </div>
      </FilterSection>

      <FilterSection title={t("filters.beds")}>
        <CountSelector
          value={filters.beds}
          onChange={(value) => apply({ beds: value })}
          label={t("filters.beds")}
          anyLabel={t("filters.any")}
          formatCount={(count) => t("filters.plus", { count })}
        />
      </FilterSection>

      <FilterSection title={t("filters.baths")}>
        <CountSelector
          value={filters.baths}
          onChange={(value) => apply({ baths: value })}
          label={t("filters.baths")}
          anyLabel={t("filters.any")}
          formatCount={(count) => t("filters.plus", { count })}
          max={3}
        />
      </FilterSection>

      <FilterSection title={t("filters.area")}>
        <AreaPicker
          areas={areas}
          selected={filters.area}
          onToggle={(slug) => toggle("area", slug)}
        />
      </FilterSection>

      <FilterSection title={t("filters.propertyType")}>
        <ChipGroup
          label={t("filters.propertyType")}
          selected={filters.property}
          onToggle={(value) => toggle("property", value)}
          options={PROPERTY_TYPES.map((value) => ({
            value,
            label: t(`propertyType.${value}`),
          }))}
        />
      </FilterSection>

      <FilterSection title={t("filters.amenities")}>
        <ChipGroup
          label={t("filters.amenities")}
          selected={filters.amenities}
          onToggle={(value) => toggle("amenities", value)}
          options={KEY_AMENITIES.map((value) => ({
            value,
            label: t(`amenity.${value}`),
          }))}
        />
      </FilterSection>

      <FilterSection title={t("filters.furnishing")}>
        <ChipGroup
          label={t("filters.furnishing")}
          selected={filters.furnishing}
          onToggle={(value) => toggle("furnishing", value)}
          options={FURNISHINGS.map((value) => ({
            value,
            label: t(`furnishing.${value}`),
          }))}
        />
      </FilterSection>

      <FilterSection title={t("filters.lister")}>
        <ChipGroup
          label={t("filters.lister")}
          selected={filters.lister}
          onToggle={(value) => toggle("lister", value)}
          options={LISTER_TYPES.map((value) => ({
            value,
            label: t(`listerType.${value}`),
          }))}
        />
      </FilterSection>

      {isRent ? (
        <>
          <FilterSection title={t("filters.rentPeriod")}>
            <ChipGroup
              label={t("filters.rentPeriod")}
              selected={filters.rentPeriod ? [filters.rentPeriod] : []}
              onToggle={(value) =>
                apply({ rentPeriod: filters.rentPeriod === value ? null : value })
              }
              options={(["MONTHLY", "ANNUAL"] as const).map((value) => ({
                value,
                label: t(`filters.${value}`),
              }))}
            />
          </FilterSection>

          <FilterSection title={t("filters.advance")}>
            <ChipGroup
              label={t("filters.advance")}
              selected={filters.advanceMax ? [String(filters.advanceMax)] : []}
              onToggle={(value) =>
                apply({
                  advanceMax:
                    filters.advanceMax === Number(value) ? null : Number(value),
                })
              }
              options={[1, 3, 6].map((months) => ({
                value: String(months),
                label: t("filters.advanceMax", { months }),
              }))}
            />
          </FilterSection>
        </>
      ) : null}

      <FilterSection title={t("filters.minArea")}>
        <DebouncedNumberInput
          value={filters.minArea}
          onCommit={setMinArea}
          label="m²"
          className="max-w-40"
        />
      </FilterSection>

      <FilterSection title={t("common.negotiable")} className="border-b-0">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={filters.negotiable}
            onChange={(event) => apply({ negotiable: event.target.checked })}
            className="size-4 accent-bete"
          />
          {t("filters.negotiable")}
        </label>
      </FilterSection>
    </div>
  );
}

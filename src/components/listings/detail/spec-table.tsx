import { useLocale, useTranslations } from "next-intl";
import { formatArea, formatFloors } from "@/lib/format";
import type { ListingDetail } from "@/lib/listings/detail";

/**
 * A definition list rather than a table, because these are attributes of one
 * thing rather than rows of comparable records — and because a real table
 * cannot reflow to a single column on a phone without fighting it.
 */
export function SpecTable({ listing }: { listing: ListingDetail }) {
  const t = useTranslations("detail");
  const tProperty = useTranslations("propertyType");
  const tFurnishing = useTranslations("furnishing");
  const tFilters = useTranslations("filters");
  const locale = useLocale();

  const rows: Array<{ label: string; value: string }> = [
    { label: t("propertyType"), value: tProperty(listing.propertyType) },
  ];

  if (listing.bedrooms !== null) {
    rows.push({
      label: t("bedrooms"),
      value:
        listing.bedrooms === 0
          ? t("studio")
          : new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-US").format(
              listing.bedrooms,
            ),
    });
  }
  if (listing.bathrooms !== null) {
    rows.push({
      label: t("bathrooms"),
      value: String(listing.bathrooms),
    });
  }
  if (listing.areaSqm !== null) {
    rows.push({ label: t("size"), value: formatArea(listing.areaSqm) });
  }
  if (listing.floorsGPlus !== null) {
    rows.push({ label: t("floors"), value: formatFloors(listing.floorsGPlus) });
  }
  if (listing.furnishing) {
    rows.push({
      label: t("furnishing"),
      value: tFurnishing(listing.furnishing),
    });
  }
  if (listing.listingType === "FOR_RENT") {
    rows.push({
      label: t("advance"),
      value:
        listing.advanceMonths !== null
          ? t("advanceMonths", { months: listing.advanceMonths })
          : t("advanceUnstated"),
    });
    if (listing.rentPeriod) {
      rows.push({
        label: t("rentPeriod"),
        value: tFilters(listing.rentPeriod),
      });
    }
  }
  rows.push({
    label: t("negotiable"),
    value: listing.priceNegotiable ? t("yes") : t("no"),
  });

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-0 sm:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col border-b border-stone-soft py-3"
        >
          <dt className="text-xs uppercase tracking-wide text-stone">
            {row.label}
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

import { z } from "zod";

export const SORTS = ["fresh", "priceAsc", "priceDesc", "newest"] as const;
export type Sort = (typeof SORTS)[number];

export const PAGE_SIZE = 24;

/** ETB per 1 USD. Used to compare mixed-currency prices in one range filter. */
export const USD_TO_ETB = Number(process.env.NEXT_PUBLIC_USD_TO_ETB ?? 165);

const csv = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
      : [],
  );

const bool = z
  .string()
  .optional()
  .transform((value) => value === "true" || value === "1");

const int = (min: number, max: number) =>
  z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return undefined;
      return Math.min(max, Math.max(min, Math.trunc(parsed)));
    });

/**
 * Every filter lives in the URL so a search can be pasted into a message and
 * survive the back button. The two key amenities get their own shorthand
 * parameters (?generator=true) because they are the ones people actually share.
 */
export const searchParamsSchema = z.object({
  area: csv,
  subCity: csv,
  property: csv,
  amenities: csv,
  generator: bool,
  waterTank: bool,
  negotiable: bool,
  furnishing: csv,
  lister: csv,
  rentPeriod: z.string().optional(),
  beds: int(0, 10),
  baths: int(0, 10),
  minPrice: int(0, 5_000_000_000),
  maxPrice: int(0, 5_000_000_000),
  minArea: int(0, 100_000),
  advanceMax: int(1, 12),
  q: z.string().optional(),
  sort: z.enum(SORTS).catch("fresh"),
  page: int(1, 500),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export function parseSearchParams(
  input: Record<string, string | string[] | undefined>,
): SearchParams {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(input)) {
    flat[key] = Array.isArray(value) ? value.join(",") : value;
  }
  return searchParamsSchema.parse(flat);
}

/** All amenity slugs a query is filtering on, shorthands folded in. */
export function requiredAmenities(params: SearchParams): string[] {
  const slugs = new Set(params.amenities);
  if (params.generator) slugs.add("generator");
  if (params.waterTank) slugs.add("water-tank");
  return [...slugs];
}

export function countActiveFilters(params: SearchParams): number {
  return (
    params.area.length +
    params.subCity.length +
    params.property.length +
    params.furnishing.length +
    params.lister.length +
    requiredAmenities(params).length +
    (params.beds ? 1 : 0) +
    (params.baths ? 1 : 0) +
    (params.minPrice ? 1 : 0) +
    (params.maxPrice ? 1 : 0) +
    (params.minArea ? 1 : 0) +
    (params.advanceMax ? 1 : 0) +
    (params.negotiable ? 1 : 0) +
    (params.rentPeriod ? 1 : 0) +
    (params.q ? 1 : 0)
  );
}

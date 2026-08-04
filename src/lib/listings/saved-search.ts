import { z } from "zod";
import type { AlertFrequency, ListingType } from "@/generated/prisma/enums";
import {
  countActiveFilters,
  type SearchParams,
} from "./search-params";
import { buildQuery, parseFromSearchParams } from "./filter-url";

/**
 * Persisted shape inside SavedSearch.queryJson. The query string is the same
 * format the results pages already understand, so reopen and alert matching
 * cannot drift from live search.
 */
export const savedSearchQuerySchema = z.object({
  listingType: z.enum(["FOR_RENT", "FOR_SALE"]),
  query: z.string(),
});

export type SavedSearchQuery = z.infer<typeof savedSearchQuerySchema>;

export function parseSavedSearchQuery(raw: unknown): SavedSearchQuery | null {
  const result = savedSearchQuerySchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function filtersFromSavedSearch(query: SavedSearchQuery): SearchParams {
  return parseFromSearchParams(new URLSearchParams(query.query));
}

/** Drop pagination so alerts and reopen always start at page 1. */
export function toSavedSearchQuery(
  listingType: ListingType,
  params: SearchParams,
): SavedSearchQuery {
  const query = buildQuery("", {
    area: params.area,
    subCity: params.subCity,
    property: params.property,
    amenities: params.amenities,
    generator: params.generator,
    waterTank: params.waterTank,
    negotiable: params.negotiable,
    furnishing: params.furnishing,
    lister: params.lister,
    rentPeriod: params.rentPeriod ?? null,
    beds: params.beds ?? null,
    baths: params.baths ?? null,
    minPrice: params.minPrice ?? null,
    maxPrice: params.maxPrice ?? null,
    minArea: params.minArea ?? null,
    advanceMax: params.advanceMax ?? null,
    q: params.q ?? null,
    sort: params.sort,
    page: null,
  });
  return { listingType, query };
}

export function savedSearchHref(query: SavedSearchQuery): string {
  const base = query.listingType === "FOR_RENT" ? "/rent" : "/buy";
  return query.query ? `${base}?${query.query}` : base;
}

/** Short English label used when the seeker does not type a name. */
export function defaultSavedSearchName(
  listingType: ListingType,
  params: SearchParams,
): string {
  const parts: string[] = [];
  if (params.area.length) parts.push(params.area.slice(0, 2).join(", "));
  else if (params.subCity.length)
    parts.push(params.subCity.slice(0, 2).join(", "));
  if (params.beds) parts.push(`${params.beds}+ beds`);
  if (params.maxPrice)
    parts.push(`max ${params.maxPrice.toLocaleString("en-ET")} ETB`);
  if (params.q) parts.push(`“${params.q.slice(0, 24)}”`);

  const intent = listingType === "FOR_RENT" ? "Rent" : "Buy";
  if (parts.length === 0) {
    const n = countActiveFilters(params);
    return n > 0 ? `${intent} · ${n} filters` : `${intent} · all homes`;
  }
  return `${intent} · ${parts.join(" · ")}`.slice(0, 80);
}

export const ALERT_FREQUENCIES = [
  "INSTANT",
  "DAILY",
  "WEEKLY",
] as const satisfies ReadonlyArray<AlertFrequency>;

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Whether the alert cron should evaluate this search now.
 * INSTANT: every run (new matches since lastSentAt).
 * DAILY / WEEKLY: only after the interval from last send (or create).
 */
export function isAlertDue(
  frequency: AlertFrequency,
  lastSentAt: Date | null,
  createdAt: Date,
  now: Date,
): boolean {
  const anchor = lastSentAt ?? createdAt;
  const elapsed = now.getTime() - anchor.getTime();

  switch (frequency) {
    case "INSTANT":
      return true;
    case "DAILY":
      return elapsed >= MS_PER_DAY;
    case "WEEKLY":
      return elapsed >= 7 * MS_PER_DAY;
  }
}

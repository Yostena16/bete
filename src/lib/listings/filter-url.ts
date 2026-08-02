import {
  searchParamsSchema,
  type SearchParams,
  type Sort,
} from "./search-params";

/**
 * The inverse of `parseSearchParams`. Both directions live beside the schema so
 * the query string the client writes is by construction the one the server
 * knows how to read; a filter cannot be added to the UI and silently ignored by
 * the query.
 */
export type FilterPatch = Partial<{
  [K in keyof SearchParams]: SearchParams[K] | null;
}>;

const CSV_KEYS = [
  "area",
  "subCity",
  "property",
  "amenities",
  "furnishing",
  "lister",
] as const satisfies ReadonlyArray<keyof SearchParams>;

const BOOL_KEYS = [
  "generator",
  "waterTank",
  "negotiable",
] as const satisfies ReadonlyArray<keyof SearchParams>;

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value === false) return true;
  return false;
}

/**
 * Applies a patch to the current query string. Defaults are omitted rather than
 * written out, so a URL only ever carries the filters a person actually chose
 * and a cleared search returns to a bare path.
 */
export function buildQuery(
  current: URLSearchParams | string,
  patch: FilterPatch,
): string {
  const next = new URLSearchParams(
    typeof current === "string" ? current : current.toString(),
  );

  for (const [key, value] of Object.entries(patch)) {
    if (isEmpty(value)) {
      next.delete(key);
      continue;
    }
    next.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }

  // Any change to the result set invalidates the current page number, and
  // "fresh" is the default so it never needs to appear.
  if (!("page" in patch)) next.delete("page");
  if (next.get("sort") === "fresh") next.delete("sort");
  if (next.get("page") === "1") next.delete("page");

  next.sort();
  return next.toString();
}

/** Toggles one value inside a comma-separated multi-select parameter. */
export function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function parseFromSearchParams(params: URLSearchParams): SearchParams {
  return searchParamsSchema.parse(Object.fromEntries(params.entries()));
}

/** Everything a "clear all" has to unset, derived from the schema's own keys. */
export function emptyPatch(): FilterPatch {
  const patch: FilterPatch = {};
  for (const key of CSV_KEYS) patch[key] = null;
  for (const key of BOOL_KEYS) patch[key] = null;
  patch.beds = null;
  patch.baths = null;
  patch.minPrice = null;
  patch.maxPrice = null;
  patch.minArea = null;
  patch.advanceMax = null;
  patch.rentPeriod = null;
  patch.q = null;
  patch.page = null;
  return patch;
}

export const DEFAULT_SORT: Sort = "fresh";

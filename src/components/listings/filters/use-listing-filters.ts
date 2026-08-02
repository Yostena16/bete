"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  buildQuery,
  emptyPatch,
  parseFromSearchParams,
  toggleInList,
  type FilterPatch,
} from "@/lib/listings/filter-url";

/**
 * The URL is the single source of truth for the search. There is no local
 * filter state to fall out of sync with it, which is what makes the back
 * button, a pasted link and a page refresh all behave the way people expect.
 *
 * Navigation is wrapped in a transition so the current results stay on screen,
 * dimmed, while the server renders the next set — rather than flashing to a
 * skeleton every time a checkbox is ticked.
 */
export function useListingFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () => parseFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const apply = useCallback(
    (patch: FilterPatch) => {
      const query = buildQuery(searchParams.toString(), patch);
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  const toggle = useCallback(
    (
      key: "area" | "subCity" | "property" | "amenities" | "furnishing" | "lister",
      value: string,
    ) => {
      apply({ [key]: toggleInList(filters[key], value) });
    },
    [apply, filters],
  );

  const clearAll = useCallback(() => apply(emptyPatch()), [apply]);

  return { filters, apply, toggle, clearAll, isPending };
}

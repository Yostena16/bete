import { getTranslations } from "next-intl/server";
import { getAreas } from "@/lib/listings/areas";
import { searchListings } from "@/lib/listings/query";
import {
  countActiveFilters,
  parseSearchParams,
  PAGE_SIZE,
} from "@/lib/listings/search-params";
import { FilterPanel } from "./filters/filter-panel";
import { FilterSheet } from "./filters/filter-sheet";
import { ActiveFilters } from "./filters/active-filters";
import { SortSelect } from "./filters/sort-select";
import { SaveSearchControl } from "./save-search-control";
import { SearchBox } from "./search-box";
import { ResultsGrid } from "./results-grid";
import { EmptyResults } from "./empty-results";
import { Pagination } from "./pagination";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { auth } from "@/auth";
import { getSavedListingIds } from "@/lib/listings/saved";
import type { ListingType } from "@/generated/prisma/enums";

/**
 * Rent and buy are the same page with a different listing type, so they share
 * this component rather than duplicating the layout. The whole thing renders on
 * the server: filters are links to a new URL, not client-side state, which is
 * what lets a search be shared and indexed.
 */
export async function SearchPage({
  listingType,
  searchParams,
}: {
  listingType: ListingType;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const t = await getTranslations("results");
  const params = parseSearchParams(searchParams);
  const session = await auth();
  const [areas, result, savedIds] = await Promise.all([
    getAreas(),
    searchListings(params, listingType),
    session?.user?.id
      ? getSavedListingIds(session.user.id)
      : Promise.resolve(new Set<string>()),
  ]);

  const isRent = listingType === "FOR_RENT";
  const from = (result.page - 1) * PAGE_SIZE;
  const signedIn = Boolean(session?.user);
  const hasFilters = countActiveFilters(params) > 0;

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {isRent ? t("rentTitle") : t("buyTitle")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          {isRent ? t("rentLede") : t("buyLede")}
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <FilterPanel areas={areas} listingType={listingType} />
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <SearchBox />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FilterSheet
                  areas={areas}
                  listingType={listingType}
                  total={result.total}
                />
                <p className="text-sm text-ink-soft">
                  {t("count", { count: result.total })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SaveSearchControl
                  listingType={listingType}
                  signedIn={signedIn}
                  hasFilters={hasFilters}
                />
                <SortSelect />
              </div>
            </div>
            <ActiveFilters areas={areas} />
          </div>

          {result.listings.length === 0 ? (
            <EmptyResults />
          ) : (
            <>
              <ResultsGrid
                listings={result.listings}
                savedIds={savedIds}
                signedIn={signedIn}
              />
              <p className="text-center text-xs text-ink-soft">
                {t("pageOf", { page: result.page, total: result.pageCount })}
                {" \u00b7 "}
                {from + 1}&ndash;{from + result.listings.length}
              </p>
              <Pagination page={result.page} pageCount={result.pageCount} />
            </>
          )}
        </div>
      </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

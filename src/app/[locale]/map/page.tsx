import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FilterPanel } from "@/components/listings/filters/filter-panel";
import { FilterSheet } from "@/components/listings/filters/filter-sheet";
import { ActiveFilters } from "@/components/listings/filters/active-filters";
import { SearchBox } from "@/components/listings/search-box";
import { MapIntentToggle } from "@/components/map/map-intent-toggle";
import { SearchMapBoundary } from "@/components/map/search-map-lazy";
import { getAreas } from "@/lib/listings/areas";
import { searchListingsForMap } from "@/lib/listings/query";
import { parseSearchParams } from "@/lib/listings/search-params";
import { buildQuery } from "@/lib/listings/filter-url";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return { title: t("title"), description: t("lede") };
}

function resolveIntent(
  raw: Record<string, string | string[] | undefined>,
): "rent" | "buy" {
  const value = Array.isArray(raw.intent) ? raw.intent[0] : raw.intent;
  return value === "buy" ? "buy" : "rent";
}

export default async function MapPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  void locale;
  const raw = await searchParams;
  const intent = resolveIntent(raw);
  const listingType = intent === "buy" ? "FOR_SALE" : "FOR_RENT";
  const filters = parseSearchParams(raw);

  const t = await getTranslations("map");
  const [areas, listings] = await Promise.all([
    getAreas(),
    searchListingsForMap(filters, listingType),
  ]);

  const listQuery = buildQuery("", filters);
  const listHref =
    (intent === "buy" ? "/buy" : "/rent") + (listQuery ? `?${listQuery}` : "");


  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {t("title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-ink-soft">{t("lede")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MapIntentToggle intent={intent} />
              <Link
                href={listHref}
                className="text-sm font-medium text-bete underline underline-offset-4 hover:text-bete-soft"
              >
                {t("listView")}
              </Link>
            </div>
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
                      total={listings.length}
                    />
                    <p className="text-sm text-ink-soft">
                      {t("count", { count: listings.length })}
                    </p>
                  </div>
                </div>
                <ActiveFilters areas={areas} />
              </div>

              <div className="search-map">
                <SearchMapBoundary listings={listings} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

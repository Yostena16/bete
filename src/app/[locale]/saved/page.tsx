import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ResultsGrid } from "@/components/listings/results-grid";
import { SavedSearchList } from "@/components/saved/saved-search-list";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import {
  getSavedListingIds,
  getSavedListings,
} from "@/lib/listings/saved";
import { getSavedSearches } from "@/lib/listings/saved-searches";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "saved" });
  return { title: t("title"), description: t("lede") };
}

export default async function SavedPage({ params }: PageProps) {
  const { locale } = await params;
  void locale;
  const session = await auth();
  const t = await getTranslations("saved");
  const tSearch = await getTranslations("savedSearch");
  const userId = session?.user?.id;

  const [listings, savedIds, searches] = userId
    ? await Promise.all([
        getSavedListings(userId),
        getSavedListingIds(userId),
        getSavedSearches(userId),
      ])
    : [[], new Set<string>(), []];

  return (
    <>
      <SiteHeader />
      <main>
        <div className="container-page py-10 md:py-14">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{t("lede")}</p>

          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">
              {tSearch("sectionTitle")}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{tSearch("sectionLede")}</p>
            <div className="mt-4">
              <SavedSearchList searches={searches} />
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t("homesTitle")}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{t("homesLede")}</p>

            {listings.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-stone bg-surface px-6 py-12 text-center">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {t("emptyTitle")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
                  {t("emptyBody")}
                </p>
                <Link
                  href="/rent"
                  className="mt-6 inline-block rounded-lg bg-bete px-4 py-2 text-sm font-semibold text-paper"
                >
                  {t("emptyAction")}
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                <ResultsGrid
                  listings={listings}
                  savedIds={savedIds}
                  signedIn
                />
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

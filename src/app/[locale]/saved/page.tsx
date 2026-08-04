import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ResultsGrid } from "@/components/listings/results-grid";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import {
  getSavedListingIds,
  getSavedListings,
} from "@/lib/listings/saved";

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
  const userId = session?.user?.id;

  const [listings, savedIds] = userId
    ? await Promise.all([
        getSavedListings(userId),
        getSavedListingIds(userId),
      ])
    : [[], new Set<string>()];

  return (
    <>
      <SiteHeader />
      <main>
        <div className="container-page py-10 md:py-14">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{t("lede")}</p>

          {listings.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-stone bg-surface px-6 py-12 text-center">
              <h2 className="font-display text-lg font-semibold text-ink">
                {t("emptyTitle")}
              </h2>
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
            <div className="mt-8">
              <ResultsGrid
                listings={listings}
                savedIds={savedIds}
                signedIn
              />
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FreshnessExplainer } from "@/components/freshness/freshness-explainer";
import { HeroSearch } from "@/components/home/hero-search";
import { FeaturedAreas } from "@/components/home/featured-areas";
import { RecentConfirmed } from "@/components/home/recent-confirmed";
import { getAreas } from "@/lib/listings/areas";
import {
  countConfirmedThisWeek,
  getFeaturedAreas,
  getRecentlyConfirmed,
} from "@/lib/listings/home";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const [areas, confirmedCount, featured, recent] = await Promise.all([
    getAreas(),
    countConfirmedThisWeek(),
    getFeaturedAreas(),
    getRecentlyConfirmed(4),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        {/*
          No stock house photo above the fold. The masthead is typographic and
          states the freshness promise in the first sentence a visitor reads.
          The search bar is the only bright object on the teal field.
        */}
        <section className="bg-bete text-paper">
          <div className="container-page py-16 md:py-24">
            <h1 className="max-w-4xl text-h1 text-paper md:text-display">
              {t("headline")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone">{t("lede")}</p>

            <HeroSearch
              areas={areas}
              className="mt-10 max-w-3xl"
            />

            <p className="mt-5 flex items-center gap-2 text-sm text-stone">
              <span
                className="inline-block size-2 shrink-0 rounded-full bg-mint"
                aria-hidden="true"
              />
              {t("confirmedThisWeek", { count: confirmedCount })}
            </p>
          </div>
        </section>

        <FeaturedAreas areas={featured} />

        <RecentConfirmed listings={recent} />

        <section className="container-page py-14 md:py-20">
          <h2 className="text-h3 text-bete md:text-h2">{t("explainerTitle")}</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">{t("explainerLede")}</p>
          <div className="mt-8">
            <FreshnessExplainer />
          </div>
        </section>

        <section className="border-t border-stone-soft">
          <div className="container-page py-14 md:py-20">
            <h2 className="text-h3 text-bete md:text-h2">{t("problemTitle")}</h2>
            <p className="mt-3 max-w-2xl text-ink-soft">{t("problemBody")}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

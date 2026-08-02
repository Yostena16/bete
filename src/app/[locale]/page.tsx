import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FreshnessExplainer } from "@/components/freshness/freshness-explainer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations("home");

  return (
    <>
      <SiteHeader />
      <main>
        {/*
          No stock house photo above the fold. The masthead is typographic and
          states the freshness promise in the first sentence a visitor reads.
        */}
        <section className="bg-bete text-paper">
          <div className="container-page py-16 md:py-24">
            <h1 className="max-w-4xl text-h1 text-paper md:text-display">
              {t("headline")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone">{t("lede")}</p>
          </div>
        </section>

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

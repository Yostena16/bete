import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
          <p className="font-display text-sm font-semibold tracking-wide text-ochre">
            404
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("notFoundTitle")}
          </h1>
          <p className="text-sm text-ink-soft">{t("notFoundBody")}</p>
          <Link
            href="/"
            className="mt-2 rounded-lg bg-bete px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-bete-soft"
          >
            {t("notFoundAction")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

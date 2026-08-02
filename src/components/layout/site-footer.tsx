import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="mt-20 bg-bete text-paper">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo tone="dark" size={30} />
          <p className="max-w-56 text-sm text-stone">{t("builtIn")}</p>
        </div>

        <nav aria-label={t("explore")} className="space-y-3 text-sm">
          <h2 className="font-display text-xs font-semibold tracking-[0.14em] text-mint uppercase">
            {t("explore")}
          </h2>
          <ul className="space-y-2">
            <li>
              <Link href="/rent" className="text-paper/80 hover:text-paper">
                {nav("rent")}
              </Link>
            </li>
            <li>
              <Link href="/buy" className="text-paper/80 hover:text-paper">
                {nav("buy")}
              </Link>
            </li>
            <li>
              <Link href="/map" className="text-paper/80 hover:text-paper">
                {nav("map")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("forListers")} className="space-y-3 text-sm">
          <h2 className="font-display text-xs font-semibold tracking-[0.14em] text-mint uppercase">
            {t("forListers")}
          </h2>
          <ul className="space-y-2">
            <li>
              <Link href="/post" className="text-paper/80 hover:text-paper">
                {nav("post")}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-paper/80 hover:text-paper">
                {nav("dashboard")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("about")} className="space-y-3 text-sm">
          <h2 className="font-display text-xs font-semibold tracking-[0.14em] text-mint uppercase">
            {t("about")}
          </h2>
          <ul className="space-y-2">
            <li>
              <Link href="/freshness" className="text-paper/80 hover:text-paper">
                {t("howFreshnessWorks")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5">
          <p className="text-xs text-stone">{t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}

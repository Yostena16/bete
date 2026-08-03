import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FeaturedArea } from "@/lib/listings/home";

type FeaturedAreasProps = {
  areas: FeaturedArea[];
};

/**
 * Four neighbourhood tiles. Not a filter — a starting point. Each tile deep-
 * links into /rent with that area already selected.
 */
export function FeaturedAreas({ areas }: FeaturedAreasProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAmharic = locale === "am";

  if (areas.length === 0) return null;

  return (
    <section className="container-page py-14 md:py-20">
      <h2 className="text-h3 text-bete md:text-h2">{t("areasTitle")}</h2>
      <p className="mt-3 max-w-2xl text-ink-soft">{t("areasLede")}</p>

      <ul className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
        {areas.map((area) => (
          <li
            key={area.slug}
            className="min-w-[70%] snap-start sm:min-w-[45%] md:min-w-0"
          >
            <Link
              href={`/rent?area=${area.slug}`}
              className="block rounded-xl border border-stone-soft bg-surface px-5 py-6 transition-shadow hover:shadow-card"
            >
              <p className="font-display text-lg font-semibold text-ink">
                {isAmharic ? area.nameAm : area.nameEn}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                {t("areaOpen", { count: area.openCount })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

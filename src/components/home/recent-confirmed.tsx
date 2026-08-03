import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ResultsGrid } from "@/components/listings/results-grid";
import type { ListingCardData } from "@/lib/listings/query";

type RecentConfirmedProps = {
  listings: ListingCardData[];
};

/**
 * The "still warm" strip. Only listings confirmed in the last three days —
 * if the seed is cold this section simply does not render.
 */
export function RecentConfirmed({ listings }: RecentConfirmedProps) {
  const t = useTranslations("home");

  if (listings.length === 0) return null;

  return (
    <section className="border-y border-stone-soft bg-surface">
      <div className="container-page py-14 md:py-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-h3 text-bete md:text-h2">{t("recentTitle")}</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">{t("recentLede")}</p>
          </div>
          <Link
            href="/rent"
            className="text-sm font-medium text-bete underline underline-offset-4 hover:text-bete-soft"
          >
            {t("recentSeeAll")}
          </Link>
        </div>
        <ResultsGrid listings={listings} />
      </div>
    </section>
  );
}

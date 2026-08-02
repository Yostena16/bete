import { useTranslations } from "next-intl";
import { LISTING_LIFESPAN_DAYS, MS_PER_DAY, getFreshness } from "@/lib/freshness";
import { FreshnessBadge } from "./freshness-badge";
import { LifeRail } from "./life-rail";

/** Sample ages that sit squarely inside each band. */
const SAMPLE_DAYS = [3, 14, 26, 34] as const;

export function FreshnessExplainer() {
  const t = useTranslations("home");
  const tf = useTranslations("freshness");
  const copy = [
    t("explainerFresh"),
    t("explainerAgeing"),
    t("explainerStale"),
    t("explainerExpired"),
  ];

  const now = new Date();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SAMPLE_DAYS.map((days, index) => {
        const confirmedAt = new Date(now.getTime() - days * MS_PER_DAY);
        const { band, lifeRemaining } = getFreshness(confirmedAt, now);

        return (
          <li
            key={days}
            className="overflow-hidden rounded-lg bg-surface shadow-card"
          >
            <LifeRail lifeRemaining={lifeRemaining} band={band} />
            <div className="space-y-3 p-4">
              <FreshnessBadge lastConfirmedAt={confirmedAt} />
              <p className="text-sm text-ink-soft">{copy[index]}</p>
              <p className="tabular text-xs text-stone">
                {tf("dayCounter", {
                  day: Math.min(days, LISTING_LIFESPAN_DAYS),
                  total: LISTING_LIFESPAN_DAYS,
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

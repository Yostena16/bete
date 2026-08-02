import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getFreshness, type FreshnessBand } from "@/lib/freshness";

const styleByBand: Record<FreshnessBand, { chip: string; dot: string }> = {
  fresh: { chip: "bg-mint-wash text-ink", dot: "bg-mint" },
  ageing: { chip: "bg-ochre-wash text-ink", dot: "bg-ochre" },
  stale: { chip: "bg-stone-wash text-ink-soft", dot: "bg-stone" },
  expired: { chip: "bg-stone-wash text-ink-soft", dot: "bg-stone" },
};

type FreshnessBadgeProps = {
  lastConfirmedAt: Date | string;
  size?: "sm" | "md";
  className?: string;
};

/**
 * The caption to the life rail. Mint never carries text here — it is the dot
 * only, because mint on paper fails contrast for type.
 */
export function FreshnessBadge({
  lastConfirmedAt,
  size = "sm",
  className,
}: FreshnessBadgeProps) {
  const t = useTranslations("freshness");
  const { band, days, weeks } = getFreshness(lastConfirmedAt);
  const style = styleByBand[band];

  const label =
    band === "fresh"
      ? t("fresh", { days })
      : band === "ageing"
        ? t("ageing", { weeks })
        : band === "stale"
          ? t("stale")
          : t("expired");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm",
        style.chip,
        className,
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", style.dot)}
        aria-hidden="true"
      />
      <span className="sr-only">{t("label")}: </span>
      {label}
    </span>
  );
}

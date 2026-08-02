import { cn } from "@/lib/utils";
import type { FreshnessBand } from "@/lib/freshness";

const trackByBand: Record<FreshnessBand, string> = {
  fresh: "bg-mint",
  ageing: "bg-ochre",
  stale: "bg-stone",
  expired: "bg-stone",
};

type LifeRailProps = {
  /** 0-1, the share of the listing's thirty-day life still remaining. */
  lifeRemaining: number;
  band: FreshnessBand;
  size?: "sm" | "md";
  className?: string;
};

/**
 * The signature element. A listing's thirty-day life drawn as a single bar,
 * so a column of cards can be scanned for confidence without reading a word.
 * Decorative on cards, where the badge beside it carries the same information
 * as text.
 */
export function LifeRail({
  lifeRemaining,
  band,
  size = "sm",
  className,
}: LifeRailProps) {
  const percent = Math.round(lifeRemaining * 100);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full overflow-hidden bg-stone-soft",
        size === "sm" ? "h-[3px]" : "h-1.5 rounded-full",
        className,
      )}
    >
      <div
        className={cn(
          "h-full transition-[width] duration-500",
          size === "md" && "rounded-full",
          trackByBand[band],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

import { cn } from "@/lib/utils";
import { BeteMark } from "./bete-mark";

type LogoProps = {
  tone?: "light" | "dark";
  size?: number;
  /** Hide the Amharic wordmark in cramped placements such as the mobile bar. */
  showAmharic?: boolean;
  className?: string;
};

export function Logo({
  tone = "light",
  size = 30,
  showAmharic = true,
  className,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BeteMark size={size} tone={tone} />
      <span className="inline-flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-[1.35rem] font-semibold tracking-[-0.04em]",
            tone === "dark" ? "text-paper" : "text-bete",
          )}
        >
          Bete
        </span>
        {showAmharic && (
          <span
            lang="am"
            className={cn(
              "text-[0.95rem] leading-none",
              tone === "dark" ? "text-stone" : "text-ink-soft",
            )}
          >
            ቤቴ
          </span>
        )}
      </span>
      <span className="sr-only">Bete — homes that are still open</span>
    </span>
  );
}

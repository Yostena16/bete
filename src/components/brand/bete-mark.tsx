import { cn } from "@/lib/utils";

type BeteMarkProps = {
  /** Rendered pixel size. Below 20 the mint window dot is dropped, per the brand rules. */
  size?: number;
  tone?: "light" | "dark";
  className?: string;
};

/**
 * The Bete mark: a gabled house drawn as three open strokes, an ochre doorway
 * standing open, and a mint window dot that is the same token as the "fresh"
 * state on every listing card.
 */
export function BeteMark({ size = 32, tone = "light", className }: BeteMarkProps) {
  const stroke = tone === "dark" ? "#EEF1EF" : "#0C3A3C";
  const showWindow = size >= 20;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path
        d="M6 33 L32 9 L58 33"
        fill="none"
        stroke={stroke}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 32 V58" fill="none" stroke={stroke} strokeWidth="6.5" />
      <path d="M50 32 V58" fill="none" stroke={stroke} strokeWidth="6.5" />
      {showWindow && <circle cx="32" cy="27" r="4.6" fill="#4FBFA0" />}
      <path d="M25 58 V45 Q25 39 32 39 Q39 39 39 45 V58 Z" fill="#E0A32E" />
    </svg>
  );
}

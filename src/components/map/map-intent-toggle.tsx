"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Rent / Buy switch for the map. Writes `intent` into the URL so the shared
 * search query and the list view stay in sync when the person jumps across.
 */
export function MapIntentToggle({
  intent,
}: {
  intent: "rent" | "buy";
}) {
  const t = useTranslations("map");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setIntent(next: "rent" | "buy") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "rent") params.delete("intent");
    else params.set("intent", "buy");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div
      role="group"
      aria-label={`${t("rent")} / ${t("buy")}`}
      className="inline-flex rounded-lg border border-stone-soft bg-surface p-1"
    >
      {(["rent", "buy"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setIntent(value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete",
            intent === value
              ? "bg-bete text-paper"
              : "text-ink-soft hover:text-ink",
          )}
        >
          {value === "rent" ? t("rent") : t("buy")}
        </button>
      ))}
    </div>
  );
}

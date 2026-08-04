"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

/**
 * Swaps the locale segment while preserving the path and every search
 * parameter, so switching language mid-search does not throw away the filters.
 *
 * The query is read from the URL at click time rather than through
 * useSearchParams, which would opt every page containing the header out of
 * static prerendering.
 */
export function LanguageSwitcher({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const next: Locale = locale === "en" ? "am" : "en";
  const label = next === "am" ? t("switchToAmharic") : t("switchToEnglish");

  function change() {
    const query = Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    );
    router.replace({ pathname, query }, { locale: next });
  }

  return (
    <button
      type="button"
      onClick={change}
      aria-label={t("languageLabel")}
      lang={next}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
        tone === "dark"
          ? "focus-ring-on-dark text-paper/80 hover:bg-white/10 hover:text-paper"
          : "text-ink-soft hover:bg-stone-wash hover:text-bete",
      )}
    >
      {label}
    </button>
  );
}

import { defineRouting } from "next-intl/routing";

export const locales = ["en", "am"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix so /en and /am are both real, cacheable URLs. Search engines
  // get two clean trees and the language switcher is a plain link swap.
  localePrefix: "always",
});

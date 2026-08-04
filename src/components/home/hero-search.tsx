"use client";

import { FormEvent, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { buildQuery } from "@/lib/listings/filter-url";
import { cn } from "@/lib/utils";

type AreaOption = {
  slug: string;
  nameEn: string;
  nameAm: string;
};

type HeroSearchProps = {
  areas: AreaOption[];
  className?: string;
};

/**
 * The only bright object on the teal masthead.
 *
 * Submits as a navigation to /rent or /buy with the same query string the
 * results page already understands, so the landing search and the filter rail
 * cannot drift apart.
 */
export function HeroSearch({ areas, className }: HeroSearchProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const isAmharic = locale === "am";

  const [intent, setIntent] = useState<"rent" | "buy">("rent");
  const [area, setArea] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const sortedAreas = useMemo(
    () =>
      [...areas].sort((a, b) =>
        (isAmharic ? a.nameAm : a.nameEn).localeCompare(
          isAmharic ? b.nameAm : b.nameEn,
          locale,
        ),
      ),
    [areas, isAmharic, locale],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = buildQuery("", {
      area: area ? [area] : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
    });
    const path = intent === "rent" ? "/rent" : "/buy";
    router.push(query ? `${path}?${query}` : path);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "grid gap-2 rounded-xl bg-surface p-2 shadow-lift sm:grid-cols-[7rem_1fr_8rem_auto]",
        className,
      )}
    >
      <label className="sr-only" htmlFor="hero-intent">
        {t("searchRent")} / {t("searchBuy")}
      </label>
      <select
        id="hero-intent"
        value={intent}
        onChange={(event) => setIntent(event.target.value as "rent" | "buy")}
        className="h-12 rounded-lg border border-stone-soft bg-paper px-3 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
      >
        <option value="rent">{t("searchRent")}</option>
        <option value="buy">{t("searchBuy")}</option>
      </select>

      <label className="sr-only" htmlFor="hero-area">
        {t("searchArea")}
      </label>
      <select
        id="hero-area"
        value={area}
        onChange={(event) => setArea(event.target.value)}
        className="h-12 rounded-lg border border-stone-soft bg-paper px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
      >
        <option value="">{t("searchArea")}</option>
        {sortedAreas.map((item) => (
          <option key={item.slug} value={item.slug}>
            {isAmharic ? item.nameAm : item.nameEn}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="hero-max">
        {t("searchMaxPrice")}
      </label>
      <input
        id="hero-max"
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        placeholder={t("searchMaxPrice")}
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
        className="h-12 rounded-lg border border-stone-soft bg-paper px-3 text-sm tabular-nums text-ink placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
      />

      <button
        type="submit"
        className="h-12 rounded-lg bg-ochre px-5 text-sm font-semibold text-ink transition-colors hover:bg-ochre-deep hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
      >
        {t("searchSubmit")}
      </button>
    </form>
  );
}

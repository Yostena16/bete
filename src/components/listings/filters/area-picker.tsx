"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SubCity } from "@/generated/prisma/enums";

export type AreaOption = {
  slug: string;
  nameEn: string;
  nameAm: string;
  subCity: SubCity;
};

/**
 * Forty-five areas is too many for a chip cloud and too few to justify a
 * combobox, so it is a searchable, grouped, scrollable list. The search matches
 * either script, because someone typing on an Amharic keyboard should not have
 * to guess the English transliteration of Ayat.
 */
export function AreaPicker({
  areas,
  selected,
  onToggle,
}: {
  areas: AreaOption[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const t = useTranslations("filters");
  const tSub = useTranslations("subCity");
  const locale = useLocale();
  const isAmharic = locale === "am";
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = term
      ? areas.filter(
          (area) =>
            area.nameEn.toLowerCase().includes(term) ||
            area.nameAm.includes(query.trim()),
        )
      : areas;

    const groups = new Map<SubCity, AreaOption[]>();
    for (const area of matches) {
      const list = groups.get(area.subCity) ?? [];
      list.push(area);
      groups.set(area.subCity, list);
    }
    return [...groups.entries()].sort((a, b) =>
      tSub(a[0]).localeCompare(tSub(b[0])),
    );
  }, [areas, query, tSub]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("areaSearchPlaceholder")}
          aria-label={t("areaSearchPlaceholder")}
          className="w-full rounded-lg border border-stone-soft bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-stone focus:border-bete focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
        />
      </div>

      {grouped.length === 0 ? (
        <p className="py-2 text-sm text-ink-soft">{t("areaNoMatch")}</p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          {grouped.map(([subCity, list]) => (
            <fieldset key={subCity} className="mb-3 last:mb-0">
              <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-stone">
                {tSub(subCity)}
              </legend>
              <div className="flex flex-col">
                {list.map((area) => {
                  const checked = selected.includes(area.slug);
                  return (
                    <label
                      key={area.slug}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm",
                        "hover:bg-paper",
                        checked ? "text-ink" : "text-ink-soft",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(area.slug)}
                        className="size-4 shrink-0 accent-bete"
                      />
                      {isAmharic ? area.nameAm : area.nameEn}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}

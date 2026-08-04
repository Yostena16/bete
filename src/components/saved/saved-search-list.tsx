"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  deleteSavedSearchAction,
  updateSavedSearchFrequencyAction,
} from "@/app/actions/saved-searches";
import { ALERT_FREQUENCIES } from "@/lib/listings/saved-search";
import type { SavedSearchRow } from "@/lib/listings/saved-searches";

export function SavedSearchList({ searches }: { searches: SavedSearchRow[] }) {
  const t = useTranslations("savedSearch");
  const [pending, startTransition] = useTransition();

  if (searches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone bg-surface px-6 py-10 text-center">
        <h3 className="font-display text-base font-semibold text-ink">
          {t("emptyTitle")}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          {t("emptyBody")}
        </p>
        <Link
          href="/rent"
          className="mt-5 inline-block rounded-lg bg-bete px-4 py-2 text-sm font-semibold text-paper"
        >
          {t("emptyAction")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-stone/70 rounded-xl border border-stone bg-surface">
      {searches.map((search) => (
        <li
          key={search.id}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <Link
              href={search.href}
              className="font-display text-base font-semibold text-ink hover:text-bete focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
            >
              {search.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink-soft">
              {t(`intent.${search.query.listingType}`)}
              {" · "}
              {t("alertsHint")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor={`freq-${search.id}`}>
              {t("frequencyLabel")}
            </label>
            <select
              id={`freq-${search.id}`}
              value={search.frequency}
              disabled={pending}
              onChange={(event) => {
                const value = event.target
                  .value as (typeof ALERT_FREQUENCIES)[number];
                startTransition(async () => {
                  await updateSavedSearchFrequencyAction(search.id, value);
                });
              }}
              className="rounded-lg border border-stone bg-paper px-2 py-1.5 text-sm text-ink focus:border-bete focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
            >
              {ALERT_FREQUENCIES.map((value) => (
                <option key={value} value={value}>
                  {t(`frequency.${value}`)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await deleteSavedSearchAction(search.id);
                });
              }}
              className="rounded-lg border border-stone px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-danger/40 hover:text-danger disabled:opacity-60"
            >
              {t("delete")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

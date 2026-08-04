"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { createSavedSearchAction } from "@/app/actions/saved-searches";
import { ALERT_FREQUENCIES } from "@/lib/listings/saved-search";
import type { ListingType } from "@/generated/prisma/enums";

type SaveSearchControlProps = {
  listingType: ListingType;
  signedIn: boolean;
  hasFilters: boolean;
};

/**
 * Saves the current URL filters as a named alert. Lives next to sort so the
 * action is available after someone has narrowed the market.
 */
export function SaveSearchControl({
  listingType,
  signedIn,
  hasFilters,
}: SaveSearchControlProps) {
  const t = useTranslations("savedSearch");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] =
    useState<(typeof ALERT_FREQUENCIES)[number]>("DAILY");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!hasFilters) return null;

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={() =>
          router.push(
            `/login?callbackUrl=${encodeURIComponent(
              listingType === "FOR_RENT" ? "/rent" : "/buy",
            )}`,
          )
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:border-bete/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
      >
        <Bell className="size-3.5" aria-hidden />
        {t("save")}
      </button>
    );
  }

  if (done) {
    return (
      <p className="text-sm font-medium text-mint-deep" role="status">
        {t("savedToast")}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:border-bete/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
      >
        <Bell className="size-3.5" aria-hidden />
        {t("save")}
      </button>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 rounded-xl border border-stone bg-surface p-3 sm:max-w-lg"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const filters = Object.fromEntries(searchParams.entries());
        startTransition(async () => {
          const result = await createSavedSearchAction({
            listingType,
            filters,
            name: name.trim() || undefined,
            frequency,
          });
          if (!result.ok) {
            setError(t("errors.failed"));
            return;
          }
          setDone(true);
          setOpen(false);
        });
      }}
    >
      <label className="block text-xs font-medium text-ink-soft">
        {t("nameLabel")}
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("namePlaceholder")}
          maxLength={80}
          className="mt-1 w-full rounded-lg border border-stone bg-paper px-3 py-2 text-sm text-ink focus:border-bete focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
        />
      </label>
      <label className="block text-xs font-medium text-ink-soft">
        {t("frequencyLabel")}
        <select
          value={frequency}
          onChange={(event) =>
            setFrequency(
              event.target.value as (typeof ALERT_FREQUENCIES)[number],
            )
          }
          className="mt-1 w-full rounded-lg border border-stone bg-paper px-3 py-2 text-sm text-ink focus:border-bete focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
        >
          {ALERT_FREQUENCIES.map((value) => (
            <option key={value} value={value}>
              {t(`frequency.${value}`)}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-bete px-3 py-1.5 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {pending ? t("saving") : t("confirm")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="rounded-lg border border-stone px-3 py-1.5 text-sm font-medium text-ink-soft"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

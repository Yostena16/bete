"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="font-display text-sm font-semibold tracking-wide text-ochre">
        Error
      </p>
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("errorTitle")}
      </h1>
      <p className="text-sm text-ink-soft">{t("errorBody")}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-bete px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-bete-soft"
        >
          {t("errorRetry")}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-stone px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-stone-wash"
        >
          {t("errorHome")}
        </Link>
      </div>
    </div>
  );
}

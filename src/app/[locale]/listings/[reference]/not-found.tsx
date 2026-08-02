import { getTranslations } from "next-intl/server";
import { HomeIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function ListingNotFound() {
  const t = await getTranslations("detail");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
      <HomeIcon className="size-8 text-stone" aria-hidden="true" />
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t("notFoundTitle")}
      </h1>
      <p className="text-sm text-ink-soft">{t("notFoundBody")}</p>
      <Link
        href="/rent"
        className="mt-2 rounded-lg bg-bete px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-bete-soft"
      >
        {t("notFoundAction")}
      </Link>
    </div>
  );
}

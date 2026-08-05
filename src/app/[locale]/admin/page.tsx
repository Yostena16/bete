import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ModerationCard } from "@/components/admin/moderation-card";
import { getAdminStats, getPendingListings } from "@/lib/listings/admin";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("title"), description: t("lede") };
}

export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params;
  void locale;
  const t = await getTranslations("admin");
  const [pending, stats] = await Promise.all([
    getPendingListings(),
    getAdminStats(),
  ]);

  const statItems = [
    { label: t("stats.pending"), value: stats.pending },
    { label: t("stats.active"), value: stats.active },
    { label: t("stats.confirmedWeek"), value: stats.confirmedWeek },
    { label: t("stats.expired"), value: stats.expired },
    { label: t("stats.rejected"), value: stats.rejected },
    { label: t("stats.taken"), value: stats.rented + stats.sold },
    { label: t("stats.users"), value: stats.users },
    { label: t("stats.blocked"), value: stats.blockedUsers },
  ];

  return (
    <AdminShell title={t("title")} lede={t("lede")} pathname="/admin">
      <section>
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("analyticsTitle")}
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {statItems.map((item) => (
            <li
              key={item.label}
              className="rounded-xl border border-stone-soft bg-surface px-4 py-3"
            >
              <p className="text-xs text-ink-soft">{item.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
                {item.value}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/listings"
          className="rounded-lg border border-stone-soft bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-stone-wash"
        >
          {t("navListings")}
        </Link>
        <Link
          href="/admin/users"
          className="rounded-lg border border-stone-soft bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-stone-wash"
        >
          {t("navUsers")}
        </Link>
        <Link
          href="/admin/post"
          className="rounded-lg bg-bete px-4 py-2 text-sm font-medium text-paper hover:bg-mint-deep"
        >
          {t("navPost")}
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("queueTitle")}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {t("queueCount", { count: pending.length })}
        </p>

        {pending.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-stone bg-surface px-6 py-10 text-center text-sm text-ink-soft">
            {t("queueEmpty")}
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {pending.map((listing) => (
              <li key={listing.id}>
                <ModerationCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

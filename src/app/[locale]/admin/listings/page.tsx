import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ListingManageRow } from "@/components/admin/listing-manage-row";
import { getAdminListings } from "@/lib/listings/admin";
import type { ListingStatus } from "@/generated/prisma/enums";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

const STATUSES = [
  "ALL",
  "ACTIVE",
  "PENDING",
  "REJECTED",
  "EXPIRED",
  "RENTED",
  "SOLD",
] as const;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("listingsTitle") };
}

export default async function AdminListingsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  void locale;
  const sp = await searchParams;
  const t = await getTranslations("admin");
  const statusParam = STATUSES.includes(sp.status as (typeof STATUSES)[number])
    ? (sp.status as (typeof STATUSES)[number])
    : "ALL";
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() || undefined;

  const result = await getAdminListings({
    q,
    status: statusParam === "ALL" ? "ALL" : (statusParam as ListingStatus),
    page,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  function hrefFor(next: {
    q?: string;
    status?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextStatus = next.status ?? statusParam;
    const nextPage = next.page ?? page;
    if (nextQ) params.set("q", nextQ);
    if (nextStatus && nextStatus !== "ALL") params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/listings?${qs}` : "/admin/listings";
  }

  return (
    <AdminShell
      title={t("listingsTitle")}
      lede={t("listingsLede")}
      pathname="/admin/listings"
    >
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get">
        <div className="min-w-0 flex-1">
          <label className="block text-xs font-medium text-ink" htmlFor="q">
            {t("searchLabel")}
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("searchListingsPlaceholder")}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium text-ink"
            htmlFor="status"
          >
            {t("statusFilter")}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={statusParam}
            className="mt-1 h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "ALL"
                  ? t("statusAll")
                  : t(`statusLabels.${status}`)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-lg bg-bete px-4 text-sm font-medium text-paper hover:bg-mint-deep"
        >
          {t("searchSubmit")}
        </button>
      </form>

      <p className="mt-4 text-sm text-ink-soft">
        {t("listingsCount", { count: result.total })}
      </p>

      {result.items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-stone bg-surface px-6 py-10 text-center text-sm text-ink-soft">
          {t("listingsEmpty")}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {result.items.map((listing) => (
            <li key={listing.id}>
              <ListingManageRow listing={listing} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={hrefFor({ page: page - 1 })}
              className="font-medium text-bete hover:underline"
            >
              {t("prevPage")}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-soft">
            {t("pageOf", { page, total: totalPages })}
          </span>
          {page < totalPages ? (
            <Link
              href={hrefFor({ page: page + 1 })}
              className="font-medium text-bete hover:underline"
            >
              {t("nextPage")}
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserManageRow } from "@/components/admin/user-manage-row";
import { getAdminUsers } from "@/lib/listings/admin";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
};

const FILTERS = ["ALL", "BLOCKED", "LISTERS", "ADMINS"] as const;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("usersTitle") };
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  void locale;
  const sp = await searchParams;
  const t = await getTranslations("admin");
  const filter = FILTERS.includes(sp.filter as (typeof FILTERS)[number])
    ? (sp.filter as (typeof FILTERS)[number])
    : "ALL";
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() || undefined;

  const result = await getAdminUsers({ q, filter, page });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  function hrefFor(next: { q?: string; filter?: string; page?: number }) {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextFilter = next.filter ?? filter;
    const nextPage = next.page ?? page;
    if (nextQ) params.set("q", nextQ);
    if (nextFilter && nextFilter !== "ALL") params.set("filter", nextFilter);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

  return (
    <AdminShell
      title={t("usersTitle")}
      lede={t("usersLede")}
      pathname="/admin/users"
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
            placeholder={t("searchUsersPlaceholder")}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium text-ink"
            htmlFor="filter"
          >
            {t("userFilter")}
          </label>
          <select
            id="filter"
            name="filter"
            defaultValue={filter}
            className="mt-1 h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {FILTERS.map((value) => (
              <option key={value} value={value}>
                {t(`userFilters.${value}`)}
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
        {t("usersCount", { count: result.total })}
      </p>

      {result.items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-stone bg-surface px-6 py-10 text-center text-sm text-ink-soft">
          {t("usersEmpty")}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {result.items.map((user) => (
            <li key={user.id}>
              <UserManageRow user={user} />
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

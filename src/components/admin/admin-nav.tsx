import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", key: "navOverview" as const, exact: true },
  { href: "/admin/listings", key: "navListings" as const, exact: false },
  { href: "/admin/users", key: "navUsers" as const, exact: false },
  { href: "/admin/post", key: "navPost" as const, exact: false },
];

export async function AdminNav({ pathname }: { pathname: string }) {
  const t = await getTranslations("admin");

  return (
    <nav
      aria-label={t("navLabel")}
      className="mt-6 flex flex-wrap gap-1 border-b border-stone-soft pb-px"
    >
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-t-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-b-2 border-bete text-ink"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}

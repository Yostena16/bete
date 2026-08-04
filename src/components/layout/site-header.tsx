import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { AuthNav } from "@/components/auth/auth-nav";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  const links = [
    { href: "/rent", label: t("rent") },
    { href: "/buy", label: t("buy") },
    { href: "/map", label: t("map") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-bete text-paper">
      <div className="container-page flex h-16 items-center gap-4">
        <Link
          href="/"
          className="focus-ring-on-dark rounded-md"
          aria-label="Bete home"
        >
          <Logo tone="dark" size={28} showAmharic={false} />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring-on-dark rounded-md px-3 py-2 text-sm font-medium text-paper/85 transition-colors hover:bg-white/10 hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link
            href="/saved"
            className="focus-ring-on-dark hidden rounded-md px-3 py-2 text-sm font-medium text-paper/85 transition-colors hover:bg-white/10 hover:text-paper md:inline-block"
          >
            {t("saved")}
          </Link>
          <Link
            href="/post"
            className="focus-ring-on-dark hidden rounded-md bg-ochre px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ochre-deep hover:text-paper md:inline-block"
          >
            {t("post")}
          </Link>
          <AuthNav />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/rent", label: t("rent") },
    { href: "/buy", label: t("buy") },
    { href: "/map", label: t("map") },
    { href: "/saved", label: t("saved") },
    { href: "/dashboard", label: t("dashboard") },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("menu")}
        className="inline-flex size-10 items-center justify-center rounded-md text-paper transition-colors hover:bg-white/10 md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm bg-paper">
        <SheetHeader className="border-b border-stone-soft">
          <SheetTitle asChild>
            <span>
              <Logo size={26} />
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-stone-wash"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-stone-soft p-4">
          <Link
            href="/post"
            onClick={() => setOpen(false)}
            className="rounded-md bg-ochre px-4 py-3 text-center text-base font-semibold text-ink transition-colors hover:bg-ochre-deep hover:text-paper"
          >
            {t("post")}
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-md border border-bete px-4 py-3 text-center text-base font-medium text-bete transition-colors hover:bg-bete hover:text-paper"
          >
            {t("signIn")}
          </Link>
          <div className="pt-1">
            <LanguageSwitcher tone="light" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

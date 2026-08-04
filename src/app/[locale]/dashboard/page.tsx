import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("nav");

  return (
    <>
      <SiteHeader />
      <main>
        <div className="container-page py-12">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("dashboard")}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {session?.user?.name
              ? `Signed in as ${session.user.name} (${session.user.phone}).`
              : null}
          </p>
          <p className="mt-6 max-w-xl text-ink-soft">
            Your listings, views and the Confirm still available button land
            here next.
          </p>
          <Link
            href="/post"
            className="mt-6 inline-block rounded-lg bg-ochre px-4 py-2 text-sm font-semibold text-ink"
          >
            {t("post")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

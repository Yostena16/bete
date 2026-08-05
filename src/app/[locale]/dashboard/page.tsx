import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DashboardListingRow } from "@/components/dashboard/listing-row";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { getListerListings } from "@/lib/listings/dashboard";
import { getUserProfile } from "@/lib/user/profile";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ posted?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title"), description: t("lede") };
}

export default async function DashboardPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { posted } = await searchParams;
  const session = await auth();
  const t = await getTranslations("dashboard");
  const userId = session?.user?.id;

  const [listings, profile] = userId
    ? await Promise.all([getListerListings(userId), getUserProfile(userId)])
    : [[], null];

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <div className="container-page py-10 md:py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {t("title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-soft">{t("lede")}</p>
            </div>
            <Link
              href="/post"
              className="rounded-lg bg-ochre px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ochre-deep hover:text-paper"
            >
              {t("emptyAction")}
            </Link>
          </div>

          {profile ? (
            <div className="mb-10">
              <ProfileCard profile={profile} />
            </div>
          ) : null}

          {posted ? (
            <p
              className="mb-6 rounded-lg border border-mint bg-mint-wash px-4 py-3 text-sm text-ink"
              role="status"
            >
              {t("posted", { reference: posted })}
            </p>
          ) : null}

          <h2 className="mb-4 font-display text-lg font-semibold text-ink">
            {t("listingsTitle")}
          </h2>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone bg-surface px-6 py-12 text-center">
              <h3 className="font-display text-lg font-semibold text-ink">
                {t("emptyTitle")}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
                {t("emptyBody")}
              </p>
              <Link
                href="/post"
                className="mt-6 inline-block rounded-lg bg-bete px-4 py-2 text-sm font-semibold text-paper"
              >
                {t("emptyAction")}
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <DashboardListingRow listing={listing} locale={locale} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

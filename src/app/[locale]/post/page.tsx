import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PostWizard } from "@/components/post/post-wizard";
import { getAreas } from "@/lib/listings/areas";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "post" });
  return { title: t("title"), description: t("lede") };
}

export default async function PostPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("post");
  const session = await auth();
  const [areas, amenities] = await Promise.all([
    getAreas(),
    prisma.amenity.findMany({
      select: { slug: true, nameEn: true, nameAm: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <div className="container-page py-10 md:py-14">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{t("lede")}</p>
          {session?.user?.name ? (
            <p className="mt-1 text-xs text-ink-soft">
              {session.user.name} · {session.user.phone}
            </p>
          ) : null}
          <div className="mt-8">
            <PostWizard areas={areas} amenities={amenities} locale={locale} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

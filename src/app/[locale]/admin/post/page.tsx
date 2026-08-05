import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminShell } from "@/components/admin/admin-shell";
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
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("postTitle") };
}

export default async function AdminPostPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const session = await auth();
  const [areas, amenities] = await Promise.all([
    getAreas(),
    prisma.amenity.findMany({
      select: { slug: true, nameEn: true, nameAm: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <AdminShell
      title={t("postTitle")}
      lede={t("postLede")}
      pathname="/admin/post"
    >
      {session?.user?.name ? (
        <p className="mb-6 text-xs text-ink-soft">
          {t("postingAs", {
            name: session.user.name,
            phone: session.user.phone,
          })}
        </p>
      ) : null}
      <PostWizard areas={areas} amenities={amenities} locale={locale} />
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SearchPage } from "@/components/listings/search-page";
import { getAreaBySlug } from "@/lib/listings/areas";

type PageProps = {
  params: Promise<{ locale: string; area: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, area: slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) return {};

  const t = await getTranslations({ locale, namespace: "results" });
  const name = locale === "am" ? area.nameAm : area.nameEn;
  return {
    title: t("rentAreaTitle", { area: name }),
    description: t("rentAreaLede", { area: name }),
  };
}

/**
 * SEO landing: /rent/bole-medhanialem. The area is fixed in the path; other
 * filters still come from the query string.
 */
export default async function RentAreaPage({
  params,
  searchParams,
}: PageProps) {
  const { area: slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) notFound();

  const raw = await searchParams;
  return (
    <SearchPage
      listingType="FOR_RENT"
      searchParams={{ ...raw, area: slug }}
    />
  );
}

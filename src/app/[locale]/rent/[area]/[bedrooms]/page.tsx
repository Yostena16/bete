import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SearchPage } from "@/components/listings/search-page";
import { getAreaBySlug } from "@/lib/listings/areas";

type PageProps = {
  params: Promise<{ locale: string; area: string; bedrooms: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseBedroomsSegment(segment: string): number | null {
  // Accepts "2-bedroom", "2-bedrooms", or plain "2".
  const match = segment.match(/^(\d+)(?:-bedrooms?)?$/i);
  if (!match) return null;
  const beds = Number(match[1]);
  if (!Number.isInteger(beds) || beds < 0 || beds > 10) return null;
  return beds;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, area: slug, bedrooms: bedsSegment } = await params;
  const area = await getAreaBySlug(slug);
  const beds = parseBedroomsSegment(bedsSegment);
  if (!area || beds === null) return {};

  const t = await getTranslations({ locale, namespace: "results" });
  const name = locale === "am" ? area.nameAm : area.nameEn;
  return {
    title: t("rentAreaBedsTitle", { area: name, beds }),
    description: t("rentAreaBedsLede", { area: name, beds }),
  };
}

/**
 * SEO landing: /rent/cmc/2-bedroom. Beds and area are path-encoded; remaining
 * filters stay on the query string.
 */
export default async function RentAreaBedsPage({
  params,
  searchParams,
}: PageProps) {
  const { area: slug, bedrooms: bedsSegment } = await params;
  const area = await getAreaBySlug(slug);
  const beds = parseBedroomsSegment(bedsSegment);
  if (!area || beds === null) notFound();

  const raw = await searchParams;
  return (
    <SearchPage
      listingType="FOR_RENT"
      searchParams={{ ...raw, area: slug, beds: String(beds) }}
    />
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SearchPage } from "@/components/listings/search-page";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "results" });
  return { title: t("rentTitle"), description: t("rentLede") };
}

export default async function RentPage({ searchParams }: PageProps) {
  return (
    <SearchPage listingType="FOR_RENT" searchParams={await searchParams} />
  );
}

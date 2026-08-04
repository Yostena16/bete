import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPaths = ["", "/rent", "/buy", "/map"];

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      staticPaths.map((path) => ({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "hourly",
        priority: path === "" ? 1 : 0.8,
      })),
  );

  const areas = await prisma.area.findMany({
    select: { slug: true },
    orderBy: { nameEn: "asc" },
  });

  const areaEntries: MetadataRoute.Sitemap = areas.flatMap((area) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}/rent/${area.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
  );

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { reference: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const listingEntries: MetadataRoute.Sitemap = listings.flatMap((listing) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}/listings/${listing.reference}`,
      lastModified: listing.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...areaEntries, ...listingEntries];
}

import { prisma } from "@/lib/db";
import { listingCardSelect, type ListingCardData } from "./query";

/** Areas the landing page highlights — the ones people actually look first. */
export const FEATURED_AREA_SLUGS = [
  "cmc",
  "bole-medhanialem",
  "kazanchis",
  "gerji",
] as const;

/**
 * How many ACTIVE listings were confirmed in the last seven days.
 *
 * This is the live pulse on the masthead. It is a count, not a cache, so it
 * moves as listers confirm — that is the whole point of putting it there.
 */
export async function countConfirmedThisWeek(): Promise<number> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);

  return prisma.listing.count({
    where: {
      status: "ACTIVE",
      lastConfirmedAt: { gte: since },
    },
  });
}

export type FeaturedArea = {
  slug: string;
  nameEn: string;
  nameAm: string;
  openCount: number;
};

/**
 * Featured neighbourhoods with how many listings are currently open in each.
 * Ordered by the curated slug list, not by popularity, so the row stays stable.
 */
export async function getFeaturedAreas(): Promise<FeaturedArea[]> {
  const areas = await prisma.area.findMany({
    where: { slug: { in: [...FEATURED_AREA_SLUGS] } },
    select: {
      slug: true,
      nameEn: true,
      nameAm: true,
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  const bySlug = new Map(areas.map((area) => [area.slug, area]));

  return FEATURED_AREA_SLUGS.flatMap((slug) => {
    const area = bySlug.get(slug);
    if (!area) return [];
    return [
      {
        slug: area.slug,
        nameEn: area.nameEn,
        nameAm: area.nameAm,
        openCount: area._count.listings,
      },
    ];
  });
}

/**
 * Listings confirmed in the last three days, freshest first.
 * These feed the "Confirmed recently" strip under the area tiles.
 */
export async function getRecentlyConfirmed(
  limit = 8,
): Promise<ListingCardData[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 3);

  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      lastConfirmedAt: { gte: since },
    },
    select: listingCardSelect,
    orderBy: { lastConfirmedAt: "desc" },
    take: limit,
  });
}

import { cache } from "react";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import {
  listingCardSelect,
  serializeListingCard,
  type ListingCardData,
} from "./query";

export const listingDetailSelect = {
  id: true,
  reference: true,
  listingType: true,
  propertyType: true,
  titleEn: true,
  titleAm: true,
  descriptionEn: true,
  descriptionAm: true,
  price: true,
  currency: true,
  priceNegotiable: true,
  rentPeriod: true,
  advanceMonths: true,
  bedrooms: true,
  bathrooms: true,
  areaSqm: true,
  floorsGPlus: true,
  furnishing: true,
  addressNote: true,
  lat: true,
  lng: true,
  status: true,
  createdAt: true,
  lastConfirmedAt: true,
  expiresAt: true,
  views: true,
  contactReveals: true,
  area: { select: { slug: true, nameEn: true, nameAm: true, subCity: true } },
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      listerType: true,
      phoneVerified: true,
      avatarUrl: true,
      createdAt: true,
    },
  },
  images: {
    select: { url: true, order: true, isCover: true, width: true, height: true },
    orderBy: { order: "asc" },
  },
  amenities: {
    select: {
      amenity: {
        select: { slug: true, nameEn: true, nameAm: true, icon: true, isKey: true },
      },
    },
  },
} satisfies Prisma.ListingSelect;

type ListingDetailRow = Prisma.ListingGetPayload<{
  select: typeof listingDetailSelect;
}>;

export type ListingDetail = Omit<ListingDetailRow, "price"> & {
  price: number;
};

function serializeListingDetail(listing: ListingDetailRow): ListingDetail {
  return { ...listing, price: Number(listing.price) };
}

/**
 * Memoised because the page reads it twice: once in generateMetadata and once
 * in the component. Without the cache that is two round trips per request.
 */
export const getListingByReference = cache(
  async (reference: string): Promise<ListingDetail | null> => {
    const listing = await prisma.listing.findFirst({
      where: { reference, status: { in: ["ACTIVE", "RENTED", "SOLD"] } },
      select: listingDetailSelect,
    });
    return listing ? serializeListingDetail(listing) : null;
  },
);

/**
 * Fire-and-forget view count. Deliberately not awaited by the render: a failed
 * counter must never cost someone the page they asked for, and the number is
 * a rough popularity signal rather than an accounting figure.
 */
export async function recordView(id: string): Promise<void> {
  try {
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Swallowed on purpose. See above.
  }
}

/**
 * Similar listings, ranked by real distance rather than by shared area name.
 *
 * Using PostGIS here rather than an areaId match matters: somewhere just over
 * the Bole/Yeka line is a better suggestion than somewhere at the far end of
 * the same sub-city, and a seeker looking at Gerji does not care which
 * administrative boundary a house falls inside.
 */
export async function getSimilarListings(
  listing: ListingDetail,
  limit = 4,
): Promise<ListingCardData[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT l."id"
    FROM "Listing" l
    WHERE l."status" = 'ACTIVE'
      AND l."id" <> ${listing.id}
      AND l."listingType"::text = ${listing.listingType}
    ORDER BY ST_Distance(
      ST_SetSRID(ST_MakePoint(l."lng", l."lat"), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${listing.lng}, ${listing.lat}), 4326)::geography
    ) ASC
    LIMIT ${limit}
  `);

  const ids = rows.map((row) => row.id);
  if (ids.length === 0) return [];

  const unordered = await prisma.listing.findMany({
    where: { id: { in: ids } },
    select: listingCardSelect,
  });
  const byId = new Map(
    unordered.map((item) => [item.id, serializeListingCard(item)]),
  );
  return ids.map((id) => byId.get(id)!);
}

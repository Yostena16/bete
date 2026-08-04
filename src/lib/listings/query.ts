import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { ListingType } from "@/generated/prisma/enums";
import {
  PAGE_SIZE,
  USD_TO_ETB,
  requiredAmenities,
  type SearchParams,
  type Sort,
} from "./search-params";

/**
 * Prices are stored in the currency they were advertised in, because a
 * diaspora-facing villa quoted at $3,200 is a different object from one quoted
 * at 520,000 birr and rounding one into the other loses information. A single
 * price filter still has to work across both, so comparisons happen against
 * this normalised birr expression.
 */
const priceInEtb = Prisma.sql`(CASE WHEN l."currency" = 'USD' THEN l."price" * ${USD_TO_ETB} ELSE l."price" END)`;

/**
 * Default ordering: the blended freshness-and-recency score from the brief.
 *
 * score = 0.75 * (1 - confirmAge/30) + 0.25 * (1 - postAge/90)
 *
 * Expanding that and dropping the constant terms leaves a ranking equivalent to
 * maximising 9 * lastConfirmedAt + createdAt, which needs no reference to the
 * current time and so can be computed straight from two columns. One day of
 * confirmation age costs as much as nine days of listing age, which is the
 * whole point: a stale listing should not outrank a fresh one just because it
 * was posted yesterday.
 */
const freshRank = Prisma.sql`(9 * EXTRACT(EPOCH FROM l."lastConfirmedAt") + EXTRACT(EPOCH FROM l."createdAt"))`;

function orderBy(sort: Sort) {
  switch (sort) {
    case "priceAsc":
      return Prisma.sql`ORDER BY ${priceInEtb} ASC, l."lastConfirmedAt" DESC`;
    case "priceDesc":
      return Prisma.sql`ORDER BY ${priceInEtb} DESC, l."lastConfirmedAt" DESC`;
    case "newest":
      return Prisma.sql`ORDER BY l."createdAt" DESC`;
    default:
      return Prisma.sql`ORDER BY ${freshRank} DESC`;
  }
}

/**
 * Builds the WHERE clause once so the count, the paged list and the map all
 * filter identically. If these ever diverge the map stops agreeing with the
 * list, which is the bug the brief specifically asks not to ship.
 */
function buildWhere(
  params: SearchParams,
  listingType?: ListingType,
): Prisma.Sql {
  const conditions: Prisma.Sql[] = [Prisma.sql`l."status" = 'ACTIVE'`];

  if (listingType) {
    conditions.push(Prisma.sql`l."listingType"::text = ${listingType}`);
  }
  if (params.area.length) {
    conditions.push(Prisma.sql`a."slug" IN (${Prisma.join(params.area)})`);
  }
  if (params.subCity.length) {
    conditions.push(Prisma.sql`a."subCity"::text IN (${Prisma.join(params.subCity)})`);
  }
  if (params.property.length) {
    conditions.push(
      Prisma.sql`l."propertyType"::text IN (${Prisma.join(params.property)})`,
    );
  }
  if (params.furnishing.length) {
    conditions.push(
      Prisma.sql`l."furnishing"::text IN (${Prisma.join(params.furnishing)})`,
    );
  }
  if (params.lister.length) {
    conditions.push(Prisma.sql`u."listerType"::text IN (${Prisma.join(params.lister)})`);
  }
  if (params.rentPeriod) {
    conditions.push(Prisma.sql`l."rentPeriod"::text = ${params.rentPeriod}`);
  }
  if (params.beds) {
    conditions.push(Prisma.sql`l."bedrooms" >= ${params.beds}`);
  }
  if (params.baths) {
    conditions.push(Prisma.sql`l."bathrooms" >= ${params.baths}`);
  }
  if (params.minArea) {
    conditions.push(Prisma.sql`l."areaSqm" >= ${params.minArea}`);
  }
  if (params.minPrice) {
    conditions.push(Prisma.sql`${priceInEtb} >= ${params.minPrice}`);
  }
  if (params.maxPrice) {
    conditions.push(Prisma.sql`${priceInEtb} <= ${params.maxPrice}`);
  }
  if (params.advanceMax) {
    // A listing with no advance stated is not excluded by an advance filter;
    // it is unknown, not known to be worse.
    conditions.push(
      Prisma.sql`(l."advanceMonths" IS NULL OR l."advanceMonths" <= ${params.advanceMax})`,
    );
  }
  if (params.negotiable) {
    conditions.push(Prisma.sql`l."priceNegotiable" = true`);
  }
  if (params.q) {
    const term = `%${params.q}%`;
    conditions.push(
      Prisma.sql`(l."titleEn" ILIKE ${term} OR l."titleAm" ILIKE ${term} OR l."descriptionEn" ILIKE ${term} OR l."addressNote" ILIKE ${term} OR a."nameEn" ILIKE ${term} OR a."nameAm" ILIKE ${term} OR l."reference" ILIKE ${term})`,
    );
  }

  const amenities = requiredAmenities(params);
  if (amenities.length) {
    // Every requested amenity must be present, not any of them. Someone who
    // ticks both generator and water tank means both.
    conditions.push(Prisma.sql`(
      SELECT COUNT(DISTINCT am."slug")
      FROM "ListingAmenity" la
      JOIN "Amenity" am ON am."id" = la."amenityId"
      WHERE la."listingId" = l."id" AND am."slug" IN (${Prisma.join(amenities)})
    ) = ${amenities.length}`);
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
}

const FROM = Prisma.sql`
  FROM "Listing" l
  JOIN "Area" a ON a."id" = l."areaId"
  JOIN "User" u ON u."id" = l."userId"
`;

/** Fields a listing card needs, and nothing more. */
export const listingCardSelect = {
  id: true,
  reference: true,
  listingType: true,
  propertyType: true,
  titleEn: true,
  titleAm: true,
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
  lat: true,
  lng: true,
  addressNote: true,
  lastConfirmedAt: true,
  createdAt: true,
  views: true,
  area: { select: { nameEn: true, nameAm: true, slug: true, subCity: true } },
  user: { select: { listerType: true } },
  images: {
    where: { isCover: true },
    select: { url: true },
    take: 1,
  },
  amenities: {
    where: { amenity: { isKey: true } },
    select: { amenity: { select: { slug: true, nameEn: true, nameAm: true } } },
  },
} satisfies Prisma.ListingSelect;

type ListingCardRow = Prisma.ListingGetPayload<{
  select: typeof listingCardSelect;
}>;

/**
 * Prisma returns `price` as Decimal, which cannot cross the RSC → client
 * boundary. Cards, map pins and dashboard rows all need a plain number.
 */
export type ListingCardData = Omit<ListingCardRow, "price"> & {
  price: number;
};

export function serializeListingCard(listing: ListingCardRow): ListingCardData {
  return { ...listing, price: Number(listing.price) };
}

export type SearchResult = {
  listings: ListingCardData[];
  total: number;
  page: number;
  pageCount: number;
};

/** New ACTIVE matches since `since`, for saved-search alert digests. */
export async function countListingsCreatedSince(
  params: SearchParams,
  listingType: ListingType,
  since: Date,
): Promise<number> {
  const where = buildWhere(params, listingType);
  const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>(
    Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      ${FROM}
      ${where}
      AND l."createdAt" > ${since}
    `,
  );
  return Number(count);
}

export async function searchListings(
  params: SearchParams,
  listingType?: ListingType,
): Promise<SearchResult> {
  const where = buildWhere(params, listingType);
  const page = params.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>(
    Prisma.sql`SELECT COUNT(*)::bigint AS count ${FROM} ${where}`,
  );
  const total = Number(count);

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT l."id" ${FROM} ${where} ${orderBy(params.sort)} LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
  );
  const ids = rows.map((row) => row.id);

  if (ids.length === 0) {
    return { listings: [], total, page, pageCount: Math.ceil(total / PAGE_SIZE) };
  }

  const unordered = await prisma.listing.findMany({
    where: { id: { in: ids } },
    select: listingCardSelect,
  });
  const byId = new Map(
    unordered.map((listing) => [listing.id, serializeListingCard(listing)]),
  );

  return {
    listings: ids.map((id) => byId.get(id)!),
    total,
    page,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

/** Every match, without pagination, for the map. Capped so a pin flood cannot happen. */
export async function searchListingsForMap(
  params: SearchParams,
  listingType?: ListingType,
  limit = 500,
): Promise<ListingCardData[]> {
  const where = buildWhere(params, listingType);

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT l."id" ${FROM} ${where} ${orderBy(params.sort)} LIMIT ${limit}`,
  );
  const ids = rows.map((row) => row.id);
  if (ids.length === 0) return [];

  const unordered = await prisma.listing.findMany({
    where: { id: { in: ids } },
    select: listingCardSelect,
  });
  const byId = new Map(
    unordered.map((listing) => [listing.id, serializeListingCard(listing)]),
  );
  return ids.map((id) => byId.get(id)!);
}

import { NextResponse, type NextRequest } from "next/server";
import { searchListings } from "@/lib/listings/query";
import { parseSearchParams } from "@/lib/listings/search-params";
import { getFreshness } from "@/lib/freshness";
import type { ListingType } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

/**
 * Read-only search endpoint. The pages render server-side and do not need it,
 * but it makes the filter behaviour inspectable without a browser and is what
 * Phase 2's definition of done is checked against.
 */
export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const params = parseSearchParams(raw);

  const typeParam = request.nextUrl.searchParams.get("listingType");
  const listingType =
    typeParam === "FOR_RENT" || typeParam === "FOR_SALE"
      ? (typeParam as ListingType)
      : undefined;

  const result = await searchListings(params, listingType);

  return NextResponse.json({
    total: result.total,
    page: result.page,
    pageCount: result.pageCount,
    listings: result.listings.map((listing) => {
      const freshness = getFreshness(listing.lastConfirmedAt);
      return {
        id: listing.id,
        reference: listing.reference,
        listingType: listing.listingType,
        propertyType: listing.propertyType,
        title: { en: listing.titleEn, am: listing.titleAm },
        price: Number(listing.price),
        currency: listing.currency,
        priceNegotiable: listing.priceNegotiable,
        rentPeriod: listing.rentPeriod,
        advanceMonths: listing.advanceMonths,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        areaSqm: listing.areaSqm,
        floorsGPlus: listing.floorsGPlus,
        furnishing: listing.furnishing,
        area: {
          slug: listing.area.slug,
          nameEn: listing.area.nameEn,
          nameAm: listing.area.nameAm,
          subCity: listing.area.subCity,
        },
        listerType: listing.user.listerType,
        coordinates: { lat: listing.lat, lng: listing.lng },
        coverImage: listing.images[0]?.url ?? null,
        keyAmenities: listing.amenities.map((link) => link.amenity.slug),
        views: listing.views,
        freshness: {
          band: freshness.band,
          daysSinceConfirmed: freshness.days,
          lifeRemaining: Number(freshness.lifeRemaining.toFixed(3)),
          lastConfirmedAt: listing.lastConfirmedAt,
        },
      };
    }),
  });
}

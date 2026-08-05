"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { postDraftSchema } from "@/lib/listings/post-schema";
import { nextListingReference } from "@/lib/listings/reference";

export type SubmitListingResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

const LIFESPAN_DAYS = 30;

export async function submitListingAction(
  raw: unknown,
): Promise<SubmitListingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthenticated" };
  }

  const parsed = postDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "invalidDraft" };
  }

  const draft = parsed.data;
  if (draft.listingType === "FOR_RENT" && !draft.rentPeriod) {
    return { ok: false, error: "rentPeriodRequired" };
  }

  const area = await prisma.area.findUnique({
    where: { slug: draft.areaSlug },
    select: { id: true },
  });
  if (!area) return { ok: false, error: "unknownArea" };

  const amenities = draft.amenitySlugs.length
    ? await prisma.amenity.findMany({
        where: { slug: { in: draft.amenitySlugs } },
        select: { id: true, slug: true },
      })
    : [];

  const reference = await nextListingReference();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LIFESPAN_DAYS * 86_400_000);

  await prisma.$transaction(async (tx) => {
    if (session.user.role === "SEEKER") {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          role: "LISTER",
          listerType: session.user.listerType ?? "OWNER",
        },
      });
    }

    const listing = await tx.listing.create({
      data: {
        reference,
        userId: session.user.id,
        listingType: draft.listingType,
        propertyType: draft.propertyType,
        titleEn: draft.titleEn,
        titleAm: draft.titleAm || null,
        descriptionEn: draft.descriptionEn,
        descriptionAm: draft.descriptionAm || null,
        price: draft.price,
        currency: draft.currency,
        priceNegotiable: draft.priceNegotiable,
        rentPeriod:
          draft.listingType === "FOR_RENT" ? draft.rentPeriod ?? null : null,
        advanceMonths:
          draft.listingType === "FOR_RENT" ? draft.advanceMonths ?? null : null,
        bedrooms: draft.bedrooms ?? null,
        bathrooms: draft.bathrooms ?? null,
        areaSqm: draft.areaSqm ?? null,
        floorsGPlus: draft.floorsGPlus ?? null,
        furnishing: draft.furnishing ?? null,
        areaId: area.id,
        addressNote: draft.addressNote || null,
        lat: draft.lat,
        lng: draft.lng,
        status: "ACTIVE",
        lastConfirmedAt: now,
        expiresAt,
        images: {
          create: draft.photos.map((photo, order) => ({
            url: photo.url,
            publicId: photo.publicId,
            order,
            isCover: order === 0,
          })),
        },
        amenities: {
          create: amenities.map((amenity) => ({
            amenityId: amenity.id,
          })),
        },
      },
    });

    return listing;
  });

  return { ok: true, reference };
}

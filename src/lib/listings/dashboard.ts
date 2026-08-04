import { prisma } from "@/lib/db";
import { listingCardSelect } from "./query";
import { LISTING_LIFESPAN_DAYS, MS_PER_DAY } from "@/lib/freshness";

export async function getListerListings(userId: string) {
  const rows = await prisma.listing.findMany({
    where: { userId },
    select: {
      ...listingCardSelect,
      status: true,
      rejectionReason: true,
      expiresAt: true,
      contactReveals: true,
      confirmToken: true,
    },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map((listing) => ({
    ...listing,
    price: Number(listing.price),
  }));
}

export type ListerListing = Awaited<
  ReturnType<typeof getListerListings>
>[number];

/**
 * Resets the thirty-day life. The button on the dashboard is the visible half
 * of the freshness system; the day-21 email links use the same path later.
 */
export async function confirmListingAvailable(
  userId: string,
  listingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, userId },
    select: { id: true, status: true },
  });
  if (!listing) return { ok: false, error: "notFound" };
  if (listing.status !== "ACTIVE" && listing.status !== "EXPIRED") {
    return { ok: false, error: "notConfirmable" };
  }

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + LISTING_LIFESPAN_DAYS * MS_PER_DAY,
  );

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      lastConfirmedAt: now,
      expiresAt,
      status: "ACTIVE",
      reminderSentAt: null,
    },
  });

  return { ok: true };
}

export async function markListingTaken(
  userId: string,
  listingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, userId },
    select: { id: true, listingType: true, status: true },
  });
  if (!listing) return { ok: false, error: "notFound" };
  if (listing.status !== "ACTIVE") {
    return { ok: false, error: "notActive" };
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: listing.listingType === "FOR_RENT" ? "RENTED" : "SOLD",
    },
  });

  return { ok: true };
}

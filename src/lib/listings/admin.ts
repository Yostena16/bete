import { prisma } from "@/lib/db";
import { LISTING_LIFESPAN_DAYS, MS_PER_DAY } from "@/lib/freshness";

export async function getPendingListings() {
  return prisma.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      reference: true,
      listingType: true,
      propertyType: true,
      titleEn: true,
      titleAm: true,
      price: true,
      currency: true,
      createdAt: true,
      descriptionEn: true,
      addressNote: true,
      area: { select: { nameEn: true, nameAm: true, slug: true } },
      user: {
        select: { name: true, phone: true, listerType: true, email: true },
      },
      images: {
        orderBy: { order: "asc" },
        select: { url: true, isCover: true },
        take: 4,
      },
    },
  });
}

export type PendingListing = Awaited<
  ReturnType<typeof getPendingListings>
>[number];

export async function getAdminStats() {
  const [
    pending,
    active,
    expired,
    rejected,
    rented,
    sold,
    users,
    confirmedWeek,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "EXPIRED" } }),
    prisma.listing.count({ where: { status: "REJECTED" } }),
    prisma.listing.count({ where: { status: "RENTED" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.user.count(),
    prisma.listing.count({
      where: {
        status: "ACTIVE",
        lastConfirmedAt: {
          gte: new Date(Date.now() - 7 * 86_400_000),
        },
      },
    }),
  ]);

  return {
    pending,
    active,
    expired,
    rejected,
    rented,
    sold,
    users,
    confirmedWeek,
  };
}

export async function approveListing(
  listingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true },
  });
  if (!listing) return { ok: false, error: "notFound" };
  if (listing.status !== "PENDING") return { ok: false, error: "notPending" };

  const now = new Date();
  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: "ACTIVE",
      lastConfirmedAt: now,
      expiresAt: new Date(now.getTime() + LISTING_LIFESPAN_DAYS * MS_PER_DAY),
      rejectionReason: null,
      reminderSentAt: null,
    },
  });

  return { ok: true };
}

export async function rejectListing(
  listingId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = reason.trim();
  if (trimmed.length < 8) return { ok: false, error: "reasonShort" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true },
  });
  if (!listing) return { ok: false, error: "notFound" };
  if (listing.status !== "PENDING") return { ok: false, error: "notPending" };

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: "REJECTED",
      rejectionReason: trimmed,
    },
  });

  return { ok: true };
}

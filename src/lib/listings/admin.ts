import { prisma } from "@/lib/db";
import { LISTING_LIFESPAN_DAYS, MS_PER_DAY } from "@/lib/freshness";
import { Prisma } from "@/generated/prisma/client";
import type { ListingStatus, Role } from "@/generated/prisma/enums";

export async function getPendingListings() {
  const rows = await prisma.listing.findMany({
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
        select: {
          id: true,
          name: true,
          phone: true,
          listerType: true,
          email: true,
          blockedAt: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
        select: { url: true, isCover: true },
        take: 4,
      },
    },
  });
  return rows.map((listing) => ({
    ...listing,
    price: Number(listing.price),
  }));
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
    blockedUsers,
    confirmedWeek,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "EXPIRED" } }),
    prisma.listing.count({ where: { status: "REJECTED" } }),
    prisma.listing.count({ where: { status: "RENTED" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.user.count(),
    prisma.user.count({ where: { blockedAt: { not: null } } }),
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
    blockedUsers,
    confirmedWeek,
  };
}

const LISTING_SELECT = {
  id: true,
  reference: true,
  listingType: true,
  propertyType: true,
  titleEn: true,
  titleAm: true,
  price: true,
  currency: true,
  status: true,
  rejectionReason: true,
  createdAt: true,
  lastConfirmedAt: true,
  views: true,
  area: { select: { nameEn: true, nameAm: true } },
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      listerType: true,
      role: true,
      blockedAt: true,
    },
  },
  images: {
    where: { isCover: true },
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.ListingSelect;

export type AdminListingRow = Awaited<
  ReturnType<typeof getAdminListings>
>["items"][number];

export async function getAdminListings(opts: {
  q?: string;
  status?: ListingStatus | "ALL";
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? 20));
  const q = opts.q?.trim() || undefined;
  const status = opts.status && opts.status !== "ALL" ? opts.status : undefined;

  const where: Prisma.ListingWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { titleEn: { contains: q, mode: "insensitive" } },
            { user: { phone: { contains: q } } },
            { user: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: LISTING_SELECT,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map((listing) => ({
      ...listing,
      price: Number(listing.price),
    })),
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

/** Take a live (or pending) listing out of search. */
export async function takeDownListing(
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
  if (listing.status !== "ACTIVE" && listing.status !== "PENDING") {
    return { ok: false, error: "notLive" };
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: "REJECTED",
      rejectionReason: trimmed,
    },
  });

  return { ok: true };
}

/** Put a rejected or expired listing back in search. */
export async function restoreListing(
  listingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      status: true,
      user: { select: { blockedAt: true } },
    },
  });
  if (!listing) return { ok: false, error: "notFound" };
  if (listing.user.blockedAt) return { ok: false, error: "ownerBlocked" };
  if (listing.status !== "REJECTED" && listing.status !== "EXPIRED") {
    return { ok: false, error: "notRestorable" };
  }

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

export async function getAdminUsers(opts: {
  q?: string;
  filter?: "ALL" | "BLOCKED" | "LISTERS" | "ADMINS";
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? 20));
  const q = opts.q?.trim() || undefined;
  const filter = opts.filter ?? "ALL";

  const where: Prisma.UserWhereInput = {
    ...(filter === "BLOCKED" ? { blockedAt: { not: null } } : {}),
    ...(filter === "LISTERS" ? { role: "LISTER" as Role } : {}),
    ...(filter === "ADMINS" ? { role: "ADMIN" } : {}),
    ...(q
      ? {
          OR: [
            { phone: { contains: q } },
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        listerType: true,
        blockedAt: true,
        blockReason: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
    }),
  ]);

  return { total, page, pageSize, items: rows };
}

export type AdminUserRow = Awaited<
  ReturnType<typeof getAdminUsers>
>["items"][number];

export async function blockUser(
  userId: string,
  reason: string,
  adminId: string,
): Promise<{ ok: true; takenDown: number } | { ok: false; error: string }> {
  const trimmed = reason.trim();
  if (trimmed.length < 8) return { ok: false, error: "reasonShort" };
  if (userId === adminId) return { ok: false, error: "cannotBlockSelf" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, blockedAt: true },
  });
  if (!user) return { ok: false, error: "notFound" };
  if (user.role === "ADMIN") return { ok: false, error: "cannotBlockAdmin" };
  if (user.blockedAt) return { ok: false, error: "alreadyBlocked" };

  const now = new Date();
  const [, takenDown] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { blockedAt: now, blockReason: trimmed },
    }),
    prisma.listing.updateMany({
      where: {
        userId,
        status: { in: ["ACTIVE", "PENDING"] },
      },
      data: {
        status: "REJECTED",
        rejectionReason: `Account blocked: ${trimmed}`,
      },
    }),
  ]);

  return { ok: true, takenDown: takenDown.count };
}

export async function unblockUser(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, blockedAt: true },
  });
  if (!user) return { ok: false, error: "notFound" };
  if (!user.blockedAt) return { ok: false, error: "notBlocked" };

  await prisma.user.update({
    where: { id: userId },
    data: { blockedAt: null, blockReason: null },
  });

  return { ok: true };
}

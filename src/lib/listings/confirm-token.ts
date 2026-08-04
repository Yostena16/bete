import { prisma } from "@/lib/db";
import { LISTING_LIFESPAN_DAYS, MS_PER_DAY } from "@/lib/freshness";

export type ConfirmTokenResult =
  | {
      ok: true;
      action: "available" | "taken";
      reference: string;
      title: string;
    }
  | { ok: false; error: "notFound" | "notActive" | "invalidAction" };

/**
 * One-click links from the day-21 email. Auth is the confirmToken, not a
 * session — the lister may open this on a phone that never signed into Bete.
 */
export async function applyConfirmToken(
  token: string,
  action: string,
): Promise<ConfirmTokenResult> {
  if (action !== "available" && action !== "taken") {
    return { ok: false, error: "invalidAction" };
  }

  const listing = await prisma.listing.findUnique({
    where: { confirmToken: token },
    select: {
      id: true,
      reference: true,
      titleEn: true,
      status: true,
      listingType: true,
    },
  });

  if (!listing) return { ok: false, error: "notFound" };

  if (action === "available") {
    if (listing.status !== "ACTIVE" && listing.status !== "EXPIRED") {
      return { ok: false, error: "notActive" };
    }
    const now = new Date();
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        lastConfirmedAt: now,
        expiresAt: new Date(now.getTime() + LISTING_LIFESPAN_DAYS * MS_PER_DAY),
        status: "ACTIVE",
        reminderSentAt: null,
      },
    });
    return {
      ok: true,
      action: "available",
      reference: listing.reference,
      title: listing.titleEn,
    };
  }

  if (listing.status !== "ACTIVE") {
    return { ok: false, error: "notActive" };
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: listing.listingType === "FOR_RENT" ? "RENTED" : "SOLD",
    },
  });

  return {
    ok: true,
    action: "taken",
    reference: listing.reference,
    title: listing.titleEn,
  };
}

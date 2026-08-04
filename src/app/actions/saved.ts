"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function toggleSavedListingAction(
  listingId: string,
): Promise<{ ok: boolean; saved?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthenticated" };
  }

  const existing = await prisma.savedListing.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId,
      },
    },
  });

  if (existing) {
    await prisma.savedListing.delete({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });
    revalidatePath("/saved");
    return { ok: true, saved: false };
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: { in: ["ACTIVE", "RENTED", "SOLD"] } },
    select: { id: true },
  });
  if (!listing) return { ok: false, error: "notFound" };

  await prisma.savedListing.create({
    data: { userId: session.user.id, listingId },
  });
  revalidatePath("/saved");
  return { ok: true, saved: true };
}

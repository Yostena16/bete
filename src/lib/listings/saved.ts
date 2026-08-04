import { prisma } from "@/lib/db";
import { listingCardSelect, serializeListingCard } from "./query";

export async function getSavedListingIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.savedListing.findMany({
    where: { userId },
    select: { listingId: true },
  });
  return new Set(rows.map((row) => row.listingId));
}

export async function getSavedListings(userId: string) {
  const rows = await prisma.savedListing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      listing: { select: listingCardSelect },
    },
  });

  return rows.map((row) => serializeListingCard(row.listing));
}

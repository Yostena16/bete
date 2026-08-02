"use server";

import { prisma } from "@/lib/db";

/**
 * Revealing a phone number is counted separately from a page view, because it
 * is the only signal on the site that reflects real intent rather than idle
 * browsing. Phase 5c shows this figure to the lister on their dashboard.
 *
 * The number itself is already on the page — this is a counter, not an
 * authorisation gate, and pretending otherwise would mean an extra round trip
 * before someone can make a phone call.
 */
export async function recordContactReveal(listingId: string): Promise<void> {
  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: { contactReveals: { increment: 1 } },
    });
  } catch {
    // A dropped counter must not break the call-to-action.
  }
}

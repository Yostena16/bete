"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { approveListing, rejectListing } from "@/lib/listings/admin";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function approveListingAction(
  listingId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const result = await approveListing(listingId);
  if (!result.ok) return result;
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectListingAction(
  listingId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const result = await rejectListing(listingId, reason);
  if (!result.ok) return result;
  revalidatePath("/admin");
  return { ok: true };
}

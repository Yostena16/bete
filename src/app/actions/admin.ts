"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  approveListing,
  rejectListing,
  takeDownListing,
  restoreListing,
  blockUser,
  unblockUser,
} from "@/lib/listings/admin";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/users");
  revalidatePath("/rent");
  revalidatePath("/buy");
  revalidatePath("/dashboard");
}

export async function approveListingAction(
  listingId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const result = await approveListing(listingId);
  if (!result.ok) return result;
  revalidateAdmin();
  return { ok: true };
}

export async function rejectListingAction(
  listingId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const result = await rejectListing(listingId, reason);
  if (!result.ok) return result;
  revalidateAdmin();
  return { ok: true };
}

export async function takeDownListingAction(
  listingId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const result = await takeDownListing(listingId, reason);
  if (!result.ok) return result;
  revalidateAdmin();
  return { ok: true };
}

export async function restoreListingAction(
  listingId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const result = await restoreListing(listingId);
  if (!result.ok) return result;
  revalidateAdmin();
  return { ok: true };
}

export async function blockUserAction(
  userId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string; takenDown?: number }> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "forbidden" };
  const result = await blockUser(userId, reason, session.user.id);
  if (!result.ok) return result;
  revalidateAdmin();
  return { ok: true, takenDown: result.takenDown };
}

export async function unblockUserAction(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  const result = await unblockUser(userId);
  if (!result.ok) return result;
  revalidateAdmin();
  return { ok: true };
}

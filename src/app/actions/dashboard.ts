"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  confirmListingAvailable,
  markListingTaken,
} from "@/lib/listings/dashboard";

export async function confirmAvailableAction(
  listingId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "unauthenticated" };

  const result = await confirmListingAvailable(session.user.id, listingId);
  if (!result.ok) return result;

  revalidatePath("/dashboard");
  revalidatePath("/[locale]/dashboard", "page");
  return { ok: true };
}

export async function markTakenAction(
  listingId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "unauthenticated" };

  const result = await markListingTaken(session.user.id, listingId);
  if (!result.ok) return result;

  revalidatePath("/dashboard");
  revalidatePath("/[locale]/dashboard", "page");
  return { ok: true };
}

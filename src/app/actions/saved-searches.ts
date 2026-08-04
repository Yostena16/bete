"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ALERT_FREQUENCIES,
  defaultSavedSearchName,
  toSavedSearchQuery,
} from "@/lib/listings/saved-search";
import {
  parseSearchParams,
  type SearchParams,
} from "@/lib/listings/search-params";
import type { ListingType } from "@/generated/prisma/enums";

const frequencySchema = z.enum(ALERT_FREQUENCIES);

const createSchema = z.object({
  listingType: z.enum(["FOR_RENT", "FOR_SALE"]),
  // Flat filter bag from the client (same keys as the URL).
  filters: z.record(z.string(), z.string()),
  name: z.string().trim().min(1).max(80).optional(),
  frequency: frequencySchema.default("DAILY"),
});

export async function createSavedSearchAction(input: {
  listingType: ListingType;
  filters: Record<string, string | string[] | undefined>;
  name?: string;
  frequency?: z.infer<typeof frequencySchema>;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthenticated" };
  }

  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.filters)) {
    if (value === undefined) continue;
    flat[key] = Array.isArray(value) ? value.join(",") : value;
  }

  const parsed = createSchema.safeParse({
    listingType: input.listingType,
    filters: flat,
    name: input.name,
    frequency: input.frequency,
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const params: SearchParams = parseSearchParams(parsed.data.filters);
  const queryJson = toSavedSearchQuery(parsed.data.listingType, params);
  const name =
    parsed.data.name?.trim() ||
    defaultSavedSearchName(parsed.data.listingType, params);

  const row = await prisma.savedSearch.create({
    data: {
      userId: session.user.id,
      name,
      queryJson,
      frequency: parsed.data.frequency,
    },
    select: { id: true },
  });

  revalidatePath("/saved");
  return { ok: true, id: row.id };
}

export async function updateSavedSearchFrequencyAction(
  id: string,
  frequency: z.infer<typeof frequencySchema>,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthenticated" };
  }

  const parsed = frequencySchema.safeParse(frequency);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const result = await prisma.savedSearch.updateMany({
    where: { id, userId: session.user.id },
    data: { frequency: parsed.data },
  });
  if (result.count === 0) return { ok: false, error: "notFound" };

  revalidatePath("/saved");
  return { ok: true };
}

export async function deleteSavedSearchAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthenticated" };
  }

  const result = await prisma.savedSearch.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (result.count === 0) return { ok: false, error: "notFound" };

  revalidatePath("/saved");
  return { ok: true };
}

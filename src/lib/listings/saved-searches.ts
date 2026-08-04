import { prisma } from "@/lib/db";
import {
  parseSavedSearchQuery,
  savedSearchHref,
  type SavedSearchQuery,
} from "./saved-search";
import type { AlertFrequency } from "@/generated/prisma/enums";

export type SavedSearchRow = {
  id: string;
  name: string;
  frequency: AlertFrequency;
  lastSentAt: Date | null;
  createdAt: Date;
  href: string;
  query: SavedSearchQuery;
};

export async function getSavedSearches(
  userId: string,
): Promise<SavedSearchRow[]> {
  const rows = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const out: SavedSearchRow[] = [];
  for (const row of rows) {
    const query = parseSavedSearchQuery(row.queryJson);
    if (!query) continue;
    out.push({
      id: row.id,
      name: row.name,
      frequency: row.frequency,
      lastSentAt: row.lastSentAt,
      createdAt: row.createdAt,
      href: savedSearchHref(query),
      query,
    });
  }
  return out;
}

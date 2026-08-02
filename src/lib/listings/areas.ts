import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * The area list is read on every search page and never changes between
 * deployments, so it is memoised per request. Sorted by name rather than by
 * sub-city, because the picker groups them itself.
 */
export const getAreas = cache(async () =>
  prisma.area.findMany({
    select: { slug: true, nameEn: true, nameAm: true, subCity: true },
    orderBy: { nameEn: "asc" },
  }),
);

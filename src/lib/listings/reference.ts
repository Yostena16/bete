import { prisma } from "@/lib/db";

/**
 * Public references look like BT-3042. Seed data owns the 1xxx (rent) and
 * 2xxx (sale) bands; user posts start at 3000 so they never collide.
 */
export async function nextListingReference(): Promise<string> {
  const latest = await prisma.listing.findFirst({
    where: { reference: { startsWith: "BT-3" } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });

  const n = latest ? Number(latest.reference.slice(3)) : 2999;
  const next = Number.isFinite(n) ? n + 1 : 3000;
  return `BT-${String(next).padStart(4, "0")}`;
}

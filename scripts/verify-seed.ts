/**
 * Checks the seeded database against the definitions of done in the brief.
 * Run with: npx tsx scripts/verify-seed.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Generous bounding box around Addis Ababa, used to catch bad coordinates. */
const BOUNDS = { minLat: 8.8, maxLat: 9.15, minLng: 38.6, maxLng: 38.95 };

const results: Array<{ label: string; pass: boolean; detail: string }> = [];

function check(label: string, pass: boolean, detail: string) {
  results.push({ label, pass, detail });
}

async function main() {
  const areas = await prisma.area.findMany();
  const outOfBounds = areas.filter(
    (a) =>
      a.lat < BOUNDS.minLat ||
      a.lat > BOUNDS.maxLat ||
      a.lng < BOUNDS.minLng ||
      a.lng > BOUNDS.maxLng,
  );
  const subCities = new Set(areas.map((a) => a.subCity));
  const missingAmharic = areas.filter((a) => !a.nameAm.trim());

  check("45 areas seeded", areas.length === 45, `${areas.length} rows`);
  check(
    "every area sits inside Addis Ababa",
    outOfBounds.length === 0,
    outOfBounds.length === 0
      ? "all within bounds"
      : outOfBounds.map((a) => `${a.nameEn} ${a.lat},${a.lng}`).join("; "),
  );
  check("all 11 sub-cities represented", subCities.size === 11, `${subCities.size} sub-cities`);
  check(
    "every area has an Amharic name",
    missingAmharic.length === 0,
    missingAmharic.map((a) => a.nameEn).join("; ") || "all present",
  );

  const amenities = await prisma.amenity.findMany();
  const keyAmenities = amenities.filter((a) => a.isKey).map((a) => a.slug);
  check("15 amenities seeded", amenities.length === 15, `${amenities.length} rows`);
  check(
    "generator and water tank are the key amenities",
    keyAmenities.length === 2 &&
      keyAmenities.includes("generator") &&
      keyAmenities.includes("water-tank"),
    keyAmenities.join(", ") || "none",
  );

  const listings = await prisma.listing.count();
  if (listings > 0) {
    const rent = await prisma.listing.count({ where: { listingType: "FOR_RENT" } });
    const sale = await prisma.listing.count({ where: { listingType: "FOR_SALE" } });
    const withoutImages = await prisma.listing.count({ where: { images: { none: {} } } });
    const withoutCover = await prisma.listing.count({
      where: { images: { none: { isCover: true } } },
    });
    const propertyTypes = await prisma.listing.groupBy({ by: ["propertyType"] });
    const areasUsed = await prisma.listing.groupBy({ by: ["areaId"] });

    check("80 listings seeded", listings === 80, `${listings} rows`);
    check("55 rentals and 25 sales", rent === 55 && sale === 25, `${rent} rent / ${sale} sale`);
    check("every listing has images", withoutImages === 0, `${withoutImages} without images`);
    check("every listing has a cover image", withoutCover === 0, `${withoutCover} without a cover`);
    check(
      "all 9 property types used",
      propertyTypes.length === 9,
      `${propertyTypes.length} types`,
    );
    check("listings spread over many areas", areasUsed.length >= 25, `${areasUsed.length} areas`);

    const now = Date.now();
    const confirmed = await prisma.listing.findMany({ select: { lastConfirmedAt: true } });
    const bands = { fresh: 0, ageing: 0, stale: 0, expired: 0 };
    for (const { lastConfirmedAt } of confirmed) {
      const days = Math.floor((now - lastConfirmedAt.getTime()) / 86_400_000);
      if (days <= 7) bands.fresh += 1;
      else if (days <= 21) bands.ageing += 1;
      else if (days <= 30) bands.stale += 1;
      else bands.expired += 1;
    }
    check(
      "all three freshness bands are populated",
      bands.fresh > 0 && bands.ageing > 0 && bands.stale > 0,
      `fresh ${bands.fresh}, ageing ${bands.ageing}, stale ${bands.stale}, expired ${bands.expired}`,
    );
  }

  let failed = 0;
  for (const result of results) {
    if (!result.pass) failed += 1;
    console.log(`${result.pass ? "PASS" : "FAIL"}  ${result.label.padEnd(46)} ${result.detail}`);
  }

  await prisma.$disconnect();
  if (failed > 0) {
    console.log(`\n${failed} check(s) failed`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} checks passed`);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

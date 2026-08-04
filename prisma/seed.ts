import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { ListingStatus } from "../src/generated/prisma/enums";
import { AMENITIES } from "./seed-data/amenities";
import { AREAS } from "./seed-data/areas";
import type { ListingSeed } from "./seed-data/listing-seed";
import { RENT_LISTINGS } from "./seed-data/listings-rent";
import { SALE_LISTINGS } from "./seed-data/listings-sale";
import { photoSet, unsplashUrl } from "./seed-data/photos";
import { USERS } from "./seed-data/users";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MS_PER_DAY = 86_400_000;
const LIFESPAN_DAYS = 30;

/**
 * Listings that are not simply live. The moderation queue, the dashboard and
 * the "already taken" path all need something real to show, and a seed where
 * every row is ACTIVE cannot demonstrate any of them.
 */
const STATUS_OVERRIDES: Record<string, { status: ListingStatus; reason?: string }> = {
  "BT-1017": { status: "PENDING" },
  "BT-1036": { status: "PENDING" },
  "BT-1046": { status: "PENDING" },
  "BT-2005": { status: "PENDING" },
  "BT-2019": { status: "PENDING" },
  "BT-1004": {
    status: "REJECTED",
    reason: "The photos are of a different unit in the same block. Re-upload photos of the actual flat and we will approve it.",
  },
  "BT-2017": {
    status: "REJECTED",
    reason: "Asking price is missing the plot size that the description refers to. Add the plot area and resubmit.",
  },
  "BT-1010": { status: "RENTED" },
  "BT-1042": { status: "RENTED" },
  "BT-2003": { status: "SOLD" },
  "BT-1054": { status: "EXPIRED" },
  "BT-2022": { status: "EXPIRED" },
};

/**
 * Exact addresses are never published here, so a listing pin is its area's
 * coordinate with a deterministic offset of up to roughly 350 m. Deterministic
 * so that re-seeding does not shuffle every pin on the map.
 */
function jitter(ref: string, axis: number) {
  let hash = axis * 7919;
  for (let i = 0; i < ref.length; i += 1) {
    hash = (hash * 31 + ref.charCodeAt(i)) % 100_000;
  }
  return ((hash % 1000) / 1000 - 0.5) * 0.007;
}

async function seedAreas() {
  for (const area of AREAS) {
    await prisma.area.upsert({
      where: { slug: area.slug },
      update: {
        nameEn: area.nameEn,
        nameAm: area.nameAm,
        subCity: area.subCity,
        lat: area.lat,
        lng: area.lng,
      },
      create: area,
    });
  }
  console.log(`Seeded ${AREAS.length} areas`);
}

async function seedAmenities() {
  for (const [order, amenity] of AMENITIES.entries()) {
    await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: { ...amenity, order },
      create: { ...amenity, order },
    });
  }
  console.log(`Seeded ${AMENITIES.length} amenities`);
}

async function seedUsers() {
  // Same password for every demo account so you can sign in as any seed user.
  const { hashPassword, DEMO_PASSWORD } = await import("../src/lib/auth/password");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const user of USERS) {
    const { key, ...data } = user;
    await prisma.user.upsert({
      where: { phone: data.phone },
      update: { ...data, passwordHash },
      create: { ...data, passwordHash },
    });
    void key;
  }
  console.log(`Seeded ${USERS.length} users (password: ${DEMO_PASSWORD})`);
}

async function seedListings() {
  const areasBySlug = new Map(
    (await prisma.area.findMany()).map((area) => [area.slug, area]),
  );
  const usersByPhone = new Map(
    (await prisma.user.findMany()).map((user) => [user.phone, user]),
  );
  const userIdByKey = new Map(
    USERS.map((user) => [user.key, usersByPhone.get(user.phone)!.id]),
  );
  const amenityIdBySlug = new Map(
    (await prisma.amenity.findMany()).map((amenity) => [amenity.slug, amenity.id]),
  );

  const all: ListingSeed[] = [...RENT_LISTINGS, ...SALE_LISTINGS];

  for (const [index, seed] of all.entries()) {
    const area = areasBySlug.get(seed.area);
    if (!area) throw new Error(`${seed.ref}: unknown area "${seed.area}"`);

    const userId = userIdByKey.get(seed.lister);
    if (!userId) throw new Error(`${seed.ref}: unknown lister "${seed.lister}"`);

    const now = Date.now();
    const createdAt = new Date(now - seed.createdDaysAgo * MS_PER_DAY);
    const lastConfirmedAt = new Date(now - seed.confirmedDaysAgo * MS_PER_DAY);
    const expiresAt = new Date(lastConfirmedAt.getTime() + LIFESPAN_DAYS * MS_PER_DAY);
    const override = STATUS_OVERRIDES[seed.ref];

    const data = {
      reference: seed.ref,
      userId,
      listingType: seed.listingType,
      propertyType: seed.propertyType,
      titleEn: seed.titleEn,
      titleAm: seed.titleAm ?? null,
      descriptionEn: seed.descriptionEn,
      descriptionAm: seed.descriptionAm ?? null,
      price: seed.price,
      currency: seed.currency ?? "ETB",
      priceNegotiable: seed.negotiable ?? false,
      rentPeriod: seed.rentPeriod ?? null,
      advanceMonths: seed.advanceMonths ?? null,
      bedrooms: seed.bedrooms ?? null,
      bathrooms: seed.bathrooms ?? null,
      areaSqm: seed.areaSqm ?? null,
      floorsGPlus: seed.floorsGPlus ?? null,
      furnishing: seed.furnishing ?? null,
      areaId: area.id,
      addressNote: seed.addressNote ?? null,
      lat: area.lat + jitter(seed.ref, 1),
      lng: area.lng + jitter(seed.ref, 2),
      status: override?.status ?? ("ACTIVE" as ListingStatus),
      rejectionReason: override?.reason ?? null,
      createdAt,
      lastConfirmedAt,
      expiresAt,
      views: seed.views,
      contactReveals: seed.contactReveals ?? 0,
    };

    const listing = await prisma.listing.upsert({
      where: { reference: seed.ref },
      update: data,
      create: data,
    });

    await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
    const photos = photoSet([...seed.photos], index + 1);
    await prisma.listingImage.createMany({
      data: photos.map((photoId, order) => ({
        listingId: listing.id,
        url: unsplashUrl(photoId),
        publicId: photoId,
        order,
        isCover: order === 0,
        width: 1200,
        height: 800,
      })),
    });

    await prisma.listingAmenity.deleteMany({ where: { listingId: listing.id } });
    await prisma.listingAmenity.createMany({
      data: seed.amenities.map((slug) => {
        const amenityId = amenityIdBySlug.get(slug);
        if (!amenityId) throw new Error(`${seed.ref}: unknown amenity "${slug}"`);
        return { listingId: listing.id, amenityId };
      }),
    });
  }

  console.log(`Seeded ${all.length} listings with images and amenities`);
}

async function main() {
  await seedAreas();
  await seedAmenities();
  await seedUsers();
  await seedListings();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

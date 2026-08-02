import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { AMENITIES } from "./seed-data/amenities";
import { AREAS } from "./seed-data/areas";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedAreas() {
  for (const [index, area] of AREAS.entries()) {
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
    if ((index + 1) % 15 === 0) {
      console.log(`  areas ${index + 1}/${AREAS.length}`);
    }
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

async function main() {
  await seedAreas();
  await seedAmenities();
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

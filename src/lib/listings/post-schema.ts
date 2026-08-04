import { z } from "zod";

export const POST_STEPS = [
  "type",
  "location",
  "details",
  "amenities",
  "photos",
  "price",
  "review",
] as const;

export type PostStep = (typeof POST_STEPS)[number];

export const postDraftSchema = z.object({
  listingType: z.enum(["FOR_RENT", "FOR_SALE"]),
  propertyType: z.enum([
    "CONDOMINIUM",
    "APARTMENT",
    "VILLA",
    "SERVICE_QUARTER",
    "WHOLE_BUILDING",
    "SHOP",
    "OFFICE",
    "WAREHOUSE",
    "LAND",
  ]),
  areaSlug: z.string().min(1),
  addressNote: z.string().trim().max(160).optional().or(z.literal("")),
  lat: z.number().min(8.5).max(9.5),
  lng: z.number().min(38.3).max(39.2),
  titleEn: z.string().trim().min(8).max(120),
  titleAm: z.string().trim().max(120).optional().or(z.literal("")),
  descriptionEn: z.string().trim().min(40).max(4000),
  descriptionAm: z.string().trim().max(4000).optional().or(z.literal("")),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  areaSqm: z.number().min(1).max(100_000).optional(),
  floorsGPlus: z.number().int().min(0).max(40).optional(),
  furnishing: z
    .enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"])
    .optional(),
  amenitySlugs: z.array(z.string()).default([]),
  photoUrls: z.array(z.string().url()).min(1).max(12),
  price: z.number().positive().max(5_000_000_000),
  currency: z.enum(["ETB", "USD"]),
  priceNegotiable: z.boolean().default(false),
  rentPeriod: z.enum(["MONTHLY", "YEARLY"]).optional(),
  advanceMonths: z.number().int().min(1).max(12).optional(),
});

export type PostDraft = z.infer<typeof postDraftSchema>;

export const emptyDraft = (): Partial<PostDraft> => ({
  listingType: "FOR_RENT",
  currency: "ETB",
  rentPeriod: "MONTHLY",
  priceNegotiable: false,
  amenitySlugs: [],
  photoUrls: [],
  lat: 9.03,
  lng: 38.74,
});

import type {
  Currency,
  Furnishing,
  ListingStatus,
  ListingType,
  PropertyType,
  RentPeriod,
} from "../../src/generated/prisma/enums";
import type { PhotoPool } from "./photos";

export type ListingSeed = {
  /** Public reference printed on the listing so it can be quoted on the phone. */
  ref: string;
  /** Key into USERS. */
  lister: string;
  listingType: ListingType;
  propertyType: PropertyType;
  titleEn: string;
  titleAm?: string;
  descriptionEn: string;
  descriptionAm?: string;

  price: number;
  currency?: Currency;
  negotiable?: boolean;
  rentPeriod?: RentPeriod;
  advanceMonths?: number;

  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  /** Ground plus N floors, rendered as "G+2". */
  floorsGPlus?: number;
  furnishing?: Furnishing;

  /** Area slug from areas.ts. */
  area: string;
  addressNote?: string;

  /** Amenity slugs from amenities.ts. */
  amenities: string[];
  /** Photo pools, in order. The first becomes the cover. */
  photos: PhotoPool[];

  confirmedDaysAgo: number;
  createdDaysAgo: number;
  status?: ListingStatus;
  views: number;
  contactReveals?: number;
  rejectionReason?: string;
};

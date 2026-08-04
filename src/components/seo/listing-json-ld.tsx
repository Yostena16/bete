import type { ListingDetail } from "@/lib/listings/detail";
import { absoluteUrl } from "@/lib/site";
import { formatPrice } from "@/lib/format";

/**
 * Google's RealEstateListing-shaped JSON-LD. Kept as a script tag so the
 * detail page stays a server component and crawlers see structured data
 * without waiting on client hydration.
 */
export function ListingJsonLd({
  listing,
  locale,
}: {
  listing: ListingDetail;
  locale: string;
}) {
  const isAmharic = locale === "am";
  const title =
    isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const description =
    isAmharic && listing.descriptionAm
      ? listing.descriptionAm
      : listing.descriptionEn;
  const areaName = isAmharic ? listing.area.nameAm : listing.area.nameEn;
  const url = absoluteUrl(`/${locale}/listings/${listing.reference}`);
  const images = listing.images.map((image) => image.url);

  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description: description.slice(0, 500),
    url,
    datePosted: listing.createdAt.toISOString(),
    image: images.length ? images : undefined,
    offers: {
      "@type": "Offer",
      price: Number(listing.price),
      priceCurrency: listing.currency,
      availability:
        listing.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: Number(listing.price),
        priceCurrency: listing.currency,
        name: formatPrice(Number(listing.price), listing.currency, locale),
      },
    },
    contentLocation: {
      "@type": "Place",
      name: areaName,
      address: {
        "@type": "PostalAddress",
        addressLocality: areaName,
        addressRegion: listing.area.subCity,
        addressCountry: "ET",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: listing.lat,
        longitude: listing.lng,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

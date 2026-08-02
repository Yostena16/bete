import Image from "next/image";
import { Bath, BedDouble, Maximize2, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatArea } from "@/lib/format";
import { getFreshness } from "@/lib/freshness";
import { KeyAmenityIcon } from "@/lib/amenity-icons";
import { FreshnessBadge } from "@/components/freshness/freshness-badge";
import { LifeRail } from "@/components/freshness/life-rail";
import { ListingPrice } from "./listing-price";
import { SaveButton } from "./save-button";
import type { ListingCardData } from "@/lib/listings/query";

type ListingCardProps = {
  listing: ListingCardData;
  /** Set on the first row so the largest contentful paint is not lazy-loaded. */
  priority?: boolean;
  className?: string;
};

/**
 * The unit the whole search experience is made of.
 *
 * Two decisions worth stating. First, the life rail is welded to the bottom
 * edge of the photo rather than tucked into the body, so a scrolling column of
 * cards reads as a row of confidence bars before any text is processed. Second,
 * the area name outranks the title in the visual hierarchy, because in Addis
 * nobody searches for "spacious modern apartment" — they search for Bole.
 */
export function ListingCard({
  listing,
  priority = false,
  className,
}: ListingCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isAmharic = locale === "am";

  const freshness = getFreshness(listing.lastConfirmedAt);
  const title = isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const areaName = isAmharic ? listing.area.nameAm : listing.area.nameEn;
  const cover = listing.images[0]?.url ?? null;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-surface",
        "shadow-[0_1px_2px_rgba(6,31,32,0.06)] transition-shadow duration-200",
        "hover:shadow-[0_8px_24px_rgba(6,31,32,0.10)]",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-bete",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-wash">
        {cover ? (
          <Image
            src={cover}
            alt={t("listing.coverAlt", { title, area: areaName })}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="grid size-full place-items-center text-xs text-ink-soft">
            {t("listing.noPhoto")}
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-bete/90 px-2 py-0.5 text-xs font-medium text-paper backdrop-blur">
          {t(`propertyType.${listing.propertyType}`)}
        </span>

        {/* Above the card-wide link overlay, or it cannot be clicked. */}
        <SaveButton listingId={listing.id} className="absolute right-3 top-3 z-10" />

        <LifeRail
          lifeRemaining={freshness.lifeRemaining}
          band={freshness.band}
          className="absolute inset-x-0 bottom-0"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <ListingPrice
          price={Number(listing.price)}
          currency={listing.currency}
          listingType={listing.listingType}
          rentPeriod={listing.rentPeriod}
          negotiable={listing.priceNegotiable}
          locale={locale}
        />

        <h3 className="text-sm leading-snug text-ink-soft">
          {/*
            The link covers the card so the entire surface is clickable, while
            the accessible name stays the title rather than "read more".
          */}
          <Link
            href={`/listings/${listing.reference}`}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>

        <p className="flex items-center gap-1 font-display text-base font-medium text-ink">
          <MapPin className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
          {areaName}
        </p>

        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          {listing.bedrooms !== null ? (
            <li className="flex items-center gap-1">
              <BedDouble className="size-3.5" aria-hidden="true" />
              {t("listing.beds", { count: listing.bedrooms })}
            </li>
          ) : null}
          {listing.bathrooms !== null ? (
            <li className="flex items-center gap-1">
              <Bath className="size-3.5" aria-hidden="true" />
              {t("listing.baths", { count: listing.bathrooms })}
            </li>
          ) : null}
          {listing.areaSqm !== null ? (
            <li className="flex items-center gap-1">
              <Maximize2 className="size-3.5" aria-hidden="true" />
              {formatArea(listing.areaSqm)}
            </li>
          ) : null}
        </ul>

        {listing.listingType === "FOR_RENT" && listing.advanceMonths !== null ? (
          <p className="text-xs text-ink-soft">
            {t("listing.advance", { months: listing.advanceMonths })}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <FreshnessBadge lastConfirmedAt={listing.lastConfirmedAt} />

          <div className="flex items-center gap-2">
            {listing.amenities.map(({ amenity }) => (
              <span
                key={amenity.slug}
                title={t(`amenity.${amenity.slug}` as "amenity.generator")}
                className="text-ink-soft"
              >
                <KeyAmenityIcon slug={amenity.slug} className="size-3.5" />
                <span className="sr-only">
                  {t(`amenity.${amenity.slug}` as "amenity.generator")}
                </span>
              </span>
            ))}
            <span className="text-xs text-ink-soft">
              {t(`listerType.${listing.user.listerType}`)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

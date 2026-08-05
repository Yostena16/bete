"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Eye, Phone } from "lucide-react";
import { getFreshness } from "@/lib/freshness";
import { LifeRail } from "@/components/freshness/life-rail";
import { FreshnessBadge } from "@/components/freshness/freshness-badge";
import { ListingPrice } from "@/components/listings/listing-price";
import { Button } from "@/components/ui/button";
import {
  confirmAvailableAction,
  markTakenAction,
} from "@/app/actions/dashboard";
import type { ListerListing } from "@/lib/listings/dashboard";
import { cn } from "@/lib/utils";

export function DashboardListingRow({
  listing,
  locale,
}: {
  listing: ListerListing;
  locale: string;
}) {
  const t = useTranslations("dashboard");
  const tListing = useTranslations("listing");
  const tProp = useTranslations("propertyType");
  const isAmharic = locale === "am";
  const freshness = getFreshness(listing.lastConfirmedAt);
  const [pending, startTransition] = useTransition();
  const title =
    isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const areaName = isAmharic ? listing.area.nameAm : listing.area.nameEn;
  const cover = listing.images[0]?.url ?? null;
  const canConfirm =
    listing.status === "ACTIVE" || listing.status === "EXPIRED";
  const canMarkTaken = listing.status === "ACTIVE";

  return (
    <article className="overflow-hidden rounded-xl border border-stone-soft bg-surface shadow-[0_1px_2px_rgba(6,31,32,0.06)]">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/listings/${listing.reference}`}
          className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-stone-wash sm:aspect-auto sm:min-h-[11rem] sm:w-44 md:w-52 self-stretch"
        >
          {cover ? (
            <Image
              src={cover}
              alt={tListing("coverAlt", { title, area: areaName })}
              fill
              sizes="(min-width: 640px) 208px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid size-full min-h-36 place-items-center text-xs text-ink-soft">
              {tListing("noPhoto")}
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-bete/90 px-2 py-0.5 text-xs font-medium text-paper backdrop-blur">
            {tProp(listing.propertyType)}
          </span>
          <div className="absolute inset-x-0 bottom-0">
            <LifeRail
              lifeRemaining={freshness.lifeRemaining}
              band={freshness.band}
              size="sm"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  listing.status === "ACTIVE" && "bg-mint-wash text-ink",
                  listing.status === "PENDING" && "bg-ochre-wash text-ink",
                  listing.status === "REJECTED" && "bg-danger-wash text-danger",
                  (listing.status === "EXPIRED" ||
                    listing.status === "RENTED" ||
                    listing.status === "SOLD") &&
                    "bg-stone-wash text-ink-soft",
                  listing.status === "DRAFT" && "bg-stone-wash text-ink-soft",
                )}
              >
                {t(`status.${listing.status}`)}
              </span>
              <span className="text-xs text-ink-soft">{listing.reference}</span>
            </div>

            <div>
              <p className="text-sm font-medium text-ink-soft">{areaName}</p>
              <Link
                href={`/listings/${listing.reference}`}
                className="font-display text-lg font-semibold text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete"
              >
                {title}
              </Link>
            </div>

            <ListingPrice
              price={Number(listing.price)}
              currency={listing.currency}
              listingType={listing.listingType}
              rentPeriod={listing.rentPeriod}
              negotiable={listing.priceNegotiable}
              locale={locale}
              size="card"
            />

            <FreshnessBadge
              lastConfirmedAt={listing.lastConfirmedAt}
              size="sm"
              className="self-start"
            />

            <div className="flex flex-wrap gap-4 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3.5" aria-hidden="true" />
                {t("views", { count: listing.views })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" aria-hidden="true" />
                {t("reveals", { count: listing.contactReveals })}
              </span>
            </div>

            {listing.status === "REJECTED" && listing.rejectionReason ? (
              <p className="rounded-lg bg-danger-wash px-3 py-2 text-sm text-danger">
                {listing.rejectionReason}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:w-48">
            {canConfirm ? (
              <Button
                type="button"
                disabled={pending}
                className="bg-mint-deep text-paper hover:bg-bete"
                onClick={() =>
                  startTransition(async () => {
                    await confirmAvailableAction(listing.id);
                  })
                }
              >
                {t("confirmAvailable")}
              </Button>
            ) : null}
            {canMarkTaken ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await markTakenAction(listing.id);
                  })
                }
              >
                {listing.listingType === "FOR_RENT"
                  ? t("markRented")
                  : t("markSold")}
              </Button>
            ) : null}
            {listing.status === "RENTED" || listing.status === "SOLD" ? (
              <p className="rounded-lg bg-stone-wash px-3 py-2 text-xs text-ink-soft">
                {listing.status === "RENTED"
                  ? t("closedRented")
                  : t("closedSold")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

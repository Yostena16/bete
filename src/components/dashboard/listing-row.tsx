"use client";

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
  const isAmharic = locale === "am";
  const freshness = getFreshness(listing.lastConfirmedAt);
  const [pending, startTransition] = useTransition();
  const title =
    isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const canConfirm =
    listing.status === "ACTIVE" || listing.status === "EXPIRED";
  const canMarkTaken = listing.status === "ACTIVE";

  return (
    <article className="rounded-xl border border-stone-soft bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

          <Link
            href={`/listings/${listing.reference}`}
            className="font-display text-lg font-semibold text-ink hover:underline"
          >
            {title}
          </Link>

          <ListingPrice
            price={Number(listing.price)}
            currency={listing.currency}
            listingType={listing.listingType}
            rentPeriod={listing.rentPeriod}
            negotiable={listing.priceNegotiable}
            locale={locale}
            size="card"
          />

          <div className="flex flex-col gap-1.5 pt-1">
            <LifeRail
              lifeRemaining={freshness.lifeRemaining}
              band={freshness.band}
              size="md"
            />
            <FreshnessBadge
              lastConfirmedAt={listing.lastConfirmedAt}
              size="sm"
              className="self-start"
            />
          </div>

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
    </article>
  );
}

"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import {
  takeDownListingAction,
  restoreListingAction,
} from "@/app/actions/admin";
import type { AdminListingRow } from "@/lib/listings/admin";

export function ListingManageRow({ listing }: { listing: AdminListingRow }) {
  const t = useTranslations("admin");
  const tProp = useTranslations("propertyType");
  const tStatus = useTranslations("dashboard.status");
  const locale = useLocale();
  const isAmharic = locale === "am";
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const title =
    isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const areaName = isAmharic ? listing.area.nameAm : listing.area.nameEn;
  const cover = listing.images[0]?.url ?? null;
  const canTakeDown =
    listing.status === "ACTIVE" || listing.status === "PENDING";
  const canRestore =
    listing.status === "REJECTED" || listing.status === "EXPIRED";

  return (
    <article className="rounded-xl border border-stone-soft bg-surface p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-stone-wash sm:w-36">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              className="object-cover"
              sizes="144px"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-ink-soft">
              {t("noPhotos")}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            <span>{listing.reference}</span>
            <span>·</span>
            <span>{tProp(listing.propertyType)}</span>
            <span>·</span>
            <span>{areaName}</span>
            <span>·</span>
            <span className="rounded-md bg-stone-wash px-1.5 py-0.5 font-medium text-ink">
              {tStatus(listing.status)}
            </span>
          </div>
          <Link
            href={`/listings/${listing.reference}`}
            className="font-display text-base font-semibold text-ink hover:underline"
          >
            {title}
          </Link>
          <p className="text-sm tabular-nums text-ink">
            {formatPrice(listing.price, listing.currency, locale)}
          </p>
          <p className="text-xs text-ink-soft">
            {t("listedBy", {
              name: listing.user.name,
              phone: listing.user.phone,
            })}
            {listing.user.blockedAt ? ` · ${t("ownerBlockedBadge")}` : null}
          </p>
          {listing.rejectionReason ? (
            <p className="text-xs text-danger">{listing.rejectionReason}</p>
          ) : null}

          {canTakeDown ? (
            <div className="space-y-2 pt-1">
              <label
                className="block text-xs font-medium text-ink"
                htmlFor={`td-${listing.id}`}
              >
                {t("takeDownReason")}
              </label>
              <textarea
                id={`td-${listing.id}`}
                rows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("takeDownPlaceholder")}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              />
              <Button
                type="button"
                variant="destructive"
                disabled={pending || reason.trim().length < 8}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const result = await takeDownListingAction(
                      listing.id,
                      reason,
                    );
                    if (!result.ok) setError(result.error ?? "failed");
                  })
                }
              >
                {t("takeDown")}
              </Button>
            </div>
          ) : null}

          {canRestore ? (
            <Button
              type="button"
              disabled={pending || Boolean(listing.user.blockedAt)}
              className="bg-mint-deep text-paper hover:bg-bete"
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await restoreListingAction(listing.id);
                  if (!result.ok) setError(result.error ?? "failed");
                })
              }
            >
              {t("restore")}
            </Button>
          ) : null}

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {[
                "forbidden",
                "notFound",
                "notLive",
                "notRestorable",
                "ownerBlocked",
                "reasonShort",
                "failed",
              ].includes(error)
                ? t(`errors.${error}` as "errors.failed")
                : t("errors.failed")}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

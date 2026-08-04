"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import {
  approveListingAction,
  rejectListingAction,
} from "@/app/actions/admin";
import type { PendingListing } from "@/lib/listings/admin";

export function ModerationCard({ listing }: { listing: PendingListing }) {
  const t = useTranslations("admin");
  const tProp = useTranslations("propertyType");
  const locale = useLocale();
  const isAmharic = locale === "am";
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const title =
    isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const areaName = isAmharic ? listing.area.nameAm : listing.area.nameEn;

  return (
    <article className="rounded-xl border border-stone-soft bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="grid grid-cols-2 gap-2 sm:w-56">
          {listing.images.length === 0 ? (
            <div className="col-span-2 grid aspect-[4/3] place-items-center rounded-lg bg-stone-wash text-xs text-ink-soft">
              {t("noPhotos")}
            </div>
          ) : (
            listing.images.map((image) => (
              <div
                key={image.url}
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-wash"
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </div>
            ))
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            <span>{listing.reference}</span>
            <span>·</span>
            <span>{tProp(listing.propertyType)}</span>
            <span>·</span>
            <span>{areaName}</span>
          </div>
          <Link
            href={`/listings/${listing.reference}`}
            className="font-display text-lg font-semibold text-ink hover:underline"
          >
            {title}
          </Link>
          <p className="text-sm font-medium tabular-nums text-ink">
            {formatPrice(Number(listing.price), listing.currency, locale)}
          </p>
          <p className="line-clamp-3 text-sm text-ink-soft">
            {listing.descriptionEn}
          </p>
          <p className="text-xs text-ink-soft">
            {t("listedBy", {
              name: listing.user.name,
              phone: listing.user.phone,
            })}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              disabled={pending}
              className="bg-mint-deep text-paper hover:bg-bete"
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await approveListingAction(listing.id);
                  if (!result.ok) setError(result.error ?? "failed");
                })
              }
            >
              {t("approve")}
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-medium text-ink" htmlFor={`reason-${listing.id}`}>
              {t("rejectReason")}
            </label>
            <textarea
              id={`reason-${listing.id}`}
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("rejectPlaceholder")}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
            />
            <Button
              type="button"
              variant="destructive"
              disabled={pending || reason.trim().length < 8}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await rejectListingAction(listing.id, reason);
                  if (!result.ok) setError(result.error ?? "failed");
                })
              }
            >
              {t("reject")}
            </Button>
          </div>

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {[
                "forbidden",
                "notFound",
                "notPending",
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

"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Phone } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { recordContactReveal } from "@/app/actions/listing-contact";
import type { ListerType } from "@/generated/prisma/enums";

/**
 * The number is hidden behind one tap. Not to gate it — it arrives with the
 * page — but because tapping is a measurable signal of intent, and because a
 * wall of phone numbers is how a listings page starts to feel like a
 * classifieds dump rather than somewhere a person chose to advertise.
 */
export function ContactCard({
  listingId,
  reference,
  name,
  phone,
  listerType,
  phoneVerified,
  memberSince,
}: {
  listingId: string;
  reference: string;
  name: string;
  phone: string;
  listerType: ListerType | null;
  phoneVerified: boolean;
  memberSince: Date;
}) {
  const t = useTranslations("detail");
  const tLister = useTranslations("listerType");
  const format = useFormatter();
  const [revealed, setRevealed] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-stone-soft bg-surface p-5">
      <h2 className="font-display text-base font-semibold text-ink">
        {t("contact")}
      </h2>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{name}</p>
          {listerType ? (
            <p className="text-sm text-ink-soft">{tLister(listerType)}</p>
          ) : null}
          <p className="mt-1 text-xs text-ink-soft">
            {t("memberSince", {
              date: format.dateTime(memberSince, {
                year: "numeric",
                month: "long",
              }),
            })}
          </p>
        </div>
        {phoneVerified ? (
          <span className="flex items-center gap-1 rounded-full bg-mint-wash px-2 py-1 text-xs font-medium text-ink">
            <BadgeCheck className="size-3.5 text-mint-deep" aria-hidden="true" />
            {t("phoneVerified")}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        {revealed ? (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-bete px-4 py-3 font-display text-lg font-semibold tracking-tight text-paper transition-colors hover:bg-bete-soft"
          >
            <Phone className="size-4" aria-hidden="true" />
            {phone}
          </a>
        ) : (
          <Button
            className="w-full gap-2 bg-bete py-6 text-paper hover:bg-bete-soft"
            onClick={() => {
              setRevealed(true);
              startTransition(() => {
                void recordContactReveal(listingId);
              });
            }}
          >
            <Phone className="size-4" aria-hidden="true" />
            {t("showPhone")}
          </Button>
        )}
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        {t("quoteReference", { reference })}
      </p>
    </div>
  );
}

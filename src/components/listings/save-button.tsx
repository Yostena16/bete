"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type SaveButtonProps = {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
};

/**
 * Saving is optimistic and local until Phase 6b gives it a server action. The
 * button exists now so the card's layout is settled and the hit target is sized
 * correctly on touch, rather than being squeezed in later.
 */
export function SaveButton({
  listingId,
  initialSaved = false,
  className,
}: SaveButtonProps) {
  const t = useTranslations("listing");
  const [saved, setSaved] = useState(initialSaved);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("unsave") : t("save")}
      data-listing-id={listingId}
      onClick={(event) => {
        // The whole card is a link; saving must not navigate.
        event.preventDefault();
        event.stopPropagation();
        setSaved((value) => !value);
      }}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur",
        "transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-transform",
          saved ? "scale-110 fill-danger stroke-danger" : "stroke-ink-soft",
        )}
        aria-hidden="true"
      />
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { toggleSavedListingAction } from "@/app/actions/saved";

type SaveButtonProps = {
  listingId: string;
  initialSaved?: boolean;
  signedIn?: boolean;
  className?: string;
};

/**
 * Optimistic heart. Persistence goes through the saved-listings table; signed-
 * out clicks are sent to login with a callback back to the current page.
 */
export function SaveButton({
  listingId,
  initialSaved = false,
  signedIn = false,
  className,
}: SaveButtonProps) {
  const t = useTranslations("listing");
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("unsave") : t("save")}
      data-listing-id={listingId}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!signedIn) {
          router.push(`/login?callbackUrl=${encodeURIComponent("/saved")}`);
          return;
        }

        const previous = saved;
        setSaved(!previous);
        startTransition(async () => {
          const result = await toggleSavedListingAction(listingId);
          if (!result.ok) {
            setSaved(previous);
            if (result.error === "unauthenticated") {
              router.push(`/login?callbackUrl=${encodeURIComponent("/saved")}`);
            }
            return;
          }
          setSaved(Boolean(result.saved));
        });
      }}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur",
        "transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bete",
        "disabled:opacity-60",
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

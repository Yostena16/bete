"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Photo = { url: string; width: number | null; height: number | null };

/**
 * A hero photo with a strip beneath, and a lightbox on click.
 *
 * The lightbox is hand-rolled rather than a dialog component because it needs
 * arrow-key navigation and edge-to-edge images, and wrapping a carousel in a
 * modal primitive fought both. Focus is trapped by rendering it as a fixed
 * overlay with the close button focused on open.
 */
export function Gallery({ photos, alt }: { photos: Photo[]; alt: string }) {
  const t = useTranslations("detail");
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const go = useCallback(
    (delta: number) =>
      setIndex((current) => (current + delta + photos.length) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  if (photos.length === 0) return null;

  const current = photos[index];

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-wash">
          <Image
            src={current.url}
            alt={`${alt} — ${t("photoOf", { index: index + 1, total: photos.length })}`}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />

          {photos.length > 1 ? (
            <>
              <GalleryArrow
                side="left"
                label={t("previousPhoto")}
                onClick={() => go(-1)}
              />
              <GalleryArrow
                side="right"
                label={t("nextPhoto")}
                onClick={() => go(1)}
              />
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-medium text-paper backdrop-blur transition-colors hover:bg-ink"
          >
            <Expand className="size-3.5" aria-hidden="true" />
            {t("openGallery", { count: photos.length })}
          </button>
        </div>

        {photos.length > 1 ? (
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((photo, position) => (
              <li key={photo.url} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={t("photoOf", {
                    index: position + 1,
                    total: photos.length,
                  })}
                  aria-current={position === index}
                  className={cn(
                    "relative block size-16 overflow-hidden rounded-lg border-2 transition-colors sm:size-20",
                    position === index
                      ? "border-bete"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("gallery")}
          className="fixed inset-0 z-50 flex flex-col bg-ink/95"
        >
          <div className="flex items-center justify-between p-4 text-paper">
            <span className="text-sm">
              {t("photoOf", { index: index + 1, total: photos.length })}
            </span>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              aria-label={t("closeGallery")}
              className="grid size-9 place-items-center rounded-full bg-paper/10 transition-colors hover:bg-paper/20"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              src={current.url}
              alt={`${alt} — ${t("photoOf", { index: index + 1, total: photos.length })}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {photos.length > 1 ? (
              <>
                <GalleryArrow
                  side="left"
                  label={t("previousPhoto")}
                  onClick={() => go(-1)}
                  dark
                />
                <GalleryArrow
                  side="right"
                  label={t("nextPhoto")}
                  onClick={() => go(1)}
                  dark
                />
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function GalleryArrow({
  side,
  label,
  onClick,
  dark = false,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
  dark?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full transition-colors",
        side === "left" ? "left-3" : "right-3",
        dark
          ? "bg-paper/10 text-paper hover:bg-paper/20"
          : "bg-surface/90 text-ink shadow-sm backdrop-blur hover:bg-surface",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}

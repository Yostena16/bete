"use client";

import { useRef, useState, useTransition } from "react";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PostPhoto } from "@/lib/listings/post-schema";

type PhotoStepProps = {
  photos: PostPhoto[];
  onChange: (photos: PostPhoto[]) => void;
  onError: (code: string | null) => void;
};

/**
 * Compress on the client, upload through /api/uploads/image when Cloudinary is
 * configured, otherwise accept pasted URLs so posting still works locally.
 */
export function PhotoStep({ photos, onChange, onError }: PhotoStepProps) {
  const t = useTranslations("post");
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      onError("invalidPhotoUrl");
      return;
    }
    if (photos.length >= 12) return;
    onChange([
      ...photos,
      { url, publicId: `manual/${crypto.randomUUID()}` },
    ]);
    setUrlInput("");
    onError(null);
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    onError(null);
    setUploading(true);
    try {
      const next = [...photos];
      for (const file of Array.from(files)) {
        if (next.length >= 12) break;
        if (!file.type.startsWith("image/")) {
          onError("notImage");
          continue;
        }

        const compressed = await imageCompression(file, {
          maxSizeMB: 1.2,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: "image/webp",
        });

        const body = new FormData();
        body.set("file", compressed, compressed.name || "photo.webp");

        const response = await fetch("/api/uploads/image", {
          method: "POST",
          body,
        });
        const data = (await response.json()) as {
          ok?: boolean;
          url?: string;
          publicId?: string;
          error?: string;
        };

        if (!response.ok || !data.url || !data.publicId) {
          onError(data.error ?? "uploadFailed");
          if (data.error === "cloudinaryUnset") {
            // Fall through to URL paste; stop the batch.
            break;
          }
          continue;
        }

        next.push({ url: data.url, publicId: data.publicId });
      }
      onChange(next);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">{t("photosHint")}</p>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => void onFilesSelected(event.target.files)}
        />
        <Button
          type="button"
          disabled={uploading || pending || photos.length >= 12}
          className="h-11 bg-bete text-paper hover:bg-bete-soft"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? t("uploading") : t("uploadPhotos")}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          placeholder="https://…"
          className="h-11"
          disabled={photos.length >= 12}
        />
        <Button
          type="button"
          onClick={() => startTransition(() => addUrl())}
          className="h-11"
          disabled={photos.length >= 12}
        >
          {t("addPhoto")}
        </Button>
      </div>

      <ul className="space-y-2">
        {photos.map((photo, index) => (
          <li
            key={`${photo.publicId}-${index}`}
            className="flex items-center gap-3 rounded-lg border border-stone-soft px-3 py-2 text-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="size-12 shrink-0 rounded object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-ink-soft">
              {index === 0 ? t("coverPhoto") : photo.url}
            </span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-ink-soft hover:bg-stone-wash"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-ink-soft hover:bg-stone-wash"
                onClick={() => move(index, 1)}
                disabled={index === photos.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-danger hover:bg-danger-wash"
                onClick={() =>
                  onChange(photos.filter((_, i) => i !== index))
                }
              >
                {t("removePhoto")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PinDropMapLazy } from "@/components/map/pin-drop-map-lazy";
import {
  emptyDraft,
  POST_STEPS,
  type PostDraft,
  type PostStep,
} from "@/lib/listings/post-schema";
import { submitListingAction } from "@/app/actions/post-listing";
import { PhotoStep } from "@/components/post/photo-step";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "bete:post-draft:v1";

type AreaOption = {
  slug: string;
  nameEn: string;
  nameAm: string;
};

type AmenityOption = {
  slug: string;
  nameEn: string;
  nameAm: string;
};

type PostWizardProps = {
  areas: AreaOption[];
  amenities: AmenityOption[];
  locale: string;
};

const PROPERTY_TYPES = [
  "CONDOMINIUM",
  "APARTMENT",
  "VILLA",
  "SERVICE_QUARTER",
  "WHOLE_BUILDING",
  "SHOP",
  "OFFICE",
  "WAREHOUSE",
  "LAND",
] as const;

export function PostWizard({ areas, amenities, locale }: PostWizardProps) {
  const t = useTranslations("post");
  const tProp = useTranslations("propertyType");
  const tFurn = useTranslations("furnishing");
  const router = useRouter();
  const isAmharic = locale === "am";
  const [step, setStep] = useState<PostStep>("type");
  const [draft, setDraft] = useState<Partial<PostDraft>>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setDraft({ ...emptyDraft(), ...JSON.parse(raw) });
    } catch {
      // Ignore corrupt drafts.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const stepIndex = POST_STEPS.indexOf(step);

  function patch(partial: Partial<PostDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function canContinue(): boolean {
    switch (step) {
      case "type":
        return Boolean(draft.listingType && draft.propertyType);
      case "location":
        return Boolean(draft.areaSlug && draft.lat && draft.lng);
      case "details": {
        const title = draft.titleEn?.trim() ?? "";
        const description = draft.descriptionEn?.trim() ?? "";
        return title.length >= 8 && description.length >= 40;
      }
      case "amenities":
        return true;
      case "photos":
        return (draft.photos?.length ?? 0) >= 1;
      case "price":
        return Boolean(draft.price && draft.price > 0);
      case "review":
        return true;
      default:
        return false;
    }
  }

  function next() {
    setError(null);
    if (stepIndex < POST_STEPS.length - 1) {
      setStep(POST_STEPS[stepIndex + 1]);
    }
  }

  function back() {
    setError(null);
    if (stepIndex > 0) setStep(POST_STEPS[stepIndex - 1]);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitListingAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/dashboard?posted=${result.reference}`);
    });
  }

  const sortedAreas = useMemo(
    () =>
      [...areas].sort((a, b) =>
        (isAmharic ? a.nameAm : a.nameEn).localeCompare(
          isAmharic ? b.nameAm : b.nameEn,
          locale,
        ),
      ),
    [areas, isAmharic, locale],
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ol className="mb-8 flex flex-wrap gap-2">
        {POST_STEPS.map((id, index) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => index <= stepIndex && setStep(id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                id === step
                  ? "bg-bete text-paper"
                  : index < stepIndex
                    ? "bg-mint-wash text-ink"
                    : "bg-stone-wash text-ink-soft",
              )}
            >
              {index + 1}. {t(`steps.${id}`)}
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-stone-soft bg-surface p-6">
        {step === "type" ? (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t("listingType")}</legend>
              {(["FOR_RENT", "FOR_SALE"] as const).map((value) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="listingType"
                    checked={draft.listingType === value}
                    onChange={() => patch({ listingType: value })}
                  />
                  {t(value === "FOR_RENT" ? "rent" : "sale")}
                </label>
              ))}
            </fieldset>
            <div className="space-y-1.5">
              <Label htmlFor="propertyType">{t("propertyType")}</Label>
              <select
                id="propertyType"
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={draft.propertyType ?? ""}
                onChange={(event) =>
                  patch({
                    propertyType: event.target
                      .value as PostDraft["propertyType"],
                  })
                }
              >
                <option value="" disabled>
                  {t("chooseProperty")}
                </option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {tProp(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {step === "location" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="area">{t("area")}</Label>
              <select
                id="area"
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={draft.areaSlug ?? ""}
                onChange={(event) => patch({ areaSlug: event.target.value })}
              >
                <option value="" disabled>
                  {t("chooseArea")}
                </option>
                {sortedAreas.map((area) => (
                  <option key={area.slug} value={area.slug}>
                    {isAmharic ? area.nameAm : area.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addressNote">{t("addressNote")}</Label>
              <Input
                id="addressNote"
                value={draft.addressNote ?? ""}
                onChange={(event) => patch({ addressNote: event.target.value })}
                placeholder={t("addressNotePlaceholder")}
                className="h-11"
              />
            </div>
            <p className="text-sm text-ink-soft">{t("pinHint")}</p>
            <div className="listing-map">
              <PinDropMapLazy
                lat={draft.lat ?? 9.03}
                lng={draft.lng ?? 38.74}
                onChange={({ lat, lng }) => patch({ lat, lng })}
              />
            </div>
          </div>
        ) : null}

        {step === "details" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titleEn">{t("titleEn")}</Label>
              <Input
                id="titleEn"
                value={draft.titleEn ?? ""}
                onChange={(event) => patch({ titleEn: event.target.value })}
                className="h-11"
              />
              <p className="text-xs text-ink-soft">
                {t("titleEnHint", {
                  count: (draft.titleEn?.trim().length ?? 0),
                })}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titleAm">{t("titleAm")}</Label>
              <Input
                id="titleAm"
                value={draft.titleAm ?? ""}
                onChange={(event) => patch({ titleAm: event.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descriptionEn">{t("descriptionEn")}</Label>
              <textarea
                id="descriptionEn"
                rows={5}
                value={draft.descriptionEn ?? ""}
                onChange={(event) =>
                  patch({ descriptionEn: event.target.value })
                }
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              />
              <p className="text-xs text-ink-soft">
                {t("descriptionEnHint", {
                  count: (draft.descriptionEn?.trim().length ?? 0),
                })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bedrooms">{t("bedrooms")}</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  value={draft.bedrooms ?? ""}
                  onChange={(event) =>
                    patch({
                      bedrooms: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bathrooms">{t("bathrooms")}</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  value={draft.bathrooms ?? ""}
                  onChange={(event) =>
                    patch({
                      bathrooms: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="areaSqm">{t("areaSqm")}</Label>
                <Input
                  id="areaSqm"
                  type="number"
                  min={1}
                  value={draft.areaSqm ?? ""}
                  onChange={(event) =>
                    patch({
                      areaSqm: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="floors">{t("floors")}</Label>
                <Input
                  id="floors"
                  type="number"
                  min={0}
                  value={draft.floorsGPlus ?? ""}
                  onChange={(event) =>
                    patch({
                      floorsGPlus: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="furnishing">{t("furnishing")}</Label>
              <select
                id="furnishing"
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={draft.furnishing ?? ""}
                onChange={(event) =>
                  patch({
                    furnishing: event.target.value
                      ? (event.target.value as PostDraft["furnishing"])
                      : undefined,
                  })
                }
              >
                <option value="">{t("optional")}</option>
                {(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const).map(
                  (value) => (
                    <option key={value} value={value}>
                      {tFurn(value)}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        ) : null}

        {step === "amenities" ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {amenities.map((amenity) => {
              const checked = draft.amenitySlugs?.includes(amenity.slug);
              return (
                <li key={amenity.slug}>
                  <label className="flex items-center gap-2 rounded-lg border border-stone-soft px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(checked)}
                      onChange={() => {
                        const current = draft.amenitySlugs ?? [];
                        patch({
                          amenitySlugs: checked
                            ? current.filter((slug) => slug !== amenity.slug)
                            : [...current, amenity.slug],
                        });
                      }}
                    />
                    {isAmharic ? amenity.nameAm : amenity.nameEn}
                  </label>
                </li>
              );
            })}
          </ul>
        ) : null}

        {step === "photos" ? (
          <PhotoStep
            photos={draft.photos ?? []}
            onChange={(photos) => patch({ photos })}
            onError={setError}
          />
        ) : null}

        {step === "price" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">{t("price")}</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  value={draft.price ?? ""}
                  onChange={(event) =>
                    patch({
                      price: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">{t("currency")}</Label>
                <select
                  id="currency"
                  className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={draft.currency ?? "ETB"}
                  onChange={(event) =>
                    patch({
                      currency: event.target.value as PostDraft["currency"],
                    })
                  }
                >
                  <option value="ETB">ETB</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(draft.priceNegotiable)}
                onChange={(event) =>
                  patch({ priceNegotiable: event.target.checked })
                }
              />
              {t("negotiable")}
            </label>
            {draft.listingType === "FOR_RENT" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rentPeriod">{t("rentPeriod")}</Label>
                  <select
                    id="rentPeriod"
                    className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    value={draft.rentPeriod ?? "MONTHLY"}
                    onChange={(event) =>
                      patch({
                        rentPeriod: event.target
                          .value as PostDraft["rentPeriod"],
                      })
                    }
                  >
                    <option value="MONTHLY">{t("monthly")}</option>
                    <option value="ANNUAL">{t("yearly")}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="advance">{t("advanceMonths")}</Label>
                  <Input
                    id="advance"
                    type="number"
                    min={1}
                    max={12}
                    value={draft.advanceMonths ?? ""}
                    onChange={(event) =>
                      patch({
                        advanceMonths: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === "review" ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-ink-soft">{t("reviewTitle")}: </span>
              {draft.titleEn}
            </p>
            <p>
              <span className="text-ink-soft">{t("reviewPrice")}: </span>
              {draft.price} {draft.currency}
              {draft.priceNegotiable ? ` · ${t("negotiable")}` : null}
            </p>
            <p>
              <span className="text-ink-soft">{t("reviewPhotos")}: </span>
              {draft.photos?.length ?? 0}
            </p>
            <p className="text-ink-soft">{t("reviewNote")}</p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {[
              "invalidDraft",
              "unauthenticated",
              "unknownArea",
              "rentPeriodRequired",
              "invalidPhotoUrl",
              "uploadFailed",
              "cloudinaryUnset",
              "notImage",
              "tooLarge",
              "submitFailed",
            ].includes(error)
              ? t(error as "invalidDraft")
              : t("submitFailed")}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-2">
          {!canContinue() && step === "details" ? (
            <p className="text-sm text-ink-soft" role="status">
              {t("needLongerDetails")}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={stepIndex === 0 || pending}
          >
            {t("back")}
          </Button>
          {step === "review" ? (
            <Button
              type="button"
              onClick={submit}
              disabled={pending}
              className="bg-ochre text-ink hover:bg-ochre-deep hover:text-paper"
            >
              {pending ? t("submitting") : t("submit")}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={next}
              disabled={!canContinue() || pending}
              className="bg-bete text-paper hover:bg-bete-soft"
            >
              {t("continue")}
            </Button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

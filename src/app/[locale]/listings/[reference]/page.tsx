import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eye, MapPin } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getListingByReference,
  getSimilarListings,
  recordView,
} from "@/lib/listings/detail";
import { getFreshness } from "@/lib/freshness";
import { ListingPrice } from "@/components/listings/listing-price";
import { SaveButton } from "@/components/listings/save-button";
import { ResultsGrid } from "@/components/listings/results-grid";
import { FreshnessBadge } from "@/components/freshness/freshness-badge";
import { LifeRail } from "@/components/freshness/life-rail";
import { Gallery } from "@/components/listings/detail/gallery";
import { ContactCard } from "@/components/listings/detail/contact-card";
import { SpecTable } from "@/components/listings/detail/spec-table";
import { AmenityGrid } from "@/components/listings/detail/amenity-grid";
import { ListingMapLazy } from "@/components/map/listing-map-lazy";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { auth } from "@/auth";
import { getSavedListingIds } from "@/lib/listings/saved";

type PageProps = {
  params: Promise<{ locale: string; reference: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, reference } = await params;
  const listing = await getListingByReference(reference);
  if (!listing) return {};

  const isAmharic = locale === "am";
  const title =
    isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const areaName = isAmharic ? listing.area.nameAm : listing.area.nameEn;
  const description =
    isAmharic && listing.descriptionAm
      ? listing.descriptionAm
      : listing.descriptionEn;

  return {
    title: `${title} — ${areaName}`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} — ${areaName}`,
      description: description.slice(0, 200),
      images: listing.images[0] ? [{ url: listing.images[0].url }] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { locale, reference } = await params;
  const listing = await getListingByReference(reference);
  if (!listing) notFound();

  const t = await getTranslations("detail");
  const format = await getFormatter();
  const session = await auth();
  const [similar, savedIds] = await Promise.all([
    getSimilarListings(listing),
    session?.user?.id
      ? getSavedListingIds(session.user.id)
      : Promise.resolve(new Set<string>()),
  ]);
  const signedIn = Boolean(session?.user);

  // Not awaited: the counter must never delay or fail the page.
  void recordView(listing.id);

  const isAmharic = locale === "am";
  const title =
    isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
  const description =
    isAmharic && listing.descriptionAm
      ? listing.descriptionAm
      : listing.descriptionEn;
  const areaName = isAmharic ? listing.area.nameAm : listing.area.nameEn;
  const freshness = getFreshness(listing.lastConfirmedAt);
  const isTaken = listing.status === "RENTED" || listing.status === "SOLD";

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href={listing.listingType === "FOR_RENT" ? "/rent" : "/buy"}
        className="mb-4 inline-block text-sm text-bete underline underline-offset-4 hover:text-bete-soft"
      >
        &larr; {t("backToResults")}
      </Link>

      {isTaken ? (
        <div className="mb-4 rounded-lg border border-stone bg-stone-wash px-4 py-3">
          <p className="font-display text-sm font-semibold text-ink">
            {t("takenTitle")}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {listing.listingType === "FOR_RENT"
              ? t("takenRent")
              : t("takenSale")}
          </p>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="flex flex-col gap-6">
          <Gallery photos={listing.images} alt={`${title}, ${areaName}`} />

          <header>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-ink-soft">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  {areaName}
                  {listing.addressNote ? ` — ${listing.addressNote}` : null}
                </p>
              </div>
              <SaveButton
                listingId={listing.id}
                initialSaved={savedIds.has(listing.id)}
                signedIn={signedIn}
                className="shrink-0"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
              <span>{t("posted", {
                date: format.dateTime(listing.createdAt, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              })}</span>
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" aria-hidden="true" />
                {t("views", { count: listing.views })}
              </span>
              <span>{listing.reference}</span>
            </div>
          </header>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">
              {t("specs")}
            </h2>
            <SpecTable listing={listing} />
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">
              {t("description")}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {description}
            </p>
          </section>

          {listing.amenities.length > 0 ? (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">
                {t("amenities")}
              </h2>
              <AmenityGrid
                amenities={listing.amenities.map((link) => link.amenity)}
              />
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">
              {t("location")}
            </h2>
            <p className="mb-3 text-sm text-ink-soft">{t("locationNote")}</p>
            <div className="listing-map">
              <ListingMapLazy lat={listing.lat} lng={listing.lng} />
            </div>
          </section>
        </div>

        <aside className="mt-6 flex flex-col gap-4 lg:mt-0">
          <div className="lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-4">
            <div className="rounded-xl border border-stone-soft bg-surface p-5">
              <ListingPrice
                price={Number(listing.price)}
                currency={listing.currency}
                listingType={listing.listingType}
                rentPeriod={listing.rentPeriod}
                negotiable={listing.priceNegotiable}
                locale={locale}
                size="detail"
              />
              <div className="mt-4 flex flex-col gap-2">
                <LifeRail
                  lifeRemaining={freshness.lifeRemaining}
                  band={freshness.band}
                  size="md"
                />
                <FreshnessBadge
                  lastConfirmedAt={listing.lastConfirmedAt}
                  size="md"
                  className="self-start"
                />
              </div>
            </div>

            <ContactCard
              listingId={listing.id}
              reference={listing.reference}
              name={listing.user.name}
              phone={listing.user.phone}
              listerType={listing.user.listerType}
              phoneVerified={listing.user.phoneVerified}
              memberSince={listing.user.createdAt}
            />
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-ink">
            {t("similar")}
          </h2>
          <p className="mb-4 text-sm text-ink-soft">{t("similarNote")}</p>
          <ResultsGrid
            listings={similar}
            savedIds={savedIds}
            signedIn={signedIn}
          />
        </section>
      ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

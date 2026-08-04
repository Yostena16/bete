"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ADDIS_CENTER,
  ADDIS_DEFAULT_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/map/addis";
import { formatPrice } from "@/lib/format";
import { pricePinIcon } from "./price-pin";
import type { ListingCardData } from "@/lib/listings/query";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

type SearchMapProps = {
  listings: ListingCardData[];
};

/**
 * Clustered price pins over Addis. Filters arrive already applied — this
 * component only draws what the shared search query returned, so the map and
 * the list cannot disagree.
 */
export function SearchMap({ listings }: SearchMapProps) {
  const t = useTranslations("map");
  const locale = useLocale();
  const isAmharic = locale === "am";

  const icons = useMemo(() => {
    const map = new Map<string, ReturnType<typeof pricePinIcon>>();
    for (const listing of listings) {
      map.set(
        listing.id,
        pricePinIcon(Number(listing.price), listing.currency),
      );
    }
    return map;
  }, [listings]);

  return (
    <MapContainer
      center={[ADDIS_CENTER.lat, ADDIS_CENTER.lng]}
      zoom={ADDIS_DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
      <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
        {listings.map((listing) => {
          const title =
            isAmharic && listing.titleAm ? listing.titleAm : listing.titleEn;
          const areaName = isAmharic
            ? listing.area.nameAm
            : listing.area.nameEn;

          return (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={icons.get(listing.id)}
            >
              <Popup>
                <div className="min-w-[12rem] space-y-1">
                  <p className="font-display text-sm font-semibold text-ink">
                    {formatPrice(
                      Number(listing.price),
                      listing.currency,
                      locale,
                    )}
                  </p>
                  <p className="text-xs text-ink-soft">{areaName}</p>
                  <p className="line-clamp-2 text-xs text-ink">{title}</p>
                  <Link
                    href={`/listings/${listing.reference}`}
                    className="inline-block pt-1 text-xs font-medium text-bete underline underline-offset-2"
                  >
                    {t("openListing")}
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

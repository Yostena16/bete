"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import {
  ADDIS_CENTER,
  LISTING_PIN_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/map/addis";
import { betePinIcon } from "./bete-pin";

type ListingMapProps = {
  lat: number;
  lng: number;
  className?: string;
};

/**
 * Single-listing map. Client-only because Leaflet touches `window`.
 *
 * The pin is the listing's lat/lng as stored. The brief is clear that the
 * public pin is approximate until you speak to the lister — we do not
 * jitter here; the copy next to the map carries that caveat.
 */
export function ListingMap({ lat, lng, className }: ListingMapProps) {
  const position: [number, number] = [
    Number.isFinite(lat) ? lat : ADDIS_CENTER.lat,
    Number.isFinite(lng) ? lng : ADDIS_CENTER.lng,
  ];

  return (
    <MapContainer
      center={position}
      zoom={LISTING_PIN_ZOOM}
      scrollWheelZoom={false}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
      <Marker position={position} icon={betePinIcon} />
    </MapContainer>
  );
}

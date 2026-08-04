"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import {
  ADDIS_CENTER,
  ADDIS_DEFAULT_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/map/addis";
import { betePinIcon } from "./bete-pin";

type PinDropMapProps = {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
};

function ClickHandler({
  onChange,
}: {
  onChange: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

/**
 * Drop a pin by tapping the map. The brief is clear that public pins are
 * approximate — the address note carries the landmark detail.
 */
export function PinDropMap({ lat, lng, onChange }: PinDropMapProps) {
  const position: [number, number] = [
    Number.isFinite(lat) ? lat : ADDIS_CENTER.lat,
    Number.isFinite(lng) ? lng : ADDIS_CENTER.lng,
  ];

  useEffect(() => {
    // Leaflet needs a resize after the wizard step mounts.
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={ADDIS_DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
      <ClickHandler onChange={onChange} />
      <Marker
        position={position}
        icon={betePinIcon}
        draggable
        eventHandlers={{
          dragend: (event) => {
            const marker = event.target;
            const { lat: nextLat, lng: nextLng } = marker.getLatLng();
            onChange({ lat: nextLat, lng: nextLng });
          },
        }}
      />
    </MapContainer>
  );
}

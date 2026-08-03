/**
 * Map defaults centred on Addis Ababa.
 *
 * The city sits roughly between 8.8–9.1°N and 38.6–38.9°E. Pinning the
 * default viewport here means an empty map still lands on the market we
 * serve, instead of floating over the Gulf of Guinea (Leaflet's 0,0).
 */
export const ADDIS_CENTER = { lat: 9.03, lng: 38.74 } as const;

export const ADDIS_DEFAULT_ZOOM = 12;

/** Close enough to read a neighbourhood, far enough to keep context. */
export const LISTING_PIN_ZOOM = 15;

export const OSM_TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

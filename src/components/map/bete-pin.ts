import L from "leaflet";

/**
 * A small house-shaped pin in the Bete brand colour.
 *
 * Leaflet's default blue marker would clash with the no-blue rule in the
 * design plan, so we draw our own SVG icon and keep the shadow minimal.
 */
const PIN_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48" fill="none">
  <path d="M18 0C9.163 0 2 7.163 2 16c0 11.25 16 32 16 32s16-20.75 16-32C34 7.163 26.837 0 18 0z" fill="#0C3A3C"/>
  <circle cx="18" cy="16" r="6" fill="#4FBFA0"/>
</svg>
`.trim());

export const betePinIcon = L.icon({
  iconUrl: `data:image/svg+xml,${PIN_SVG}`,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -40],
});

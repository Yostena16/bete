import L from "leaflet";
import { compactPrice } from "@/lib/format";
import type { Currency } from "@/generated/prisma/enums";

/**
 * A compact price chip used as a map marker.
 *
 * The number is always in birr terms (USD listings convert) so a column of
 * pins forms a readable price field. Colour follows the Bete brand, not Leaflet.
 */
export function pricePinIcon(amount: number, currency: Currency): L.DivIcon {
  const label = compactPrice(amount, currency);
  return L.divIcon({
    className: "price-pin",
    html: `<span class="price-pin__label">${label}</span>`,
    iconSize: [56, 28],
    iconAnchor: [28, 28],
    popupAnchor: [0, -24],
  });
}

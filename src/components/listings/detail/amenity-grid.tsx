import { useLocale } from "next-intl";
import { AmenityIcon } from "@/lib/amenity-icons";
import { cn } from "@/lib/utils";

type Amenity = {
  slug: string;
  nameEn: string;
  nameAm: string;
  icon: string;
  isKey: boolean;
};

/**
 * Key amenities lead. In Addis a generator and a water tank are not perks —
 * they are the difference between a house you can live in during a cut and one
 * you cannot, so they are pulled to the front and given weight.
 */
export function AmenityGrid({ amenities }: { amenities: Amenity[] }) {
  const locale = useLocale();
  const isAmharic = locale === "am";
  const sorted = [...amenities].sort(
    (a, b) => Number(b.isKey) - Number(a.isKey),
  );

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {sorted.map((amenity) => (
        <li
          key={amenity.slug}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
            amenity.isKey
              ? "border-mint bg-mint-wash text-ink"
              : "border-stone-soft bg-surface text-ink-soft",
          )}
        >
          <AmenityIcon
            icon={amenity.icon}
            className={cn(
              "size-4 shrink-0",
              amenity.isKey ? "text-mint-deep" : "text-stone",
            )}
          />
          {isAmharic ? amenity.nameAm : amenity.nameEn}
        </li>
      ))}
    </ul>
  );
}

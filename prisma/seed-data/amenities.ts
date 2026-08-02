export type AmenitySeed = {
  nameEn: string;
  nameAm: string;
  slug: string;
  /** lucide-react icon name, resolved through src/lib/amenity-icons.tsx. */
  icon: string;
  /**
   * Key amenities surface on the listing card itself instead of waiting for
   * the detail page. Only two qualify: a generator and a water tank are what
   * decide whether a place in Addis is livable through a power cut or a water
   * interruption, and both are routine.
   */
  isKey: boolean;
};

export const AMENITIES: AmenitySeed[] = [
  { nameEn: "Parking", nameAm: "የመኪና ማቆሚያ", slug: "parking", icon: "car", isKey: false },
  { nameEn: "Backup generator", nameAm: "ጀነሬተር", slug: "generator", icon: "zap", isKey: true },
  { nameEn: "Water reserve tank", nameAm: "የውሃ ማጠራቀሚያ", slug: "water-tank", icon: "droplets", isKey: true },
  { nameEn: "Elevator", nameAm: "አሳንሰር", slug: "elevator", icon: "move-vertical", isKey: false },
  { nameEn: "Gated compound", nameAm: "ጥብቅ ቅጥር ግቢ", slug: "gated-compound", icon: "fence", isKey: false },
  { nameEn: "24-hour security guard", nameAm: "የ24 ሰዓት ጥበቃ", slug: "security-guard", icon: "shield-check", isKey: false },
  { nameEn: "Service quarter included", nameAm: "ሰርቪስ ቤት አለው", slug: "service-quarter", icon: "house", isKey: false },
  { nameEn: "Balcony / terrace", nameAm: "በረንዳ / ቴራስ", slug: "balcony", icon: "panel-top", isKey: false },
  { nameEn: "Garden", nameAm: "የአትክልት ቦታ", slug: "garden", icon: "trees", isKey: false },
  { nameEn: "Internet ready", nameAm: "ኢንተርኔት ዝግጁ", slug: "internet", icon: "wifi", isKey: false },
  { nameEn: "Own electricity meter", nameAm: "የራሱ የመብራት ቆጣሪ", slug: "electricity-meter", icon: "gauge", isKey: false },
  { nameEn: "Own water meter", nameAm: "የራሱ የውሃ ቆጣሪ", slug: "water-meter", icon: "droplet", isKey: false },
  { nameEn: "Furnished kitchen", nameAm: "የተሟላ ኩሽና", slug: "furnished-kitchen", icon: "cooking-pot", isKey: false },
  { nameEn: "Hot water / shower", nameAm: "ሙቅ ውሃ / ሻወር", slug: "hot-water", icon: "shower-head", isKey: false },
  { nameEn: "Wheelchair accessible", nameAm: "ለተሽከርካሪ ወንበር ተስማሚ", slug: "wheelchair-accessible", icon: "accessibility", isKey: false },
];

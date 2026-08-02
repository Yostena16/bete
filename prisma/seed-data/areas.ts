import type { SubCity } from "../../src/generated/prisma/enums";

export type AreaSeed = {
  nameEn: string;
  nameAm: string;
  slug: string;
  subCity: SubCity;
  lat: number;
  lng: number;
};

/**
 * The 45 areas people in Addis actually search by. Nobody searches "Kirkos" —
 * they search "Kazanchis".
 *
 * Coordinates were resolved against OpenStreetMap's Nominatim service by
 * scripts/lookup-area-coords.ts rather than invented. Sub-city assignments are
 * taken from the brief and left alone even where a coordinate sits close to a
 * boundary, because the brief's list is the domain authority here.
 *
 * One exception is documented inline: OSM carries no node for Bole Japan.
 */
export const AREAS: AreaSeed[] = [
  // Bole
  { nameEn: "Bole Medhanialem", nameAm: "ቦሌ መድኃኒዓለም", slug: "bole-medhanialem", subCity: "BOLE", lat: 8.99834, lng: 38.78606 },
  { nameEn: "Bole Rwanda", nameAm: "ቦሌ ሩዋንዳ", slug: "bole-rwanda", subCity: "BOLE", lat: 8.99179, lng: 38.77932 },
  // No OSM node exists for this neighbourhood. Interpolated between its two
  // verified neighbours, Bole Medhanialem and Gerji, and nudged north onto the
  // residential grid the name refers to.
  { nameEn: "Bole Japan", nameAm: "ቦሌ ጃፓን", slug: "bole-japan", subCity: "BOLE", lat: 9.0012, lng: 38.7931 },
  { nameEn: "Bole Atlas", nameAm: "ቦሌ አትላስ", slug: "bole-atlas", subCity: "BOLE", lat: 9.00372, lng: 38.78067 },
  { nameEn: "Bole Michael", nameAm: "ቦሌ ሚካኤል", slug: "bole-michael", subCity: "BOLE", lat: 8.98424, lng: 38.77447 },
  { nameEn: "Gerji", nameAm: "ገርጂ", slug: "gerji", subCity: "BOLE", lat: 8.99538, lng: 38.80948 },
  { nameEn: "Wollo Sefer", nameAm: "ወሎ ሰፈር", slug: "wollo-sefer", subCity: "BOLE", lat: 8.99465, lng: 38.7741 },
  { nameEn: "Airport Area", nameAm: "አየር መንገድ አካባቢ", slug: "airport-area", subCity: "BOLE", lat: 8.97919, lng: 38.79658 },
  { nameEn: "CMC", nameAm: "ሲ ኤም ሲ", slug: "cmc", subCity: "BOLE", lat: 9.01977, lng: 38.84758 },

  // Yeka
  { nameEn: "Megenagna", nameAm: "መገናኛ", slug: "megenagna", subCity: "YEKA", lat: 9.01961, lng: 38.80167 },
  { nameEn: "Summit", nameAm: "ሰሚት", slug: "summit", subCity: "YEKA", lat: 9.01098, lng: 38.83971 },
  { nameEn: "Ayat", nameAm: "አያት", slug: "ayat", subCity: "YEKA", lat: 9.03457, lng: 38.84606 },
  { nameEn: "Kotebe", nameAm: "ኮተቤ", slug: "kotebe", subCity: "YEKA", lat: 9.03713, lng: 38.83985 },
  { nameEn: "Signal", nameAm: "ሲግናል", slug: "signal", subCity: "YEKA", lat: 9.02376, lng: 38.7828 },
  { nameEn: "Haya Hulet", nameAm: "ሃያ ሁለት", slug: "haya-hulet", subCity: "YEKA", lat: 9.0149, lng: 38.78397 },
  { nameEn: "Gurd Shola", nameAm: "ጉርድ ሾላ", slug: "gurd-shola", subCity: "YEKA", lat: 9.01866, lng: 38.82094 },

  // Kirkos
  { nameEn: "Kazanchis", nameAm: "ካዛንቺስ", slug: "kazanchis", subCity: "KIRKOS", lat: 9.01593, lng: 38.77122 },
  { nameEn: "Meskel Flower", nameAm: "መስቀል ፍላወር", slug: "meskel-flower", subCity: "KIRKOS", lat: 8.98818, lng: 38.76473 },
  { nameEn: "Bambis", nameAm: "ባምቢስ", slug: "bambis", subCity: "KIRKOS", lat: 9.00987, lng: 38.77199 },
  { nameEn: "Urael", nameAm: "ኡራኤል", slug: "urael", subCity: "KIRKOS", lat: 9.01094, lng: 38.77501 },

  // Arada
  { nameEn: "Piassa", nameAm: "ፒያሳ", slug: "piassa", subCity: "ARADA", lat: 9.0337, lng: 38.75475 },
  { nameEn: "Sidist Kilo", nameAm: "ስድስት ኪሎ", slug: "sidist-kilo", subCity: "ARADA", lat: 9.04747, lng: 38.76104 },
  { nameEn: "Arat Kilo", nameAm: "አራት ኪሎ", slug: "arat-kilo", subCity: "ARADA", lat: 9.03295, lng: 38.76338 },
  { nameEn: "Kebena", nameAm: "ቀበና", slug: "kebena", subCity: "ARADA", lat: 9.03835, lng: 38.77877 },

  // Nifas Silk-Lafto
  { nameEn: "Sarbet", nameAm: "ሳር ቤት", slug: "sarbet", subCity: "NIFAS_SILK_LAFTO", lat: 8.99541, lng: 38.73771 },
  { nameEn: "Old Airport", nameAm: "ኦልድ አየርፖርት", slug: "old-airport", subCity: "NIFAS_SILK_LAFTO", lat: 9.00517, lng: 38.76856 },
  { nameEn: "Jemo", nameAm: "ጀሞ", slug: "jemo", subCity: "NIFAS_SILK_LAFTO", lat: 8.95996, lng: 38.71148 },
  { nameEn: "Lebu", nameAm: "ለቡ", slug: "lebu", subCity: "NIFAS_SILK_LAFTO", lat: 8.96114, lng: 38.72542 },
  { nameEn: "Lafto", nameAm: "ላፍቶ", slug: "lafto", subCity: "NIFAS_SILK_LAFTO", lat: 8.94706, lng: 38.74433 },
  { nameEn: "Hana Mariam", nameAm: "ሐና ማርያም", slug: "hana-mariam", subCity: "NIFAS_SILK_LAFTO", lat: 8.93309, lng: 38.74354 },
  { nameEn: "Bisrate Gebriel", nameAm: "ብስራተ ገብርኤል", slug: "bisrate-gebriel", subCity: "NIFAS_SILK_LAFTO", lat: 8.9919, lng: 38.7264 },

  // Lideta
  { nameEn: "Mexico", nameAm: "ሜክሲኮ", slug: "mexico", subCity: "LIDETA", lat: 9.01038, lng: 38.74448 },
  { nameEn: "Lideta", nameAm: "ልደታ", slug: "lideta", subCity: "LIDETA", lat: 9.01108, lng: 38.73667 },
  { nameEn: "Torhailoch", nameAm: "ጦር ኃይሎች", slug: "torhailoch", subCity: "LIDETA", lat: 9.01135, lng: 38.72284 },

  // Addis Ketema
  { nameEn: "Merkato", nameAm: "መርካቶ", slug: "merkato", subCity: "ADDIS_KETEMA", lat: 9.03128, lng: 38.73756 },
  { nameEn: "Autobis Tera", nameAm: "አውቶቢስ ተራ", slug: "autobis-tera", subCity: "ADDIS_KETEMA", lat: 9.03398, lng: 38.73224 },

  // Gullele
  { nameEn: "Shiro Meda", nameAm: "ሽሮ ሜዳ", slug: "shiro-meda", subCity: "GULLELE", lat: 9.06053, lng: 38.76137 },
  { nameEn: "Kuas Meda", nameAm: "ኳስ ሜዳ", slug: "kuas-meda", subCity: "GULLELE", lat: 9.03785, lng: 38.72737 },

  // Kolfe Keranio
  { nameEn: "Kolfe", nameAm: "ኮልፌ", slug: "kolfe", subCity: "KOLFE_KERANIO", lat: 9.01819, lng: 38.68978 },
  { nameEn: "Ayer Tena", nameAm: "አየር ጤና", slug: "ayer-tena", subCity: "KOLFE_KERANIO", lat: 8.99408, lng: 38.69057 },
  { nameEn: "Asko", nameAm: "አስኮ", slug: "asko", subCity: "KOLFE_KERANIO", lat: 9.06556, lng: 38.69348 },

  // Akaky Kaliti
  { nameEn: "Kality", nameAm: "ቃሊቲ", slug: "kality", subCity: "AKAKY_KALITI", lat: 8.93795, lng: 38.763 },
  { nameEn: "Tulu Dimtu", nameAm: "ቱሉ ዲምቱ", slug: "tulu-dimtu", subCity: "AKAKY_KALITI", lat: 8.85, lng: 38.81666 },
  { nameEn: "Koye Feche", nameAm: "ቆዬ ፈጬ", slug: "koye-feche", subCity: "AKAKY_KALITI", lat: 8.90322, lng: 38.82479 },

  // Lemi Kura
  { nameEn: "Jacros", nameAm: "ጃክሮስ", slug: "jacros", subCity: "LEMI_KURA", lat: 9.00415, lng: 38.80748 },
];

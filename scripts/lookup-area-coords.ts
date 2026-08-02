/**
 * Resolves each Addis Ababa area in the seed list to real coordinates using
 * OpenStreetMap's Nominatim service, so the numbers in prisma/seed-data/areas.ts
 * have a traceable source rather than being invented.
 *
 * Run with: npx tsx scripts/lookup-area-coords.ts
 *
 * Nominatim's usage policy allows one request per second and requires a real
 * User-Agent, both of which this respects. Areas it cannot resolve are printed
 * as MISS so they can be checked by hand against a map.
 */

const QUERIES: Array<{ name: string; query: string }> = [
  { name: "Bole Medhanialem", query: "Bole Medhanialem Church, Addis Ababa" },
  { name: "Bole Rwanda", query: "Rwanda, Bole, Addis Ababa" },
  { name: "Bole Japan", query: "Japan Sefer, Bole, Addis Ababa" },
  { name: "Bole Atlas", query: "Atlas Hotel, Bole, Addis Ababa" },
  { name: "Bole Michael", query: "Bole Michael, Addis Ababa" },
  { name: "Gerji", query: "Gerji, Addis Ababa" },
  { name: "Wollo Sefer", query: "Wollo Sefer, Addis Ababa" },
  { name: "Airport Area", query: "Bole International Airport, Addis Ababa" },
  { name: "CMC", query: "CMC, Addis Ababa" },
  { name: "Megenagna", query: "Megenagna, Addis Ababa" },
  { name: "Summit", query: "Summit, Addis Ababa" },
  { name: "Ayat", query: "Ayat, Addis Ababa" },
  { name: "Kotebe", query: "Kotebe, Addis Ababa" },
  { name: "Signal", query: "Signal, Addis Ababa" },
  { name: "Kazanchis", query: "Kazanchis, Addis Ababa" },
  { name: "Meskel Flower", query: "Meskel Flower, Addis Ababa" },
  { name: "Bambis", query: "Bambis, Addis Ababa" },
  { name: "Urael", query: "Urael Church, Addis Ababa" },
  { name: "Piassa", query: "Piassa, Addis Ababa" },
  { name: "Sidist Kilo", query: "Sidist Kilo, Addis Ababa" },
  { name: "Arat Kilo", query: "Arat Kilo, Addis Ababa" },
  { name: "Kebena", query: "Kebena, Addis Ababa" },
  { name: "Sarbet", query: "Sarbet, Addis Ababa" },
  { name: "Old Airport", query: "Old Airport, Addis Ababa" },
  { name: "Jemo", query: "Jemo, Addis Ababa" },
  { name: "Lebu", query: "Lebu, Addis Ababa" },
  { name: "Lafto", query: "Lafto, Addis Ababa" },
  { name: "Hana Mariam", query: "Hana Mariam, Addis Ababa" },
  { name: "Mexico", query: "Mexico Square, Addis Ababa" },
  { name: "Lideta", query: "Lideta, Addis Ababa" },
  { name: "Torhailoch", query: "Torhailoch, Addis Ababa" },
  { name: "Merkato", query: "Merkato, Addis Ababa" },
  { name: "Autobis Tera", query: "Autobus Tera, Addis Ababa" },
  { name: "Shiro Meda", query: "Shiro Meda, Addis Ababa" },
  { name: "Kuas Meda", query: "Kuas Meda, Addis Ababa" },
  { name: "Kolfe", query: "Kolfe, Addis Ababa" },
  { name: "Ayer Tena", query: "Ayer Tena, Addis Ababa" },
  { name: "Asko", query: "Asko, Addis Ababa" },
  { name: "Kality", query: "Kality, Addis Ababa" },
  { name: "Tulu Dimtu", query: "Tulu Dimtu, Addis Ababa" },
  { name: "Koye Feche", query: "Koye Feche, Addis Ababa" },
  { name: "Jacros", query: "Jackros, Addis Ababa" },
  { name: "Bisrate Gebriel", query: "Bisrate Gabriel Church, Addis Ababa" },
  { name: "Haya Hulet", query: "Haya Hulet, Addis Ababa" },
  { name: "Gurd Shola", query: "Gurd Shola, Addis Ababa" },
];

const ADDIS_BBOX = { minLat: 8.83, maxLat: 9.13, minLng: 38.63, maxLng: 38.94 };

async function lookup(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "et");

  const response = await fetch(url, {
    headers: { "User-Agent": "bete-portfolio-project/1.0 (area coordinate seed)" },
  });
  if (!response.ok) return null;

  const results = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (results.length === 0) return null;

  return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
}

async function main() {
  for (const { name, query } of QUERIES) {
    const hit = await lookup(query);
    if (!hit) {
      console.log(`MISS  ${name.padEnd(20)} ${query}`);
    } else {
      const inCity =
        hit.lat >= ADDIS_BBOX.minLat &&
        hit.lat <= ADDIS_BBOX.maxLat &&
        hit.lng >= ADDIS_BBOX.minLng &&
        hit.lng <= ADDIS_BBOX.maxLng;
      console.log(
        `${inCity ? "OK  " : "OUT "}  ${name.padEnd(20)} ${hit.lat.toFixed(5)}, ${hit.lng.toFixed(5)}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
}

main();

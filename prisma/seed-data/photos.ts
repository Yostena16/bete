/**
 * Photo pools for the seed, grouped so an office listing never gets a bedroom
 * as its cover shot.
 *
 * Every ID below was checked against images.unsplash.com before being added;
 * see .scratch history and scripts. Unsplash serves these under its licence,
 * which permits use without attribution, though the README credits it anyway.
 */

export const PHOTO_POOLS = {
  houseExterior: [
    "photo-1568605114967-8130f3a36994",
    "photo-1570129477492-45c003edd2be",
    "photo-1512917774080-9991f1c4c750",
    "photo-1600596542815-ffad4c1539a9",
    "photo-1580587771525-78b9dba3b914",
    "photo-1613490493576-7fde63acd811",
    "photo-1605276374104-dee2a0ed3cd6",
    "photo-1523217582562-09d0def993a6",
    "photo-1564013799919-ab600027ffc6",
    "photo-1449844908441-8829872d2607",
    "photo-1518780664697-55e3ad937233",
    "photo-1502005229762-cf1b2da7c5d6",
    "photo-1583608205776-bfd35f0d9f83",
  ],
  block: [
    "photo-1545324418-cc1a3fa10c00",
    "photo-1460317442991-0ec209397118",
    "photo-1486406146926-c627a92ad1ab",
    "photo-1497366216548-37526070297c",
    "photo-1554435493-93422e8220c8",
    "photo-1493809842364-78817add7ffb",
    "photo-1522708323590-d24dbb6b0267",
  ],
  living: [
    "photo-1586023492125-27b2c045efd7",
    "photo-1600210492486-724fe5c67fb0",
    "photo-1600585154340-be6161a56a0c",
    "photo-1600607687939-ce8a6c25118c",
    "photo-1615529182904-14819c35db37",
    "photo-1567767292278-a4f21aa2d36e",
    "photo-1560448204-e02f11c3d0e2",
    "photo-1502672260266-1c1ef2d93688",
    "photo-1560185007-cde436f6a4d0",
    "photo-1616486338812-3dadae4b4ace",
    "photo-1600566753190-17f0baa2a6c3",
  ],
  bedroom: [
    "photo-1600566753086-00f18fb6b3ea",
    "photo-1522771739844-6a9f6d5f14af",
    "photo-1505693416388-ac5ce068fe85",
    "photo-1540518614846-7eded433c457",
    "photo-1571508601891-ca5e7a713859",
  ],
  kitchen: [
    "photo-1600607687920-4e2a09cf159d",
    "photo-1484154218962-a197022b5858",
    "photo-1556909212-d5b604d0c90d",
    "photo-1556911220-bff31c812dba",
    "photo-1600489000022-c2086d79f9d4",
  ],
  bathroom: [
    "photo-1620626011761-996317b8d101",
    "photo-1584622650111-993a426fbf0a",
    "photo-1552321554-5fefe8c9ef14",
  ],
  office: [
    "photo-1497366754035-f200968a6e72",
    "photo-1497366811353-6870744d04b2",
    "photo-1524758631624-e2822e304c36",
    "photo-1497215842964-222b430dc094",
    "photo-1568992687947-868a62a9f521",
  ],
  shop: [
    "photo-1441986300917-64674bd600d8",
    "photo-1604719312566-8912e9227c6a",
    "photo-1555529669-e69e7aa0ba9a",
    "photo-1567401893414-76b7b1e5a7a5",
  ],
  warehouse: [
    "photo-1553413077-190dd305871c",
    "photo-1601598851547-4302969d0614",
    "photo-1587293852726-70cdb56c2866",
    "photo-1494412574643-ff11b0a5c1c3",
  ],
  land: [
    "photo-1500382017468-9049fed747ef",
    "photo-1464226184884-fa280b87c399",
    "photo-1416879595882-3373a0480b5b",
    "photo-1523712999610-f77fbcfc3843",
  ],
  compound: [
    "photo-1595877244574-e90ce41ce089",
    "photo-1558036117-15d82a90b9b1",
    "photo-1571939228382-b2f2b585ce15",
  ],
} as const;

export type PhotoPool = keyof typeof PHOTO_POOLS;

export function unsplashUrl(id: string, width = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;
}

/**
 * Builds a photo set for one listing by walking each requested pool at an
 * offset derived from the listing index, so neighbouring cards in the grid do
 * not repeat the same cover shot.
 */
export function photoSet(pools: PhotoPool[], seed: number): string[] {
  return pools.map((pool, position) => {
    const ids = PHOTO_POOLS[pool];
    return ids[(seed * 3 + position * 5) % ids.length];
  });
}

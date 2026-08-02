-- Proximity search ("similar listings nearby", the map's radius filter) runs
-- through PostGIS rather than a naive bounding box, so distances are real
-- metres on the spheroid instead of degrees.
--
-- Prisma has no geometry type, so the point is built from the existing lat/lng
-- columns inside an expression index. Queries must use the identical
-- expression for the planner to pick this up:
--
--   ST_DWithin(
--     ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)::geography,
--     ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
--     $3
--   )

CREATE INDEX IF NOT EXISTS "Listing_location_gist_idx"
  ON "Listing"
  USING GIST ((ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)::geography));

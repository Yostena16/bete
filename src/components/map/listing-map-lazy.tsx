"use client";

import dynamic from "next/dynamic";

/**
 * Leaflet cannot render on the server. This wrapper keeps the SSR boundary
 * at the import so the detail page stays a server component.
 */
export const ListingMapLazy = dynamic(
  () => import("./listing-map").then((mod) => mod.ListingMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center bg-stone-wash text-sm text-ink-soft"
        aria-hidden="true"
      />
    ),
  },
);

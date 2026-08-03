"use client";

import dynamic from "next/dynamic";
import type { ListingCardData } from "@/lib/listings/query";

type Props = {
  listings: ListingCardData[];
};

export const SearchMapLazy = dynamic(
  () => import("./search-map").then((mod) => mod.SearchMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-stone-wash text-sm text-ink-soft" />
    ),
  },
);

export function SearchMapBoundary({ listings }: Props) {
  return <SearchMapLazy listings={listings} />;
}

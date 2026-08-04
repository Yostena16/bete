import { ListingCard } from "./listing-card";
import type { ListingCardData } from "@/lib/listings/query";

/**
 * Four columns on a wide desktop, one on a phone. The first four cards are
 * marked priority so the largest contentful paint is a real photo rather than a
 * lazily-loaded one.
 */
export function ResultsGrid({
  listings,
  savedIds,
  signedIn = false,
}: {
  listings: ListingCardData[];
  savedIds?: Set<string>;
  signedIn?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          priority={index < 4}
          saved={savedIds?.has(listing.id) ?? false}
          signedIn={signedIn}
        />
      ))}
    </div>
  );
}

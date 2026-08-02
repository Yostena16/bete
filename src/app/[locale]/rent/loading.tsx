import { ListingGridSkeleton } from "@/components/listings/listing-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-8 w-80 max-w-full" />
      <Skeleton className="mb-6 h-4 w-96 max-w-full" />
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <Skeleton className="hidden h-[600px] w-full lg:block" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-11 w-full" />
          <ListingGridSkeleton />
        </div>
      </div>
    </div>
  );
}

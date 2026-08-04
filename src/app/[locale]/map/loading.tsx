import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-8 w-72 max-w-full" />
      <Skeleton className="mb-6 h-4 w-96 max-w-full" />
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <Skeleton className="hidden h-[480px] w-full lg:block" />
        <Skeleton className="h-[min(70vh,40rem)] w-full rounded-xl" />
      </div>
    </div>
  );
}

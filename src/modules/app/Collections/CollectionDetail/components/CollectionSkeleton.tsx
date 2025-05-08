"use client";

import { Skeleton } from "@/components/ui/skeleton";

const CollectionSkeleton = () => {
  return (
    <main className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
};

const ProductCardSkeleton = () => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border">
      <Skeleton className="aspect-[3/4] w-full object-cover" />

      <div className="flex flex-col p-3 gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
};

export default CollectionSkeleton;

"use client";

import React from "react";

import { Skeleton } from "../ui/skeleton";

const ProductSkeletonGrid = () => {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 p-2"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="w-full">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4 mt-3 rounded-lg" />
          <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default ProductSkeletonGrid;

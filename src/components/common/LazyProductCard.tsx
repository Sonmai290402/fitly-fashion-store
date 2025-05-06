"use client";

import React, { memo, useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import useScrollView from "@/hooks/useScrollView";
import { ProductData } from "@/types/product.types";

import ProductCard from "./ProductCard";

type LazyProductCardProps = {
  product: ProductData;
};

export const LazyProductCard = memo(({ product }: LazyProductCardProps) => {
  const { ref, inView } = useScrollView(0.1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {isVisible ? (
        <ProductCard product={product} />
      ) : (
        <Skeleton className="h-[350px] rounded-md" />
      )}
    </div>
  );
});

LazyProductCard.displayName = "LazyProductCard";

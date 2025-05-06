"use client";

import React, { memo, useEffect, useState } from "react";

import ProductCard from "@/components/common/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductStore } from "@/store/productStore";
import { ProductData } from "@/types/product.types";

const CollectionCard = memo(({ productId }: { productId: string }) => {
  const { loading, fetchProductById } = useProductStore();
  const [product, setProduct] = useState<ProductData | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
      }
    };
    fetchProduct();
  }, [productId, fetchProductById]);

  if (loading) {
    return <Skeleton className="w-full h-full aspect-[3/4] rounded-lg" />;
  }

  if (!product) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm md:text-base text-gray-500 italic rounded-lg border border-gray-200">
        Product not found
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ProductCard product={product} className="h-full" />
    </div>
  );
});

CollectionCard.displayName = "CollectionCard";

export default CollectionCard;

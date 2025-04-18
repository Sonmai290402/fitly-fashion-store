"use client";

import React, { memo, useEffect, useState } from "react";

import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/store/productStore";
import { ProductData } from "@/types/flashsale.types";

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
    return (
      <div className="w-full h-full aspect-[3/4] rounded-lg bg-gray-100 animate-pulse" />
    );
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
      <ProductCard product={product} className="px-3 h-full" />
    </div>
  );
});

CollectionCard.displayName = "CollectionCard";

export default CollectionCard;

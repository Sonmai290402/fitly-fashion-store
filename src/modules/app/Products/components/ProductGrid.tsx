"use client";

import React, { memo, useEffect, useMemo, useState } from "react";

import NoProductFound from "@/components/common/NoProductFound";
import ProductSkeletonGrid from "@/components/common/ProductSkeletonGrid";
import { useCategoryStore } from "@/store/categoryStore";
import { useGenderStore } from "@/store/genderStore";
import { useProductStore } from "@/store/productStore";
import { ProductFilters } from "@/types/product.types";

import ProductCard from "../../../../components/common/ProductCard";

type ProductGridProps = {
  filters: ProductFilters;
};

const ProductGrid = ({ filters }: ProductGridProps) => {
  const { products, fetchProducts, loading } = useProductStore();
  const { genders } = useGenderStore();
  const { categories } = useCategoryStore();

  const [hasFetched, setHasFetched] = useState(false);

  const firestoreFilters = useMemo(() => {
    const f: ProductFilters = {};

    const genderTitle = genders.find(
      (g) => g.title.toLowerCase() === filters.gender
    )?.title;
    if (filters.gender && !genderTitle) return null;
    if (genderTitle) f.gender = genderTitle;

    const categoryTitle = categories.find(
      (c) => c.url.split("/")?.pop() === filters.category
    )?.title;
    if (filters.category && !categoryTitle) return null;
    if (categoryTitle) f.category = categoryTitle;

    if (filters.color) f.color = filters.color;
    if (filters.size) f.size = filters.size;
    if (filters.minPrice) f.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) f.maxPrice = Number(filters.maxPrice);
    if (filters.sort) f.sort = filters.sort;

    return f;
  }, [filters, genders, categories]);

  useEffect(() => {
    if (!firestoreFilters) return;
    const fetchData = async () => {
      try {
        await fetchProducts(firestoreFilters);
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, [firestoreFilters, fetchProducts]);

  return (
    <div className="w-full flex-grow">
      {loading || !hasFetched ? (
        <ProductSkeletonGrid />
      ) : products.length === 0 ? (
        <NoProductFound />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ProductGrid);

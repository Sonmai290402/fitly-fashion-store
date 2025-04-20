"use client";

import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

import Breadcrumb from "@/components/breadcrumb";
import { useCategoryStore } from "@/store/categoryStore";
import { useGenderStore } from "@/store/genderStore";
import { ProductFilters } from "@/types/product.types";

import FilterBar from "./components/FilterBar";
import MobileFilterSidebar from "./components/MobileFilterSidebar";
import ProductGrid from "./components/ProductGrid";

const Products = () => {
  const searchParams = useSearchParams();
  const { genders } = useGenderStore();
  const { categories } = useCategoryStore();

  const gender = searchParams.get("gender");
  const category = searchParams.get("category");
  const color = searchParams.get("color");
  const size = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort");

  const filters = useMemo(() => {
    return Object.entries({
      gender,
      category,
      color,
      size,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
    }).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key as keyof ProductFilters] =
          typeof value === "number" ? value.toString() : value;
      }
      return acc;
    }, {} as ProductFilters);
  }, [gender, category, color, size, minPrice, maxPrice, sort]);

  const selectedGender = filters.gender
    ? genders.find((g) => g.title.toLowerCase() === filters.gender)
    : null;
  const selectedCategory = filters.category
    ? categories.find((c) => c.url.split("/").pop() === filters.category)
    : null;
  const pageTitle = selectedCategory
    ? `${selectedCategory.title}`
    : selectedGender
    ? `${selectedGender.title}'s Products`
    : "All Products";

  return (
    <div className="flex flex-col max-w-7xl px-5 py-5 sm:mx-10 md:mx-15 lg:mx-20 gap-y-5">
      <Breadcrumb filters={filters} />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{pageTitle}</h2>
        <MobileFilterSidebar filters={filters} />
      </div>

      <div className="flex gap-5">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <FilterBar initialFilters={filters} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <ProductGrid filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default Products;

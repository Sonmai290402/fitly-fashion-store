"use client";

import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

import Breadcrumb from "@/components/common/Breadcrumb";
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
  const sort = searchParams.get("sort");

  const filters = useMemo(() => {
    const result = {} as ProductFilters;

    if (gender) result.gender = gender;
    if (category) result.category = category;
    if (color) result.color = color;
    if (size) result.size = size;
    if (sort) result.sort = sort;

    return result;
  }, [gender, category, color, size, sort]);

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

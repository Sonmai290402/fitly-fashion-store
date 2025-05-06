"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useMemo } from "react";

import Breadcrumb from "@/components/common/Breadcrumb";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/store/categoryStore";
import { useGenderStore } from "@/store/genderStore";
import { ProductFilters } from "@/types/product.types";

import FilterBar from "./components/FilterBar";
import MobileFilterSidebar from "./components/MobileFilterSidebar";
import ProductGrid from "./components/ProductGrid";

const MobileFilters = React.memo(({ filters }: { filters: ProductFilters }) => {
  return <MobileFilterSidebar filters={filters} />;
});

MobileFilters.displayName = "MobileFilters";

const MemoizedProductGrid = React.memo(ProductGrid);

const Products = () => {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleSortChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return (
    <div className="flex flex-col max-w-7xl px-5 py-5 sm:mx-10 md:mx-15 lg:mx-20 gap-y-5">
      <Breadcrumb filters={filters} />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{pageTitle}</h2>
        <div className="flex items-center gap-4">
          <Select
            value={filters.sort || "newest"}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="lg:hidden">
            <MobileFilters filters={filters} />
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <FilterBar initialFilters={filters} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <MemoizedProductGrid filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default Products;

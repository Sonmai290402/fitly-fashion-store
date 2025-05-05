"use client";

import { Loader2 } from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import NoProductFound from "@/components/common/NoProductFound";
import ProductCard from "@/components/common/ProductCard";
import ProductSkeletonGrid from "@/components/common/ProductSkeletonGrid";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useScrollView from "@/hooks/useScrollView";
import { useCategoryStore } from "@/store/categoryStore";
import { useGenderStore } from "@/store/genderStore";
import { useProductStore } from "@/store/productStore";
import { ProductFilters } from "@/types/product.types";

type ProductGridProps = {
  filters: ProductFilters;
};

const ProductGrid = ({ filters }: ProductGridProps) => {
  const {
    productsToDisplay,
    allPageProducts,
    fetchProductsForPage,
    loadMoreProducts,
    setLazyLoading,
    isLazyLoading,
    loading,
    pagination,
    setCurrentPage,
  } = useProductStore();

  const { genders } = useGenderStore();
  const { categories } = useCategoryStore();

  const [hasFetched, setHasFetched] = useState(false);

  const { ref, inView } = useScrollView(0.5, false);

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
        await fetchProductsForPage(firestoreFilters, 1);
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, [firestoreFilters, fetchProductsForPage]);

  useEffect(() => {
    if (
      inView &&
      !isLazyLoading &&
      productsToDisplay.length < allPageProducts.length
    ) {
      setLazyLoading(true);
      setTimeout(() => {
        loadMoreProducts();
      }, 300);
    }
  }, [
    inView,
    isLazyLoading,
    loadMoreProducts,
    setLazyLoading,
    productsToDisplay.length,
    allPageProducts.length,
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === pagination.currentPage) return;

      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentPage(page);

      if (firestoreFilters) {
        fetchProductsForPage(firestoreFilters, page);
      }
    },
    [
      firestoreFilters,
      pagination.currentPage,
      setCurrentPage,
      fetchProductsForPage,
    ]
  );

  const renderPagination = useCallback(() => {
    if (pagination.totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (pagination.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= pagination.totalPages; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i)}
                isActive={i === pagination.currentPage}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      } else {
        pages.push(
          <PaginationItem key={1}>
            <PaginationLink
              onClick={() => handlePageChange(1)}
              isActive={pagination.currentPage === 1}
            >
              1
            </PaginationLink>
          </PaginationItem>
        );

        if (pagination.currentPage > 3) {
          pages.push(
            <PaginationItem key="ellipsis-1">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }

        const start = Math.max(2, pagination.currentPage - 1);
        const end = Math.min(
          pagination.totalPages - 1,
          pagination.currentPage + 1
        );

        for (let i = start; i <= end; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i)}
                isActive={i === pagination.currentPage}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }

        if (pagination.currentPage < pagination.totalPages - 2) {
          pages.push(
            <PaginationItem key="ellipsis-2">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }

        pages.push(
          <PaginationItem key={pagination.totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(pagination.totalPages)}
              isActive={pagination.currentPage === pagination.totalPages}
            >
              {pagination.totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }

      return pages;
    };

    return (
      <Pagination className="my-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                handlePageChange(Math.max(1, pagination.currentPage - 1))
              }
              className={
                pagination.currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageChange(
                  Math.min(pagination.totalPages, pagination.currentPage + 1)
                )
              }
              className={
                pagination.currentPage >= pagination.totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }, [pagination, handlePageChange]);

  return (
    <div className="w-full flex-grow space-y-6">
      {loading && !hasFetched ? (
        <ProductSkeletonGrid />
      ) : productsToDisplay.length === 0 ? (
        <NoProductFound />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {productsToDisplay.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {productsToDisplay.length < allPageProducts.length && (
            <div ref={ref} className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default memo(ProductGrid);

"use client";

import { ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { LazyProductCard } from "@/components/common/LazyProductCard";
import ProductSkeletonGrid from "@/components/common/ProductSkeletonGrid";
import useScrollView from "@/hooks/useScrollView";
import { useSearchStore } from "@/store/searchStore";
import { ProductData } from "@/types/product.types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [visibleProducts, setVisibleProducts] = useState<ProductData[]>([]);

  const {
    pageSearchResults: searchResults,
    pageSearchLoading: loading,
    pageSearchError: error,
    totalResults,
    hasMore,
    lastVisibleDoc,
    performPageSearch,
    loadMoreResults,
    clearFilters,
  } = useSearchStore();

  const { ref, inView } = useScrollView(0.5, false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!searchQuery) return;

    clearFilters();

    const runSearch = async () => {
      await performPageSearch(searchQuery, true);
      setIsFirstLoad(false);
    };

    runSearch();
  }, [searchQuery, performPageSearch, clearFilters]);

  useEffect(() => {
    setVisibleProducts(searchResults);
  }, [searchResults]);

  useEffect(() => {
    if (inView && hasMore && !loading && !isLoadingMore && lastVisibleDoc) {
      const loadMore = async () => {
        setIsLoadingMore(true);
        await loadMoreResults();
        setIsLoadingMore(false);
      };

      loadMore();
    }
  }, [
    inView,
    hasMore,
    loading,
    isLoadingMore,
    lastVisibleDoc,
    loadMoreResults,
  ]);

  if (!searchQuery) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Search className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Search for products</h1>
        <p className="text-gray-500 text-center max-w-md">
          Enter a search term in the search box to find products.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm mb-6">
        <Link
          href="/"
          className="text-gray-500 flex items-center hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span>Search results</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Search results for &ldquo;{searchQuery}&rdquo;
        </h1>
        {!loading && searchResults.length > 0 && (
          <p className="text-gray-500">
            Found {totalResults} product{totalResults !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading && isFirstLoad ? (
        <ProductSkeletonGrid />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-lg text-center max-w-md">
            <p className="font-medium mb-1">Error loading results</p>
            <p className="text-sm">{error}</p>
            <button
              className="mt-3 px-4 py-2 rounded bg-white dark:bg-gray-800 text-red-500 text-sm font-medium"
              onClick={() => performPageSearch(searchQuery, true)}
            >
              Try Again
            </button>
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg max-w-md">
            <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">
              We couldn&rsquo;t find any products matching &ldquo;{searchQuery}
              &rdquo;.
            </p>
            <div className="flex justify-center">
              <Link
                href="/"
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Browse all products
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {visibleProducts.map((product) => (
              <LazyProductCard key={product.id} product={product} />
            ))}
          </div>

          {(hasMore || isLoadingMore) && (
            <div ref={ref} className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

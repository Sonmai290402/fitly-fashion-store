"use client";

import { Clock, Loader, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useSearchStore } from "@/store/searchStore";
import { formatCurrency } from "@/utils/formatCurrency";

interface SearchResultsProps {
  onItemClick?: () => void;
}

export default function SearchResults({ onItemClick }: SearchResultsProps) {
  const router = useRouter();
  const {
    searchQuery,
    searchResults,
    recentSearches,
    loading,
    clearRecentSearches,
  } = useSearchStore();

  const handleSearchItemClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    if (onItemClick) onItemClick();
  };

  const handleResultClick = (productId: string) => {
    router.push(`/product/${productId}`);
    if (onItemClick) onItemClick();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="mt-2 text-sm text-gray-500">Searching...</p>
      </div>
    );
  }

  // Empty search query but with recent searches
  if (!searchQuery && recentSearches.length > 0) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Recent Searches
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-1">
            {recentSearches.map((search) => (
              <li key={search}>
                <button
                  className="flex items-center w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                  onClick={() => handleSearchItemClick(search)}
                >
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{search}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Empty search query with no recent searches
  if (!searchQuery) {
    return (
      <div className="text-center py-6">
        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">Search for products</p>
      </div>
    );
  }

  // Has search query but no results
  if (searchResults.length === 0) {
    return (
      <div className="py-10 text-center p-4">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-700 font-medium dark:text-gray-300">
          No results found
        </p>
        <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
          We couldn&apos;t find anything for &quot;{searchQuery}&quot;. Try a
          different search term.
        </p>
      </div>
    );
  }

  // Has search query with results
  return (
    <div className="p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Products
        </h3>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto max-h-[50vh]">
          {searchResults.map((product) => {
            const imageUrl =
              product.image ||
              (product.colors &&
                product.colors[0]?.images &&
                product.colors[0].images[0]?.url) ||
              "/placeholder-product.png";

            return (
              <li key={product.id} className="py-2">
                <button
                  className="flex items-center w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                  onClick={() => handleResultClick(product.id || "")}
                >
                  <div className="h-14 w-14 relative rounded border overflow-hidden flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={product.title || "Product image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{product.title}</p>
                    <div className="flex items-center gap-1">
                      {product.sale_price ? (
                        <>
                          <p className="text-sm text-primary font-medium">
                            {formatCurrency(product.sale_price)}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatCurrency(product.price)}
                        </p>
                      )}
                    </div>
                    {product.category && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.category}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="pt-2">
          <button
            onClick={() => handleSearchItemClick(searchQuery)}
            className="text-primary hover:underline w-full text-left font-medium text-sm"
          >
            See all results for &quot;{searchQuery}&quot;
          </button>
        </div>
      </div>
    </div>
  );
}

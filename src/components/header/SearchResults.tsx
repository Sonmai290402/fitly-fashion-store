import { Clock, Loader, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useSearchStore } from "@/store/searchStore";
import { formatCurrency } from "@/utils/formatCurrency";

interface SearchResultsProps {
  onItemClick?: () => void;
}

export default function SearchResults({ onItemClick }: SearchResultsProps) {
  const hasSearched = useRef(false);
  const router = useRouter();
  const {
    searchQuery,
    searchResults,
    recentSearches,
    loading,
    performSearch,
    clearRecentSearches,
  } = useSearchStore();

  useEffect(() => {
    if (searchQuery && !hasSearched.current) {
      hasSearched.current = true;
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

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
        <Loader className="h-8 w-8 animate-spin text-gray-300 mx-auto mb-2" />
        <p className="mt-2 text-sm text-gray-500">Searching...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {searchQuery && searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Products
          </h3>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {searchResults.slice(0, 5).map((product) => (
              <li key={product.id} className="py-2">
                <button
                  className="flex items-center w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                  onClick={() => handleResultClick(product.id || "")}
                >
                  {product.image && (
                    <div className="h-14 w-14 relative rounded border overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
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
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-gray-500">
            No results found for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {!searchQuery && recentSearches.length > 0 && (
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
      )}

      {!searchQuery && recentSearches.length === 0 && (
        <div className="text-center py-6">
          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">Search for products</p>
        </div>
      )}
    </div>
  );
}

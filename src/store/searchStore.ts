import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { ProductData } from "@/types/product.types";

interface SearchState {
  searchQuery: string;
  searchResults: ProductData[];
  recentSearches: string[];
  isSearching: boolean;
  loading: boolean;
  error: string | null;
  isSearchOpen: boolean;

  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
  performSearch: (query: string) => Promise<ProductData[]>;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchOpen: (isOpen: boolean) => void;
  toggleSearch: () => void;
}

const MAX_RECENT_SEARCHES = 5;

export const useSearchStore = create<SearchState>((set, get) => {
  const getInitialRecentSearches = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("recentSearches");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse recent searches from localStorage, ", e);
      }
    }
    return [];
  };

  return {
    searchQuery: "",
    searchResults: [],
    recentSearches: getInitialRecentSearches(),
    isSearching: false,
    loading: false,
    error: null,
    isSearchOpen: false,

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    setIsSearching: (isSearching: boolean) => {
      set({ isSearching });
    },

    clearSearch: () => {
      set({ searchQuery: "", searchResults: [], isSearching: false });
    },

    setSearchOpen: (isOpen: boolean) => {
      set({ isSearchOpen: isOpen });
    },

    toggleSearch: () => {
      set((state) => ({ isSearchOpen: !state.isSearchOpen }));
    },

    performSearch: async (searchQuery: string) => {
      console.log(searchQuery);
      if (!searchQuery.trim()) {
        set({ searchResults: [], loading: false });
        return [];
      }

      set({ loading: true, error: null });

      try {
        const searchTerm = searchQuery.toLowerCase();
        const productsRef = collection(fireDB, "products");
        const results: ProductData[] = [];

        const titleQuery = query(
          productsRef,
          where("searchableTitle", ">=", searchTerm),
          where("searchableTitle", "<=", searchTerm + "\uf8ff"),
          limit(10)
        );

        const titleSnapshot = await getDocs(titleQuery);
        titleSnapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...(doc.data() as object),
          } as ProductData);
        });
        if (results.length > 0) {
          get().addToRecentSearches(searchQuery);
        }

        set({
          searchResults: results,
          loading: false,
          searchQuery: searchQuery,
        });

        return results;
      } catch (error) {
        console.error("Search error:", error);
        set({
          error: "Failed to perform search",
          loading: false,
        });
        return [];
      }
    },

    addToRecentSearches: (query: string) => {
      if (!query.trim()) return;

      set((state) => {
        const trimmedQuery = query.trim();

        const filteredSearches = state.recentSearches.filter(
          (search) => search.toLowerCase() !== trimmedQuery.toLowerCase()
        );

        const newRecentSearches = [trimmedQuery, ...filteredSearches].slice(
          0,
          MAX_RECENT_SEARCHES
        );

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "recentSearches",
            JSON.stringify(newRecentSearches)
          );
        }

        return { recentSearches: newRecentSearches };
      });
    },

    clearRecentSearches: () => {
      set({ recentSearches: [] });
      if (typeof window !== "undefined") {
        localStorage.removeItem("recentSearches");
      }
    },
  };
});

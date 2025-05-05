"use client";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  where,
} from "firebase/firestore";
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
  lastSearch: string;

  pageSearchResults: ProductData[];
  pageSearchLoading: boolean;
  pageSearchError: string | null;
  totalResults: number;
  hasMore: boolean;
  lastVisibleDoc: import("firebase/firestore").DocumentSnapshot | null;
  selectedSort: string;
  selectedCategory: string;
  selectedGender: string;
  availableCategories: string[];
  availableGenders: string[];

  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  performSearch: (query: string) => Promise<ProductData[]>;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchOpen: (isOpen: boolean) => void;
  toggleSearch: () => void;

  performPageSearch: (query: string, reset?: boolean) => Promise<void>;
  loadMoreResults: () => Promise<void>;
  setSortOption: (sort: string) => void;
  setCategory: (category: string) => void;
  setGender: (gender: string) => void;
  clearFilters: () => void;
  fetchFilterOptions: () => Promise<void>;
}

const MAX_RECENT_SEARCHES = 5;
const PRODUCTS_PER_PAGE = 12;

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
    lastSearch: "",

    pageSearchResults: [],
    pageSearchLoading: false,
    pageSearchError: null,
    totalResults: 0,
    hasMore: false,
    lastVisibleDoc: null,
    selectedSort: "relevance",
    selectedCategory: "",
    selectedGender: "",
    availableCategories: [],
    availableGenders: [],

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });

      if (query && query !== get().lastSearch) {
        get().performSearch(query);
      } else if (!query) {
        set({ searchResults: [] });
      }
    },

    clearSearch: () => {
      set({ searchQuery: "", searchResults: [], isSearching: false });
    },

    setSearchOpen: (isOpen: boolean) => {
      set({ isSearchOpen: isOpen });
      if (!isOpen) {
        set({ searchResults: [] });
      }
    },

    toggleSearch: () => {
      const nextState = !get().isSearchOpen;
      set({ isSearchOpen: nextState });

      if (!nextState) {
        set({ searchResults: [], searchQuery: "", lastSearch: "" });
      }
    },

    performSearch: async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        set({ searchResults: [], loading: false, lastSearch: "" });
        return [];
      }

      set({ loading: true, error: null, lastSearch: searchQuery });

      try {
        const searchTerm = searchQuery.toLowerCase();
        const productsRef = collection(fireDB, "products");
        const results: ProductData[] = [];
        const searchedIds = new Set<string>();

        const titleQuery = query(
          productsRef,
          where("searchableTitle", ">=", searchTerm),
          where("searchableTitle", "<=", searchTerm + "\uf8ff"),
          limit(5)
        );

        const titleSnapshot = await getDocs(titleQuery);

        titleSnapshot.forEach((doc) => {
          if (!searchedIds.has(doc.id)) {
            searchedIds.add(doc.id);
            results.push({
              id: doc.id,
              ...(doc.data() as object),
            } as ProductData);
          }
        });

        // Save to recent searches if we found results
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

    performPageSearch: async (searchQuery: string, reset = true) => {
      if (!searchQuery.trim()) {
        set({ pageSearchResults: [], pageSearchLoading: false });
        return;
      }

      if (reset) {
        set({
          pageSearchResults: [],
          pageSearchLoading: true,
          pageSearchError: null,
          lastVisibleDoc: null,
        });
      } else {
        set({ pageSearchLoading: true, pageSearchError: null });
      }

      try {
        const searchTerm = searchQuery.toLowerCase();
        const productsRef = collection(fireDB, "products");

        const { selectedSort, selectedCategory, selectedGender } = get();

        let orderByField = "createdAt";
        let orderDirection: "asc" | "desc" = "desc";

        switch (selectedSort) {
          case "price-low":
            orderByField = "price";
            orderDirection = "asc";
            break;
          case "price-high":
            orderByField = "price";
            orderDirection = "desc";
            break;
          case "newest":
            orderByField = "createdAt";
            orderDirection = "desc";
            break;
        }

        const whereConditions: QueryConstraint[] = [
          where("searchableTitle", ">=", searchTerm),
          where("searchableTitle", "<=", searchTerm + "\uf8ff"),
          orderBy(orderByField, orderDirection),
          ...(get().lastVisibleDoc ? [startAfter(get().lastVisibleDoc)] : []),
          limit(PRODUCTS_PER_PAGE),
        ];

        if (selectedCategory) {
          whereConditions.push(where("category", "==", selectedCategory));
        }
        if (selectedGender) {
          whereConditions.push(where("gender", "==", selectedGender));
        }

        const baseQuery = query(productsRef, ...whereConditions);

        const snapshot = await getDocs(baseQuery);

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        const results: ProductData[] = [];
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...(doc.data() as object),
          } as ProductData);
        });

        set((state) => ({
          pageSearchResults: reset
            ? results
            : [...state.pageSearchResults, ...results],
          pageSearchLoading: false,
          hasMore: results.length === PRODUCTS_PER_PAGE,
          lastVisibleDoc: lastVisible || null,
          totalResults: reset
            ? results.length
            : state.totalResults + results.length,
        }));

        if (reset && results.length > 0) {
          get().addToRecentSearches(searchQuery);
        }
      } catch (error) {
        console.error("Search page error:", error);
        set({
          pageSearchError: "Failed to search products. Please try again.",
          pageSearchLoading: false,
        });
      }
    },

    loadMoreResults: async () => {
      const { searchQuery } = get();
      await get().performPageSearch(searchQuery, false);
    },

    setSortOption: (sort: string) => {
      set({ selectedSort: sort });

      const { searchQuery } = get();
      if (searchQuery) {
        get().performPageSearch(searchQuery);
      }
    },

    setCategory: (category: string) => {
      // Use empty string internally to represent "all categories"
      set({ selectedCategory: category });
      // Re-run search with new category
      const { searchQuery } = get();
      if (searchQuery) {
        get().performPageSearch(searchQuery);
      }
    },

    setGender: (gender: string) => {
      // Use empty string internally to represent "all genders"
      set({ selectedGender: gender });
      // Re-run search with new gender
      const { searchQuery } = get();
      if (searchQuery) {
        get().performPageSearch(searchQuery);
      }
    },

    clearFilters: () => {
      set({
        selectedSort: "relevance",
        selectedCategory: "",
        selectedGender: "",
      });
      const { searchQuery } = get();
      if (searchQuery) {
        get().performPageSearch(searchQuery);
      }
    },

    fetchFilterOptions: async () => {
      try {
        const categoryQuery = query(
          collection(fireDB, "categories"),
          limit(20)
        );
        const categorySnapshot = await getDocs(categoryQuery);
        const categories: string[] = [];

        categorySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.title) categories.push(data.title);
        });

        // Get genders
        const genderQuery = query(collection(fireDB, "genders"), limit(10));
        const genderSnapshot = await getDocs(genderQuery);
        const genders: string[] = [];

        genderSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.title) genders.push(data.title);
        });

        set({
          availableCategories: categories,
          availableGenders: genders,
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    },
  };
});

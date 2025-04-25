"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useRef, useState } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { useOnClickOutside } from "usehooks-ts";

import { useSearchStore } from "@/store/searchStore";

import SearchResults from "./SearchResults";

interface HeaderSearchProps {
  isMobile: boolean;
}

export default function HeaderSearch({ isMobile }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { isSearchOpen, setSearchOpen, setSearchQuery, clearSearch } =
    useSearchStore();

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isSearchOpen]);

  useOnClickOutside(searchRef as RefObject<HTMLElement>, () => {
    if (!isMobile && isSearchOpen) {
      setSearchOpen(false);
    }
  });

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      clearSearch();
    }
  }, [isSearchOpen, clearSearch]);

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClose = () => {
    setSearchOpen(false);
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        {isSearchOpen && (
          <RemoveScroll>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-white dark:bg-gray-900 z-[150] p-4"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          ref={inputRef}
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search for products..."
                          className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        {query && (
                          <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <SearchResults onItemClick={handleClose} />
                </div>
              </div>
            </motion.div>
          </RemoveScroll>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div ref={searchRef} className="relative">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-8 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>

            {query && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-md border shadow-lg z-50 max-h-[70vh] overflow-hidden">
                <SearchResults onItemClick={handleClose} />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

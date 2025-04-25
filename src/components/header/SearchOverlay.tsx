"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RemoveScroll } from "react-remove-scroll";

import { useSearchStore } from "@/store/searchStore";

import SearchResults from "./SearchResults";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function SearchOverlay({
  isOpen,
  onClose,
  isMobile,
}: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSearchQuery } = useSearchStore();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
    }
  }, [query, setSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleClear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleItemClick = () => {
    onClose();
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <RemoveScroll>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white dark:bg-gray-900 z-[200] p-4"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <Search className="h-5 w-5 text-gray-500" />
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mb-4">
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full rounded-lg border border-gray-200 p-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </form>

                <div className="flex-1 overflow-y-auto">
                  <SearchResults onItemClick={handleItemClick} />
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
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 shadow-md z-[160]"
          >
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center"
              >
                <Search className="absolute left-3 text-gray-400 h-5 w-5" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="pl-10 pr-10 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </form>

              <div className="absolute left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 rounded-b-lg mt-2 max-h-[70vh] overflow-y-auto z-10 mx-4">
                <SearchResults onItemClick={handleItemClick} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

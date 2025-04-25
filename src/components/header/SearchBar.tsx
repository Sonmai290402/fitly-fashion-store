"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import { cn } from "@/lib/utils";
import { useSearchStore } from "@/store/searchStore";

interface SearchBarProps {
  className?: string;
  variant?: "header" | "expanded";
  autoFocus?: boolean;
  onClear?: () => void;
}

export default function SearchBar({
  className,
  variant = "header",
  autoFocus = false,
  onClear,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSearchQuery, setIsSearching } = useSearchStore();

  const isExpanded = variant === "expanded";

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (debouncedQuery) {
      setSearchQuery(debouncedQuery);

      if (isExpanded) {
        setIsSearching(true);
      }
    }
  }, [debouncedQuery, isExpanded, setSearchQuery, setIsSearching]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchQuery(query);
    if (!isExpanded) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      setIsSearching(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onClear) onClear();
    if (inputRef.current) inputRef.current.focus();
    setSearchQuery("");
    setIsSearching(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative group",
        isExpanded ? "w-full" : "max-w-md",
        className
      )}
    >
      <div className="relative">
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
            isExpanded ? "h-5 w-5" : "h-4 w-4"
          )}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className={cn(
            "pl-9 pr-8 py-2 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
            "dark:bg-gray-800 dark:border-gray-700 dark:focus:ring-primary/30 dark:text-white",
            isExpanded ? "text-base py-3" : "text-sm"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className={isExpanded ? "h-5 w-5" : "h-4 w-4"} />
          </button>
        )}
      </div>
    </form>
  );
}

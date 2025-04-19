"use client";

import { AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { CategoryData } from "@/types/category.types";

import CategoryDropdown from "./CategoryDropdown";
import CollectionDropdown from "./CollectionDropdown";
import MobileMenu from "./MobileMenu";

const HeaderNav = ({ categories }: { categories: CategoryData[] }) => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<
    "category" | "collection" | null
  >(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(
    (dropdown: "category" | "collection") => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpenDropdown(dropdown);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    cn(
      "relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:bg-black dark:after:bg-white after:transition-all after:duration-300",
      isActive(path) ? "after:w-full" : "after:w-0 hover:after:w-full"
    );

  return (
    <>
      <MobileMenu categories={categories} />

      <nav className="hidden lg:flex flex-1 items-center gap-6">
        <Link href="/" className={navLinkClass("/")}>
          Home
        </Link>
        <Link href="/products" className={navLinkClass("/products")}>
          All Products
        </Link>

        <div
          className={cn(
            "relative",
            pathname.startsWith("/category")
              ? "after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-black dark:after:bg-white"
              : navLinkClass("/category")
          )}
          onMouseEnter={() => handleMouseEnter("category")}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-1 focus:outline-none">
            Category <ChevronDown size={16} />
          </button>
          <AnimatePresence>
            {openDropdown === "category" && (
              <CategoryDropdown isOpen categories={categories} />
            )}
          </AnimatePresence>
        </div>

        <div
          className={cn(
            "relative",
            pathname.startsWith("/collection")
              ? "after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-black dark:after:bg-white"
              : navLinkClass("/collection")
          )}
          onMouseEnter={() => handleMouseEnter("collection")}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-1 focus:outline-none">
            Collection <ChevronDown size={16} />
          </button>
          <AnimatePresence>
            {openDropdown === "collection" && <CollectionDropdown isOpen />}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default HeaderNav;

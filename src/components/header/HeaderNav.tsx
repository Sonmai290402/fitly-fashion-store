"use client";

import { AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useRef, useState } from "react";

import { CategoryData } from "@/types/category.types";

import CategoryDropdown from "./CategoryDropdown";
import CollectionDropdown from "./CollectionDropdown";
import MobileMenu from "./MobileMenu";

const navLinkStyle =
  "relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-black dark:after:bg-white after:transition-all after:duration-300 hover:after:w-full";

const HeaderNav = ({ categories }: { categories: CategoryData[] }) => {
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

  return (
    <>
      <MobileMenu categories={categories} />

      <nav className="hidden lg:flex flex-1 items-center gap-6">
        <Link href="/" className={navLinkStyle}>
          Home
        </Link>
        <Link href="/products" className={navLinkStyle}>
          All Products
        </Link>

        <div
          className={navLinkStyle}
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
          className={navLinkStyle}
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

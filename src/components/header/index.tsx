"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";

import HeaderActions from "./HeaderActions";
import HeaderNav from "./HeaderNav";
import HeaderTop from "./HeaderTop";

const Header = () => {
  const { user } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    if (hasHydrated) {
      fetchCategories();
    }
  }, [fetchCategories, hasHydrated]);
  return (
    <header className="border-b border-gray-200 sticky top-0 z-100 backdrop-blur-sm bg-white/80 dark:bg-gray-900 dark:border-gray-700 transition-all duration-300">
      {!user && <HeaderTop />}

      <div className="mx-5 md:mx-16 py-3 flex items-center">
        <HeaderNav
          categories={categories.filter((category) => category.isActive)}
        />

        <Link href="/" className="flex justify-center flex-shrink-0">
          <span className="font-semibold text-2xl dark:text-white">FITLY</span>
        </Link>
        <HeaderActions />
      </div>
    </header>
  );
};

export default Header;

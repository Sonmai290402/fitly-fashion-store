"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { CategoryData } from "@/types/category.types";

const CategoryDropdown = ({
  isOpen,
  categories,
}: {
  isOpen: boolean;
  categories: CategoryData[];
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-[100] left-0 mt-2 w-40 bg-background border-border shadow-md rounded-lg max-h-[40vh] overflow-y-auto"
        >
          {categories.map((item) => (
            <li key={item.url}>
              <Link
                href={item.url}
                className="block px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
};

export default CategoryDropdown;

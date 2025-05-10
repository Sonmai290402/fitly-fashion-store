"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import { useCollectionStore } from "@/store/collectionStore";

const CollectionDropdown = ({ isOpen }: { isOpen: boolean }) => {
  const { collections, fetchCollections } = useCollectionStore();

  useEffect(() => {
    if (isOpen && collections.length === 0) {
      fetchCollections();
    }
  }, [isOpen, fetchCollections, collections.length]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-100 left-0 mt-2 w-40 bg-background shadow-md rounded-lg max-h-[40vh] overflow-y-auto"
        >
          {collections.map(({ url, title, id }) => (
            <li key={id}>
              <Link
                href={url || "#"}
                className="block px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                {title}
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
};

export default CollectionDropdown;

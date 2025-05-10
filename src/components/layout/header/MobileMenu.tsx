"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCollectionStore } from "@/store/collectionStore";
import { CategoryData } from "@/types/category.types";

type MobileMenuProps = {
  categories: CategoryData[];
};

const MobileMenu = ({ categories }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  const { collections, fetchCollections } = useCollectionStore();

  useEffect(() => {
    if (open) {
      fetchCollections();
    }
  }, [open, fetchCollections]);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className="lg:hidden flex-1">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-black dark:text-white"
            aria-label="Menu"
          >
            <Menu className="size-7" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80%] max-w-xs p-0 z-100">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          <div className="py-4 overflow-y-auto">
            <nav className="space-y-1">
              <Link
                href="/"
                className="block px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleLinkClick}
              >
                All Products
              </Link>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories">
                  <AccordionTrigger className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Categories
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="py-1">
                      {categories.map(({ id, url, title }) => (
                        <Link
                          key={id}
                          href={url}
                          className="block px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={handleLinkClick}
                        >
                          {title}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="collections">
                  <AccordionTrigger className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Collections
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="py-1">
                      {collections
                        .filter((c) => c.isActive)
                        .map((collection) => (
                          <Link
                            key={collection.id}
                            href={
                              collection.url ||
                              `/collections/${collection.slug}`
                            }
                            className="block px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={handleLinkClick}
                          >
                            {collection.title}
                          </Link>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;

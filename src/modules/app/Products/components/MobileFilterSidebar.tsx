"use client";

import { Filter } from "lucide-react";
import React, { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters } from "@/types/product.types";

import FilterBar from "./FilterBar";

type Props = {
  filters: ProductFilters;
};

// Using memo to prevent re-renders when parent components update
const MobileFilterSidebar = memo(({ filters }: Props) => {
  // Use local state to control Sheet open/close state
  const [open, setOpen] = useState(false);

  // Function to close the filter sheet without causing parent re-renders
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden flex items-center text-sm font-medium px-4 py-2 border rounded-full"
        >
          <Filter className="size-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[85%] max-w-sm overflow-auto z-[150]"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="text-left">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <FilterBar
            initialFilters={filters}
            isMobile={true}
            closeMobileFilters={handleClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
});

// Add display name for React DevTools
MobileFilterSidebar.displayName = "MobileFilterSidebar";

export default MobileFilterSidebar;

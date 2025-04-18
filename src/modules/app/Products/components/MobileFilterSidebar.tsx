"use client";

import { Filter } from "lucide-react";
import React from "react";

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

const MobileFilterSidebar = ({ filters }: Props) => {
  return (
    <Sheet>
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
      <SheetContent side="left" className="w-[85%] max-w-sm p-0 overflow-auto">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <FilterBar initialFilters={filters} isMobile={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSidebar;

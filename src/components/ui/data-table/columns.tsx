"use client";

import type { Column } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function createSortableHeader<T extends Record<string, unknown>>(
  id: string,
  label: string
): ColumnDef<T>["header"] {
  const SortableHeader = ({ column }: { column: Column<T, unknown> }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  // Fix the display name
  SortableHeader.displayName = `SortableHeader_${id}`;

  return SortableHeader;
}

export function createSelectionColumn<T extends Record<string, unknown>>(
  customSelectRowFn?: (row: T) => boolean
): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      if (customSelectRowFn && !customSelectRowFn(row.original)) {
        return null;
      }
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  };
}

export function createActionsColumn<T extends Record<string, unknown>>(
  actions: (row: T) => React.ReactNode[]
): ColumnDef<T> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const actionItems = actions(row.original);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actionItems.map((item, index) => (
              <React.Fragment key={index}>
                {item}
                {index < actionItems.length - 1 && <DropdownMenuSeparator />}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

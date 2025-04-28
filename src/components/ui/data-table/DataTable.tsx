"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  selectedItems?: number;
  onClearSelection?: () => void;
  selectionActions?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  enablePagination?: boolean;
  pageSize?: number;
  manualSorting?: boolean;
  initialSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  itemsCount?: number;
  renderTopToolbar?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  selectedItems = 0,
  onClearSelection,
  selectionActions,
  emptyMessage = "No data found",
  enablePagination = true,
  pageSize = 10,
  manualSorting = false,
  initialSorting = [],
  onSortingChange,
  itemsCount,
  renderTopToolbar,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [localRowSelection, setLocalRowSelection] = useState(rowSelection);

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;
    setSorting(newSorting);
    if (manualSorting && onSortingChange) {
      onSortingChange(newSorting);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updatedSelection) => {
      const selection =
        typeof updatedSelection === "function"
          ? updatedSelection(localRowSelection)
          : updatedSelection;

      setLocalRowSelection(selection);
      if (onRowSelectionChange) {
        onRowSelectionChange(selection);
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: onRowSelectionChange ? rowSelection : localRowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    enableRowSelection,
    enableMultiRowSelection: enableRowSelection,
  });

  return (
    <div className="space-y-4">
      {selectedItems > 0 && (
        <div className="bg-primary/5 rounded-lg mb-4 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {selectedItems} selected
            </Badge>
            {onClearSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 px-2 text-sm"
              >
                <X className="mr-1 h-4 w-4" />
                Clear selection
              </Button>
            )}
          </div>
          {selectionActions}
        </div>
      )}

      <div className="rounded-md border bg-white dark:bg-gray-950">
        {renderTopToolbar}

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {searchKey && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={
                    (table.getColumn(searchKey)?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(searchKey)
                      ?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm pl-8 border-none shadow-none focus-visible:ring-0"
                />
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onClick={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                    >
                      <span className="mr-2">
                        {column.getIsVisible() ? "✓" : ""}
                      </span>
                      {column.id}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
                    </div>
                  ) : (
                    emptyMessage
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {enablePagination && table.getRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between space-x-2 p-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              <span>
                Showing {table.getRowModel().rows.length} of{" "}
                {itemsCount || data.length} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

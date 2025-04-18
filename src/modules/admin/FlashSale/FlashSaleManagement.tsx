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
  ArrowUpDown,
  Calendar,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlashSaleStore } from "@/store/flashSaleStore";
import { FlashSaleData } from "@/types/flashsale.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

import FlashSaleFormModal from "./FlashSaleFormModal";

export default function FlashSaleManagement() {
  const {
    flashSales,
    loading,
    fetchFlashSales,
    deleteFlashSale,
    bulkDeleteFlashSales,
  } = useFlashSaleStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteFlashSaleId, setDeleteFlashSaleId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);
  const [editingFlashSale, setEditingFlashSale] =
    useState<FlashSaleData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFlashSales();
  }, [fetchFlashSales]);

  const isFlashSaleActive = (sale: FlashSaleData): boolean => {
    const now = new Date();
    const startDate = new Date(sale.startDate);
    const endDate = new Date(sale.endDate);

    return sale.isActive && now >= startDate && now <= endDate;
  };

  const columns: ColumnDef<FlashSaleData>[] = [
    {
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
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "bannerImage",
      header: "Banner",
      cell: ({ row }) => {
        const imageUrl = row.getValue("bannerImage") as string;

        return (
          <div className="relative size-12 rounded-md overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={row.getValue("title")}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                No Banner
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Flash Sale Name
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => {
        const flashSale = row.original;
        return (
          <div className="flex items-center">
            <Tag className="mr-2 h-4 w-4" />
            <span>
              {flashSale.discountType === "percentage"
                ? `${flashSale.discountValue}%`
                : formatCurrency(flashSale.discountValue)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const flashSale = row.original;
        const startDate = new Date(flashSale.startDate);
        const endDate = new Date(flashSale.endDate);
        const now = new Date();

        const isActive = isFlashSaleActive(flashSale);
        const timeRemaining = isActive ? endDate.getTime() - now.getTime() : 0;
        const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor(
          (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        return (
          <div className="space-y-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start: {startDate.toLocaleString()}</p>
                  <p>End: {endDate.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isActive && (
              <div className="flex items-center text-xs text-green-600">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {daysRemaining > 0 ? `${daysRemaining}d ` : ""}
                  {hoursRemaining}h remaining
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "productIds",
      header: "Products",
      cell: ({ row }) => {
        const productIds = (row.getValue("productIds") as string[]) || [];
        return <div>{productIds.length} products</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const flashSale = row.original;
        const now = new Date();
        const startDate = new Date(flashSale.startDate);
        const endDate = new Date(flashSale.endDate);

        let status: string;
        let variant: "default" | "outline" | "secondary" | "destructive";
        let icon: React.ReactNode;

        if (!flashSale.isActive) {
          status = "Inactive";
          variant = "secondary";
          icon = <EyeOff className="mr-1 h-3 w-3 text-gray-500" />;
        } else if (now < startDate) {
          status = "Scheduled";
          variant = "outline";
          icon = <Calendar className="mr-1 h-3 w-3 text-amber-500" />;
        } else if (now > endDate) {
          status = "Expired";
          variant = "destructive";
          icon = <X className="mr-1 h-3 w-3" />;
        } else {
          status = "Active";
          variant = "default";
          icon = <Eye className="mr-1 h-3 w-3" />;
        }

        return (
          <Badge variant={variant}>
            <div className="flex items-center">
              {icon}
              {status}
            </div>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const flashSale = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditFlashSale(flashSale)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setDeleteFlashSaleId(flashSale.id as string);
                  setIsDeleteDialogOpen(true);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: flashSales,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedFlashSaleIds = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected())
    .map((row) => row.original.id as string)
    .filter(Boolean);

  const handleAddFlashSale = () => {
    setEditingFlashSale(null);
    setIsFlashSaleModalOpen(true);
  };

  const handleEditFlashSale = (flashSale: FlashSaleData) => {
    setEditingFlashSale(flashSale);
    setIsFlashSaleModalOpen(true);
  };

  const handleDeleteFlashSale = async () => {
    if (!deleteFlashSaleId) return;
    setIsDeleting(true);
    try {
      await deleteFlashSale(deleteFlashSaleId);
    } catch (error) {
      console.error("Error deleting flash sale:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteFlashSaleId(null);
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteFlashSales = async () => {
    if (selectedFlashSaleIds.length === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteFlashSales(selectedFlashSaleIds);
      setRowSelection({});
    } catch (error) {
      console.error("Error bulk deleting flash sales:", error);
    } finally {
      setIsBulkDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Flash Sales</h1>
        <Button onClick={handleAddFlashSale}>
          <Plus className="mr-2 h-4 w-4" /> Create Flash Sale
        </Button>
      </div>

      {/* Bulk action bar - show when items are selected */}
      {selectedFlashSaleIds.length > 0 && (
        <div className="bg-primary/5 rounded-lg mb-4 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {selectedFlashSaleIds.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              className="h-8 px-2 text-sm"
            >
              <X className="mr-1 size-4" />
              Clear selection
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsBulkDeleteDialogOpen(true)}
            className="h-8 px-3"
            disabled={isDeleting}
          >
            <Trash2 className="mr-1 size-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-white">
        <div className="flex items-center gap-2 p-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search flash sale by name..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm border-none shadow-none focus-visible:ring-0"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 size-4" />
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
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                    "No flash sales found"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between space-x-2 p-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedFlashSaleIds.length > 0 ? (
              <span>
                Selected <strong>{selectedFlashSaleIds.length}</strong> of{" "}
                {table.getFilteredRowModel().rows.length} flash sales
              </span>
            ) : (
              <span>
                Showing {table.getRowModel().rows.length} of {flashSales.length}{" "}
                flash sales
              </span>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Flash Sale Form Modal will be implemented next */}
      {isFlashSaleModalOpen && (
        <FlashSaleFormModal
          open={isFlashSaleModalOpen}
          onOpenChange={(open) => {
            setIsFlashSaleModalOpen(open);
            if (!open) setEditingFlashSale(null);
          }}
          flashSale={editingFlashSale}
        />
      )}

      {/* Single Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              flash sale, but won&apos;t affect the products included in it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteFlashSale}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setIsBulkDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple flash sales?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete {selectedFlashSaleIds.length} flash
              sales. This action cannot be undone. Products included in these
              sales won&apos;t be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBulkDeleteFlashSales}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedFlashSaleIds.length} Flash Sales`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

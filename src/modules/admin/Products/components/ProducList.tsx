"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  createActionsColumn,
  createSelectionColumn,
  createSortableHeader,
} from "@/components/ui/data-table/columns";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useProductStore } from "@/store/productStore";
import { ProductData } from "@/types/product.types";
import { formatCurrency } from "@/utils/formatCurrency";

import ProductFormModal from "./ProductFormModal";

export default function ProductList() {
  const {
    products,
    loading,
    fetchProducts,
    deleteProduct,
    bulkDeleteProducts,
  } = useProductStore();

  const [editingProduct, setEditingProduct] = useState<ProductData | null>(
    null
  );
  const [rowSelection, setRowSelection] = useState({});
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Selection column with checkbox
  const selectionColumn = createSelectionColumn<ProductData>();

  // Define columns
  const columns: ColumnDef<ProductData>[] = [
    selectionColumn,
    {
      accessorKey: "title",
      header: createSortableHeader("title", "Product"),
      cell: ({ row }) => {
        const product = row.original;
        const imageUrl =
          typeof product.image === "string"
            ? product.image
            : product.colors?.[0]?.images?.[0]?.url || "/placeholder-image.png";

        return (
          <div className="flex items-center gap-2 max-w-[500px]">
            <div className="relative size-12 rounded-md overflow-hidden">
              <Image
                src={imageUrl}
                alt={product.title || "Product Image"}
                fill
                className="object-cover"
              />
            </div>
            <div className="font-medium truncate">{product.title}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: createSortableHeader("price", "Price"),
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="flex items-center gap-2">
            {product.sale_price ? (
              <div className="flex flex-col gap-1">
                <span className="font-medium ">
                  {formatCurrency(product.sale_price)}
                </span>
                <span className="text-gray-500 text-sm line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="font-medium">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <div>{row.original.gender}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.original.category}</div>,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const totalStock = row.original.totalStock || 0;
        return (
          <Badge variant={totalStock > 10 ? "outline" : "destructive"}>
            {totalStock}
          </Badge>
        );
      },
    },
  ];

  const handleOpenEditModal = (product: ProductData) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleOpenDeleteDialog = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  // Actions column with edit and delete
  const actionsColumn = createActionsColumn<ProductData>((product) => [
    <DropdownMenuItem key="edit" onClick={() => handleOpenEditModal(product)}>
      <Pencil className="mr-2 size-4" />
      Edit
    </DropdownMenuItem>,
    <DropdownMenuItem
      key="delete"
      onClick={() => handleOpenDeleteDialog(product.id as string)}
      className="text-red-600 focus:text-red-600"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>,
  ]);

  const allColumns = [...columns, actionsColumn];

  const selectedProductIds = Object.keys(rowSelection)
    .map((index) => {
      const productIndex = parseInt(index);
      return products[productIndex] ? products[productIndex].id : null;
    })
    .filter((id): id is string => id !== null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProduct(deleteProductId);
    } catch (error) {
      console.log("handleDeleteProduct ~ error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (selectedProductIds.length === 0) return;
      await bulkDeleteProducts(selectedProductIds);
      setRowSelection({});
    } catch (error) {
      console.log("handleBulkDelete ~ error:", error);
    } finally {
      setIsBulkDeleteDialogOpen(false);
    }
  };

  const bulkDeleteButton = (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setIsBulkDeleteDialogOpen(true)}
      className="h-8 px-3"
    >
      <Trash2 className="mr-1 size-4" />
      Delete Selected
    </Button>
  );

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" /> Create New Product
        </Button>
      </div>

      <DataTable
        columns={allColumns}
        data={products}
        loading={loading}
        searchKey="title"
        searchPlaceholder="Search product by name..."
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        selectedItems={selectedProductIds.length}
        onClearSelection={() => setRowSelection({})}
        selectionActions={bulkDeleteButton}
        enablePagination
        pageSize={10}
        itemsCount={products.length}
      />

      <ProductFormModal
        open={isProductModalOpen}
        onOpenChange={(open) => {
          setIsProductModalOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteProduct}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple products?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete {selectedProductIds.length} products.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBulkDelete}
            >
              Delete {selectedProductIds.length} Products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

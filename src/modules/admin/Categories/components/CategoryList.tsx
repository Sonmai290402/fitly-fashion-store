"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useCategoryStore } from "@/store/categoryStore";
import { useGenderStore } from "@/store/genderStore";
import { CategoryData } from "@/types/category.types";

import CategoryFormModal from "./CategoryFormModal";

export default function CategoryManagement() {
  const { genders, fetchGenders } = useGenderStore();
  const {
    categories,
    loading,
    fetchCategories,
    deleteCategory,
    bulkDeleteCategories,
  } = useCategoryStore();

  const [rowSelection, setRowSelection] = useState({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null
  );
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const selectedCategoryIds = Object.keys(rowSelection)
    .map((index) => {
      const categoryIndex = parseInt(index);
      return categories[categoryIndex] ? categories[categoryIndex].id : null;
    })
    .filter((id): id is string => id !== null);

  useEffect(() => {
    fetchCategories();
    fetchGenders();
  }, [fetchCategories, fetchGenders]);

  const selectionColumn = createSelectionColumn<CategoryData>();

  const columns: ColumnDef<CategoryData>[] = [
    selectionColumn,
    {
      accessorKey: "title",
      header: createSortableHeader("title", "Category"),
      cell: ({ row }) => {
        const imageUrl = row.original.image;
        const title = row.original.title;

        return (
          <div className="flex items-center gap-2">
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
                  No Image
                </div>
              )}
            </div>
            <span className="font-medium">{title}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "genderId",
      header: createSortableHeader("genderId", "Gender"),
      cell: ({ row }) => {
        const genderId = row.getValue("genderId") as string;
        const gender = genders.find((g) => g.id === genderId);

        return (
          <div>
            {gender ? (
              <Badge variant="outline" className="font-normal">
                {gender.title}
              </Badge>
            ) : (
              <span className="text-gray-400 text-sm">Unknown</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;

        return (
          <Badge variant={isActive ? "outline" : "secondary"}>
            {isActive ? (
              <div className="flex items-center">
                <Eye className="mr-1 h-3 w-3 text-green-500" />
                Active
              </div>
            ) : (
              <div className="flex items-center">
                <EyeOff className="mr-1 h-3 w-3 text-gray-500" />
                Inactive
              </div>
            )}
          </Badge>
        );
      },
    },
  ];

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: CategoryData) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    try {
      await deleteCategory(deleteCategoryId);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteCategoryId(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (selectedCategoryIds.length === 0) return;
      await bulkDeleteCategories(selectedCategoryIds);
      setRowSelection({});
    } catch (error) {
      console.error("Error bulk deleting categories:", error);
    } finally {
      setIsBulkDeleteDialogOpen(false);
    }
  };

  const actionsColumn = createActionsColumn<CategoryData>((category) => [
    <DropdownMenuItem key="edit" onClick={() => handleEditCategory(category)}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>,
    <DropdownMenuItem
      key="delete"
      onClick={() => {
        setDeleteCategoryId(category.id as string);
        setIsDeleteDialogOpen(true);
      }}
      className="text-red-600 focus:text-red-600"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>,
  ]);

  const allColumns = [...columns, actionsColumn];

  const handleClearSelection = () => setRowSelection({});

  const bulkDeleteButton = (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setIsBulkDeleteDialogOpen(true)}
      className="h-8 px-3"
    >
      <Trash2 className="mr-1 h-4 w-4" />
      Delete Selected
    </Button>
  );

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <DataTable
        columns={allColumns}
        data={categories}
        loading={loading}
        searchKey="title"
        searchPlaceholder="Search by title..."
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        selectedItems={selectedCategoryIds.length}
        onClearSelection={handleClearSelection}
        selectionActions={bulkDeleteButton}
      />

      <CategoryFormModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        category={editingCategory}
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
              selected category and may affect products associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCategory}
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
            <AlertDialogTitle>Delete multiple categories?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete {selectedCategoryIds.length}{" "}
              categories. This action cannot be undone and may affect products
              associated with these categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBulkDelete}
            >
              Delete {selectedCategoryIds.length} Categories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

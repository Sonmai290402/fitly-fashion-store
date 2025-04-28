"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useCollectionStore } from "@/store/collectionStore";
import { CollectionData } from "@/types/collection.types";

import CollectionFormModal from "./CollectionFormModal";

export default function CollectionManagement() {
  const {
    collections,
    loading,
    fetchCollections,
    deleteCollection,
    bulkDeleteCollections,
  } = useCollectionStore();

  const [rowSelection, setRowSelection] = useState({});
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const selectedCollectionIds = Object.keys(rowSelection)
    .map((index) => {
      const collectionIndex = parseInt(index);
      return collections[collectionIndex]
        ? collections[collectionIndex].id
        : null;
    })
    .filter((id): id is string => id !== null);

  // Define columns
  const selectionColumn = createSelectionColumn<CollectionData>();

  const columns: ColumnDef<CollectionData>[] = [
    selectionColumn,
    {
      accessorKey: "title",
      header: createSortableHeader("title", "Collection"),
      cell: ({ row }) => {
        const imageUrl = row.original.image as string;
        const title = row.original.title;

        return (
          <div className="flex flex-col gap-2">
            <div className="relative aspect-[21/9] w-[150px] rounded-md overflow-hidden">
              <Image src={imageUrl} alt={title} fill className="object-cover" />
            </div>
            <div className="font-medium">{title}</div>
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

  const handleAddCollection = () => {
    setEditingCollection(null);
    setIsCollectionModalOpen(true);
  };

  const handleEditCollection = (collection: CollectionData) => {
    setEditingCollection(collection);
    setIsCollectionModalOpen(true);
  };

  const handleDeleteCollection = async () => {
    if (!deleteCollectionId) return;
    setIsDeleting(true);
    try {
      await deleteCollection(deleteCollectionId);
    } catch (error) {
      console.error("Error deleting collection:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteCollectionId(null);
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteCollections = async () => {
    if (selectedCollectionIds.length === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteCollections(selectedCollectionIds);
      setRowSelection({});
    } catch (error) {
      console.error("Error bulk deleting collections:", error);
    } finally {
      setIsBulkDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };

  // Actions column
  const actionsColumn = createActionsColumn<CollectionData>((collection) => [
    <DropdownMenuItem
      key="edit"
      onClick={() => handleEditCollection(collection)}
    >
      <Pencil className="mr-2 size-4" />
      Edit
    </DropdownMenuItem>,
    <DropdownMenuItem
      key="delete"
      onClick={() => {
        setDeleteCollectionId(collection.id as string);
        setIsDeleteDialogOpen(true);
      }}
      className="text-red-600 focus:text-red-600"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>,
  ]);

  const allColumns = [...columns, actionsColumn];

  const bulkDeleteButton = (
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
  );

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button onClick={handleAddCollection}>
          <Plus className="mr-2 h-4 w-4" /> Create Collection
        </Button>
      </div>

      <DataTable
        columns={allColumns}
        data={collections}
        loading={loading}
        searchKey="title"
        searchPlaceholder="Search collection by name..."
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        selectedItems={selectedCollectionIds.length}
        onClearSelection={() => setRowSelection({})}
        selectionActions={bulkDeleteButton}
      />

      <CollectionFormModal
        open={isCollectionModalOpen}
        onOpenChange={(open) => {
          setIsCollectionModalOpen(open);
          if (!open) setEditingCollection(null);
        }}
        collection={editingCollection}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              collection, but won&apos;t delete the products inside it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCollection}
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

      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setIsBulkDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple collections?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete {selectedCollectionIds.length}{" "}
              collections. This action cannot be undone. Products in these
              collections won&apos;t be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBulkDeleteCollections}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedCollectionIds.length} Collections`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

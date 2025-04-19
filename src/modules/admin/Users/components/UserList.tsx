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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { UserData } from "@/types/user.types";

const UserList = () => {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    loading,
    fetchUsers,
    deleteUser,
    bulkDeleteUsers,
    updateUserRole,
    updateUser,
  } = useUserStore();

  const [editingRoleUserId, setEditingRoleUserId] = useState<string>("");

  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editedUserData, setEditedUserData] = useState<Partial<UserData>>({});
  const [editingUserRole, setEditingUserRole] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (editingUser) {
      setEditedUserData({
        username: editingUser.username,
        email: editingUser.email,
      });
    }
  }, [editingUser]);

  const handleSaveUserEdit = async () => {
    if (!editingUser?.uid) return;

    try {
      await updateUser(editingUser.uid, editedUserData);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    setEditingRoleUserId(userId);
    setEditingUserRole(role);
    setIsChangeRoleDialogOpen(true);
  };

  const handleSaveRoleChange = async () => {
    await updateUserRole(editingRoleUserId, editingUserRole);
    setEditingRoleUserId("");
    setEditingUserRole("");
    setIsChangeRoleDialogOpen(false);
  };

  const columns: ColumnDef<UserData>[] = [
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
      accessorKey: "username",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Image
              src={user.avatar || "/images/default-avatar.png"}
              alt={user.username || "User avatar"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="font-medium">{user.username}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "uid",
      header: "ID",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-gray-500 text-sm truncate max-w-[150px]">
            {user.uid}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const user = row.original;
        return <div className="text-gray-700">{user.email}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return <div className="text-gray-500">{user.createdAt}</div>;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        const userId = user.uid as string;

        const canEditRole =
          currentUser?.role === "admin" && currentUser.uid !== userId;

        return (
          <>
            {canEditRole ? (
              <Select
                value={user.role}
                onValueChange={(value) => handleChangeRole(userId, value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
            )}
          </>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = currentUser?.uid === user.uid;
        const canEdit = currentUser?.role === "admin" || isCurrentUser;
        const canDelete = currentUser?.role === "admin" && !isCurrentUser;

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
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                  <Pencil className="mr-2 size-4" />
                  Edit User
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setDeleteUserId(user.uid as string);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users || [],
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

  const selectedUserIds = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected())
    .map((row) => row.original.uid as string)
    .filter(Boolean);

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser(deleteUserId);
    } catch (error) {
      console.log("handleDeleteUser ~ error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteUserId(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (selectedUserIds.length === 0) return;
      await bulkDeleteUsers(selectedUserIds);
      setRowSelection({});
    } catch (error) {
      console.error("Error deleting users:", error);
    } finally {
      setIsBulkDeleteDialogOpen(false);
    }
  };

  // Can only delete users if current user is an admin
  const canBulkDelete =
    currentUser?.role === "admin" && selectedUserIds.length > 0;

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">Users</h1>
      {selectedUserIds.length > 0 && (
        <div className="bg-primary/5 rounded-lg mb-4 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {selectedUserIds.length} selected
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
          {canBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="h-8 px-3"
            >
              <Trash2 className="mr-1 size-4" />
              Delete Selected
            </Button>
          )}
        </div>
      )}
      <div className="rounded-md border bg-white shadow">
        <div className="flex items-center gap-2 p-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search user by username..."
            value={
              (table.getColumn("username")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("username")?.setFilterValue(event.target.value)
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
                    "No users found"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {table.getRowModel().rows.length > 0 && (
          <div className="flex items-center justify-end space-x-2 p-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} user(s) total
            </div>
            <div className="space-x-2">
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

      <AlertDialog
        open={isChangeRoleDialogOpen}
        onOpenChange={setIsChangeRoleDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the role of this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary hover:bg-primary/80"
              onClick={handleSaveRoleChange}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected user from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteUser}
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
            <AlertDialogTitle>Delete multiple users?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete {selectedUserIds.length} users. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBulkDelete}
            >
              Delete {selectedUserIds.length} Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information below. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={editedUserData.username || ""}
                onChange={(e) =>
                  setEditedUserData({
                    ...editedUserData,
                    username: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editedUserData.email || ""}
                onChange={(e) =>
                  setEditedUserData({
                    ...editedUserData,
                    email: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveUserEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserList;

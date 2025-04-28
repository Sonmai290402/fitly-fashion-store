"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    try {
      await updateUserRole(editingRoleUserId, editingUserRole);
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setEditingRoleUserId("");
      setEditingUserRole("");
      setIsChangeRoleDialogOpen(false);
    }
  };

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

  // Custom row selection function to prevent selecting current user
  const customSelectRowFn = (user: UserData) => {
    return currentUser?.uid !== user.uid;
  };

  const selectionColumn = createSelectionColumn<UserData>(customSelectRowFn);

  const columns: ColumnDef<UserData>[] = [
    selectionColumn,
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
      header: createSortableHeader("createdAt", "Created At"),
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
  ];

  // Create actions column
  const actionsColumn = createActionsColumn<UserData>((user) => {
    const isCurrentUser = currentUser?.uid === user.uid;
    const canEdit = currentUser?.role === "admin" || isCurrentUser;
    const canDelete = currentUser?.role === "admin" && !isCurrentUser;

    const actions = [];

    if (canEdit) {
      actions.push(
        <DropdownMenuItem key="edit" onClick={() => setEditingUser(user)}>
          <Pencil className="mr-2 size-4" />
          Edit
        </DropdownMenuItem>
      );
    }

    if (canDelete) {
      actions.push(
        <DropdownMenuItem
          key="delete"
          onClick={() => {
            setDeleteUserId(user.uid as string);
            setIsDeleteDialogOpen(true);
          }}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      );
    }

    return actions;
  });

  const allColumns = [...columns, actionsColumn];

  const selectedUserIds = Object.keys(rowSelection)
    .map((index) => {
      const userIndex = parseInt(index);
      return users[userIndex] ? users[userIndex].uid : null;
    })
    .filter((id): id is string => id !== null);

  const canBulkDelete =
    currentUser?.role === "admin" && selectedUserIds.length > 0;

  const bulkDeleteButton = canBulkDelete ? (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setIsBulkDeleteDialogOpen(true)}
      className="h-8 px-3"
    >
      <Trash2 className="mr-1 size-4" />
      Delete Selected
    </Button>
  ) : null;

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">Users</h1>

      <DataTable
        columns={allColumns}
        data={users || []}
        loading={loading}
        searchKey="username"
        searchPlaceholder="Search user by username..."
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        selectedItems={selectedUserIds.length}
        onClearSelection={() => setRowSelection({})}
        selectionActions={bulkDeleteButton}
      />

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

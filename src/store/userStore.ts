import axios from "axios";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { UserData } from "@/types/user.types";
import { formatDateTime } from "@/utils/formatDateTime";

import { isUsernameTaken } from "./authStore";

type UserState = {
  users: UserData[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<UserData[] | null>;
  getUserById: (id: string) => Promise<UserData | null>;
  deleteUser: (id: string) => Promise<void>;
  bulkDeleteUsers: (ids: string[]) => Promise<void>;
  updateUserRole: (id: string, role: string) => Promise<void>;
  updateUser: (
    id: string,
    data: Partial<UserData>,
    currentUsername?: string
  ) => Promise<boolean>;
};

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const userRef = collection(fireDB, "users");
      const userSnapshot = await getDocs(userRef);
      const users = userSnapshot.docs.map((doc) => {
        return {
          ...doc.data(),
          uid: doc.id,
          createdAt: formatDateTime(doc.data().createdAt),
        };
      }) as UserData[];
      set({ users, loading: false, error: null });
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  getUserById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const userRef = collection(fireDB, "users");
      const userSnapshot = await getDocs(userRef);
      const user = userSnapshot.docs
        .map((doc) => {
          return {
            ...doc.data(),
            uid: doc.id,
          };
        })
        .find((user) => user.uid === id) as UserData;
      set({ loading: false, error: null });
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  deleteUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`/api/users/${id}`);

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to delete user");
      }

      set((state) => ({
        users: state.users.filter((u) => u.uid !== id),
        loading: false,
        error: null,
      }));

      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      set({ error: (error as Error).message, loading: false });
      toast.error(`Failed to delete user: ${(error as Error).message}`);
    }
  },

  bulkDeleteUsers: async (userIds: string[]) => {
    set({ loading: true, error: null });
    try {
      const deletePromises = userIds.map(async (id) => {
        const response = await axios.delete(`/api/users/${id}`);

        if (response.status !== 200) {
          const errorData = response.data;
          throw new Error(errorData.error || `Failed to delete user ${id}`);
        }
      });

      await Promise.all(deletePromises);

      set((state) => ({
        users: state.users.filter(
          (user) => !userIds.includes(user.uid as string)
        ),
        loading: false,
      }));

      toast.success("Users deleted successfully!");
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      set({ error: (error as Error).message, loading: false });
      toast.error(`Failed to delete users: ${(error as Error).message}`);
    }
  },

  updateUserRole: async (id: string, role: string) => {
    set({ loading: true, error: null });
    try {
      // Only allow "admin" or "user" roles
      if (role !== "admin" && role !== "user") {
        throw new Error("Invalid role. Role must be either 'admin' or 'user'");
      }

      const response = await axios.put(`/api/users/${id}`, { role });

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to update user role");
      }

      set((state) => ({
        users: state.users.map((user) =>
          user.uid === id ? { ...user, role } : user
        ),
        loading: false,
        error: null,
      }));

      toast.success(`User role updated to ${role} successfully!`);
    } catch (error) {
      console.error("Error updating user role:", error);
      set({ error: (error as Error).message, loading: false });
      toast.error(`Failed to update user role: ${(error as Error).message}`);
    }
  },

  updateUser: async (
    id: string,
    data: Partial<UserData>,
    currentUsername?: string
  ): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      if (typeof data.username === "string" && data.username.trim() !== "") {
        const usernameExists = await isUsernameTaken(
          data.username,
          currentUsername
        );
        if (usernameExists) {
          toast.error("Username already taken. Please choose another one.");
          set({ loading: false });
          return false;
        }
      }

      const { ...safeUpdateData } = data;

      const updateData = {
        ...safeUpdateData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(fireDB, "users", id), updateData);

      set((state) => ({
        users: state.users.map((user) =>
          user.uid === id ? { ...user, ...updateData } : user
        ),
        loading: false,
        error: null,
      }));

      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      set({ error: (error as Error).message, loading: false });
      toast.error(`Failed to update user: ${(error as Error).message}`);
      return false;
    }
  },
}));

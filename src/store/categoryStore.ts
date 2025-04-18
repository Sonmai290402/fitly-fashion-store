import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { CategoryData } from "@/types/category.types";
import { handleFirebaseError } from "@/utils/configFirebaseError";

type CategoryState = {
  categories: CategoryData[];
  loading: boolean;
  error: string | null;

  fetchCategories: (genderId?: string) => Promise<CategoryData[]>;
  getCategoryById: (id: string) => Promise<CategoryData | null>;
  createCategory: (
    categoryData: Omit<CategoryData, "id">
  ) => Promise<CategoryData | false>;
  updateCategory: (
    id: string,
    categoryData: Partial<CategoryData>
  ) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  bulkDeleteCategories: (categoryIds: string[]) => Promise<boolean>;
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (genderId?: string) => {
    set({ loading: true, error: null });

    try {
      const categoriesRef = collection(fireDB, "categories");
      let q;

      if (genderId) {
        q = query(
          categoriesRef,
          where("genderId", "==", genderId),
          where("isActive", "==", true)
        );
      } else {
        q = query(categoriesRef);
      }

      const querySnapshot = await getDocs(q);

      const categories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as CategoryData),
        createdAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          doc.data().createdAt,
      })) as CategoryData[];

      set({ categories, loading: false, error: null });
      return categories;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return [];
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const categoryRef = doc(fireDB, "categories", id);
      const categorySnap = await getDoc(categoryRef);

      if (categorySnap.exists()) {
        return {
          id: categorySnap.id,
          ...(categorySnap.data() as CategoryData),
          createdAt:
            categorySnap.data().createdAt?.toDate?.()?.toISOString() ||
            categorySnap.data().createdAt,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching category:", error);
      return null;
    }
  },

  createCategory: async (categoryData: Omit<CategoryData, "id">) => {
    set({ loading: true, error: null });
    try {
      const categoryRef = collection(fireDB, "categories");
      const nameQuery = query(
        categoryRef,
        where("title", "==", categoryData.title),
        where("genderId", "==", categoryData.genderId)
      );
      const nameQuerySnapshot = await getDocs(nameQuery);

      if (!nameQuerySnapshot.empty) {
        set({ loading: false });
        toast.error("A category with this name already exists for this gender");
        return false;
      }

      if (categoryData.url) {
        const urlQuery = query(
          categoryRef,
          where("url", "==", categoryData.url),
          where("genderId", "==", categoryData.genderId)
        );
        const urlQuerySnapshot = await getDocs(urlQuery);

        if (!urlQuerySnapshot.empty) {
          set({ loading: false });
          toast.error(
            "A category with this url already exists for this gender"
          );
          return false;
        }
      }

      const newCategory = {
        ...categoryData,
        isActive: categoryData.isActive ?? true,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(categoryRef, newCategory);

      const addedCategory = {
        ...newCategory,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        categories: [...state.categories, addedCategory],
        loading: false,
        error: null,
      }));

      toast.success("Category added successfully");

      return addedCategory;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  updateCategory: async (id: string, categoryData: Partial<CategoryData>) => {
    set({ loading: true, error: null });
    try {
      if (categoryData.title || categoryData.url) {
        const existingCategory = await get().getCategoryById(id);
        if (!existingCategory) {
          throw new Error("Category not found");
        }

        const categoryRef = collection(fireDB, "categories");

        if (
          categoryData.title &&
          categoryData.title !== existingCategory.title
        ) {
          const nameQuery = query(
            categoryRef,
            where("title", "==", categoryData.title),
            where(
              "genderId",
              "==",
              categoryData.genderId || existingCategory.genderId
            ),
            where("__name__", "!=", id)
          );
          const nameSnapshot = await getDocs(nameQuery);

          if (!nameSnapshot.empty) {
            set({ loading: false });
            toast.error(
              "A category with this name already exists for this gender"
            );
            return false;
          }
        }

        if (categoryData.url && categoryData.url !== existingCategory.url) {
          const urlQuery = query(
            categoryRef,
            where("url", "==", categoryData.url),
            where(
              "genderId",
              "==",
              categoryData.genderId || existingCategory.genderId
            ),
            where("__name__", "!=", id)
          );
          const urlSnapshot = await getDocs(urlQuery);

          if (!urlSnapshot.empty) {
            set({ loading: false });
            toast.error(
              "A category with this url already exists for this gender"
            );
            return false;
          }
        }
      }

      const categoryRef = doc(fireDB, "categories", id);

      const updateData = {
        ...categoryData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(categoryRef, updateData);

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, ...categoryData } : category
        ),
        loading: false,
        error: null,
      }));

      toast.success("Category updated successfully");

      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  deleteCategory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const categoryRef = doc(fireDB, "categories", id);
      await deleteDoc(categoryRef);

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        loading: false,
        error: null,
      }));

      toast.success("Category deleted successfully");

      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  bulkDeleteCategories: async (categoryIds: string[]) => {
    set({ loading: true, error: null });

    try {
      const deletePromises = categoryIds.map((id) => {
        const categoryRef = doc(fireDB, "categories", id);
        return deleteDoc(categoryRef);
      });

      await Promise.all(deletePromises);

      set((state) => ({
        categories: state.categories.filter(
          (category) => !categoryIds.includes(category.id as string)
        ),
        loading: false,
      }));

      toast.success(`${categoryIds.length} categories deleted successfully`);

      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete categories",
        loading: false,
      });

      toast.error("Failed to delete categories");

      return false;
    }
  },
}));

import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  Query,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { ProductData, ProductFilters } from "@/types/product.types";
import { handleFirebaseError } from "@/utils/configFirebaseError";

type ProductState = {
  products: Array<ProductData & { id?: string }>;
  loading: boolean;
  error: string | null;
  createProduct: (productData: ProductData) => Promise<boolean>;
  fetchProducts: (filters?: ProductFilters) => Promise<boolean>;
  fetchProductById: (id: string) => Promise<ProductData | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateProduct: (
    productId: string,
    productData: ProductData
  ) => Promise<boolean>;
  bulkDeleteProducts: (productIds: string[]) => Promise<void>;
};

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,
  createProduct: async (productData: ProductData) => {
    set({ loading: true, error: null });
    try {
      const productRef = collection(fireDB, "products");
      const q = query(
        productRef,
        where("title", "==", productData.title),
        where("category", "==", productData.category),
        where("gender", "==", productData.gender)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        set({ loading: false });
        toast.error("Product already exists!");
        return false;
      }
      const newProduct = {
        ...productData,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleString("vi-VN", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };

      const docRef = await addDoc(productRef, newProduct);

      set((state) => ({
        products: [
          ...state.products,
          { ...newProduct, id: docRef.id, createdAt: new Date().toISOString() },
        ],
        loading: false,
        error: null,
      }));

      toast.success("Product added successfully!");
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  fetchProducts: async (filters: ProductFilters = {}) => {
    set({ loading: true, error: null });

    try {
      const productRef = collection(fireDB, "products");

      let q: Query = query(productRef);

      if (filters.gender) {
        q = query(q, where("gender", "==", filters.gender));
      }

      if (filters.category) {
        q = query(q, where("category", "==", filters.category));
      }

      const querySnapshot = await getDocs(q);

      let products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as ProductData),
        createdAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          doc.data().createdAt,
      })) as (ProductData & { id: string })[];

      if (filters.color) {
        products = products.filter((product) =>
          product.colors?.some(
            (color) => color.name.toLowerCase() === filters.color?.toLowerCase()
          )
        );
      }

      if (filters.size) {
        products = products.filter((product) =>
          product.colors?.some((color) =>
            color.sizes?.some(
              (size) => size.name.toLowerCase() === filters.size?.toLowerCase()
            )
          )
        );
      }

      if (filters.minPrice !== undefined) {
        const minPrice = Number(filters.minPrice);
        products = products.filter((product) => product.price >= minPrice);
      }
      if (filters.maxPrice !== undefined) {
        const maxPrice = Number(filters.maxPrice);
        products = products.filter((product) => product.price <= maxPrice);
      }

      if (filters.sort) {
        switch (filters.sort) {
          case "price-asc":
            products = products.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case "price-desc":
            products = products.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case "newest":
            products = products.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            break;
        }
      } else {
        products = products.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }

      set({ products, loading: false, error: null });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      toast.error((error as Error).message);
      return false;
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(fireDB, "products", id);
      const productDoc = await getDoc(docRef);

      if (!productDoc.exists()) {
        return null;
      }
      set({ loading: false, error: null });
      return { id: productDoc.id, ...productDoc.data() } as ProductData;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      console.error("Error fetching product details:", error);
      return null;
    }
  },

  deleteProduct: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const productRef = doc(fireDB, "products", productId);
      await deleteDoc(productRef);

      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
        loading: false,
        error: null,
      }));

      toast.success("Product deleted successfully!");
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  updateProduct: async (productId: string, productData: ProductData) => {
    set({ loading: true, error: null });
    try {
      const productRef = doc(fireDB, "products", productId);

      const updatedProduct = {
        ...productData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(productRef, updatedProduct);

      set((state) => ({
        products: state.products.map((product) =>
          product.id === productId
            ? {
                ...updatedProduct,
                id: productId,
                updatedAt: new Date().toISOString(),
              }
            : product
        ),
        loading: false,
        error: null,
      }));

      toast.success("Product updated successfully!");
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  bulkDeleteProducts: async (productIds: string[]) => {
    set({ loading: true, error: null });

    try {
      const deletePromises = productIds.map((id) => {
        const productRef = doc(fireDB, "products", id);
        return deleteDoc(productRef);
      });

      await Promise.all(deletePromises);

      set((state) => ({
        products: state.products.filter(
          (product) => !productIds.includes(product.id as string)
        ),
        loading: false,
      }));
      toast.success("Products deleted successfully!");
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      set({
        loading: false,
        error: (error as Error).message,
      });
      throw error;
    }
  },
}));

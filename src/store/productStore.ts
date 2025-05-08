import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import {
  PaginationState,
  ProductData,
  ProductFilters,
} from "@/types/product.types";
import { handleFirebaseError } from "@/utils/configFirebaseError";

type ProductState = {
  products: Array<ProductData & { id?: string }>;
  productsToDisplay: Array<ProductData & { id?: string }>;
  allPageProducts: Array<ProductData & { id?: string }>;

  loading: boolean;
  isLazyLoading: boolean;
  error: string | null;

  pagination: PaginationState;
  hasMore: boolean;
  lastDocument: QueryDocumentSnapshot<DocumentData> | null;

  setPagination: (pagination: Partial<PaginationState>) => void;
  resetPagination: () => void;
  setCurrentPage: (page: number) => void;

  setLazyLoading: (loading: boolean) => void;
  loadMoreProducts: () => void;
  resetLazyLoading: () => void;

  createProduct: (productData: ProductData) => Promise<string | boolean>;
  fetchProducts: (
    filters?: ProductFilters,
    resetPagination?: boolean
  ) => Promise<boolean>;
  fetchProductsForPage: (
    filters?: ProductFilters,
    page?: number
  ) => Promise<boolean>;
  fetchMoreProducts: (filters?: ProductFilters) => Promise<boolean>;
  fetchProductById: (id: string) => Promise<ProductData | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateProduct: (
    productId: string,
    productData: ProductData
  ) => Promise<boolean>;
  bulkDeleteProducts: (productIds: string[]) => Promise<void>;
};

const initialPaginationState: PaginationState = {
  currentPage: 1,
  pageSize: 12,
  totalItems: 0,
  totalPages: 0,
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  productsToDisplay: [],
  allPageProducts: [],
  loading: false,
  isLazyLoading: false,
  error: null,
  pagination: { ...initialPaginationState },
  hasMore: true,
  lastDocument: null,

  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    }));
  },

  resetPagination: () => {
    set({
      pagination: { ...initialPaginationState },
      lastDocument: null,
      hasMore: true,
      productsToDisplay: [],
      allPageProducts: [],
    });
  },

  setCurrentPage: (page) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        page,
      },
    }));

    get().resetLazyLoading();
  },

  setLazyLoading: (loading) => {
    set({ isLazyLoading: loading });
  },

  loadMoreProducts: () => {
    set((state) => {
      if (state.productsToDisplay.length >= state.allPageProducts.length) {
        return state;
      }

      const nextBatch = state.allPageProducts.slice(
        state.productsToDisplay.length,
        state.productsToDisplay.length + 4
      );

      return {
        productsToDisplay: [...state.productsToDisplay, ...nextBatch],
        isLazyLoading: false,
      };
    });
  },

  resetLazyLoading: () => {
    const { allPageProducts } = get();
    set({
      productsToDisplay: allPageProducts.slice(0, 4),
      isLazyLoading: false,
    });
  },

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
        searchableTitle: productData.title.toLowerCase().trim(),
        date: new Date().toLocaleString("vi-VN", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };

      const docRef = await addDoc(productRef, newProduct);
      const createdProduct = {
        ...newProduct,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const newTotalItems = state.pagination.totalItems + 1;
        const newTotalPages = Math.ceil(
          newTotalItems / state.pagination.pageSize
        );

        return {
          products: [createdProduct, ...state.products],
          loading: false,
          error: null,
          pagination: {
            ...state.pagination,
            totalItems: newTotalItems,
            totalPages: newTotalPages,
          },
        };
      });

      toast.success("Product added successfully!");
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  fetchProducts: async (
    filters: ProductFilters = {},
    resetPagination = true
  ) => {
    set((state) => ({
      loading: true,
      error: null,
      ...(resetPagination
        ? {
            lastDocument: null,
            hasMore: true,
            pagination: {
              ...state.pagination,
              page: 1,
            },
          }
        : {}),
    }));

    try {
      const productRef = collection(fireDB, "products");
      const pageSize = get().pagination.pageSize;

      let baseQuery: Query = query(productRef);

      if (filters.gender) {
        baseQuery = query(baseQuery, where("gender", "==", filters.gender));
      }

      if (filters.category) {
        baseQuery = query(baseQuery, where("category", "==", filters.category));
      }

      const countSnapshot = await getDocs(baseQuery);
      const totalItems = countSnapshot.size;

      let sortField = "createdAt";
      let sortDirection: "desc" | "asc" = "desc";

      if (filters.sort && filters.sort === "newest") {
        sortField = "createdAt";
        sortDirection = "desc";
      }

      const paginatedQuery = query(
        baseQuery,
        orderBy(sortField, sortDirection),
        limit(pageSize)
      );

      const snapshot = await getDocs(paginatedQuery);

      let products = snapshot.docs.map((doc) => {
        const data = doc.data() as ProductData;

        const effectivePrice =
          data.sale_price && data.sale_price > 0
            ? data.sale_price
            : data.price || 0;

        return {
          id: doc.id,
          ...data,
          effectivePrice,
          createdAt: data.createdAt,
        };
      }) as (ProductData & { id: string; effectivePrice: number })[];

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

      if (filters.sort) {
        switch (filters.sort) {
          case "price-asc":
            products = products.sort(
              (a, b) => a.effectivePrice - b.effectivePrice
            );
            break;
          case "price-desc":
            products = products.sort(
              (a, b) => b.effectivePrice - a.effectivePrice
            );
            break;
        }
      }

      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const hasMore = snapshot.docs.length === pageSize;
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      set({
        products,
        allPageProducts: products,
        productsToDisplay: products.slice(0, 4),
        loading: false,
        error: null,
        lastDocument: lastDoc,
        hasMore,
        pagination: {
          ...get().pagination,
          totalItems,
          totalPages,
        },
      });

      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      toast.error((error as Error).message);
      return false;
    }
  },

  fetchProductsForPage: async (filters: ProductFilters = {}, page = 1) => {
    set({ loading: true, error: null });

    try {
      const productRef = collection(fireDB, "products");
      const pageSize = get().pagination.pageSize;

      let baseQuery = query(productRef);

      if (filters.gender) {
        baseQuery = query(baseQuery, where("gender", "==", filters.gender));
      }

      if (filters.category) {
        baseQuery = query(baseQuery, where("category", "==", filters.category));
      }

      let sortField = "createdAt";
      let sortDirection: "desc" | "asc" = "desc";

      if (filters.sort && filters.sort === "newest") {
        sortField = "createdAt";
        sortDirection = "desc";
      }

      const allProductsQuery = query(
        baseQuery,
        orderBy(sortField, sortDirection)
      );

      const allDocsSnapshot = await getDocs(allProductsQuery);
      const allProducts = allDocsSnapshot.docs.map((doc) => {
        const data = doc.data() as ProductData;

        const effectivePrice =
          data.sale_price && data.sale_price > 0
            ? data.sale_price
            : data.price || 0;

        return {
          id: doc.id,
          ...data,
          effectivePrice,
          createdAt: data.createdAt,
        };
      }) as (ProductData & { id: string; effectivePrice: number })[];

      let filteredProducts = allProducts;

      if (filters.color) {
        filteredProducts = filteredProducts.filter((product) =>
          product.colors?.some(
            (color) => color.name.toLowerCase() === filters.color?.toLowerCase()
          )
        );
      }

      if (filters.size) {
        filteredProducts = filteredProducts.filter((product) =>
          product.colors?.some((color) =>
            color.sizes?.some(
              (size) => size.name.toLowerCase() === filters.size?.toLowerCase()
            )
          )
        );
      }

      if (filters.sort) {
        switch (filters.sort) {
          case "price-asc":
            filteredProducts = filteredProducts.sort(
              (a, b) => a.effectivePrice - b.effectivePrice
            );
            break;
          case "price-desc":
            filteredProducts = filteredProducts.sort(
              (a, b) => b.effectivePrice - a.effectivePrice
            );
            break;
        }
      }

      const skip = (page - 1) * pageSize;
      const paginatedProducts = filteredProducts.slice(skip, skip + pageSize);

      set({
        products: filteredProducts,
        allPageProducts: paginatedProducts,
        productsToDisplay: paginatedProducts.slice(0, 4),
        loading: false,
        error: null,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: filteredProducts.length,
          totalPages: Math.max(
            1,
            Math.ceil(filteredProducts.length / pageSize)
          ),
        },
      });

      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error("Error fetching products for page:", error);
      return false;
    }
  },

  fetchMoreProducts: async (filters: ProductFilters = {}) => {
    const { lastDocument, hasMore, loading, pagination } = get();

    if (loading || !hasMore || !lastDocument) {
      return false;
    }

    set({ loading: true });

    try {
      const productRef = collection(fireDB, "products");
      const pageSize = pagination.pageSize;

      let baseQuery: Query = query(productRef);

      if (filters.gender) {
        baseQuery = query(baseQuery, where("gender", "==", filters.gender));
      }

      if (filters.category) {
        baseQuery = query(baseQuery, where("category", "==", filters.category));
      }

      let sortField = "createdAt";
      let sortDirection: "desc" | "asc" = "desc";

      if (filters.sort && filters.sort === "newest") {
        sortField = "createdAt";
        sortDirection = "desc";
      }

      const paginatedQuery = query(
        baseQuery,
        orderBy(sortField, sortDirection),
        startAfter(lastDocument),
        limit(pageSize)
      );

      const snapshot = await getDocs(paginatedQuery);

      let newProducts = snapshot.docs.map((doc) => {
        const data = doc.data() as ProductData;

        const effectivePrice =
          data.sale_price && data.sale_price > 0
            ? data.sale_price
            : data.price || 0;

        return {
          id: doc.id,
          ...data,
          effectivePrice,
          createdAt: data.createdAt,
        };
      }) as (ProductData & { id: string; effectivePrice: number })[];

      if (filters.color) {
        newProducts = newProducts.filter((product) =>
          product.colors?.some(
            (color) => color.name.toLowerCase() === filters.color?.toLowerCase()
          )
        );
      }

      if (filters.size) {
        newProducts = newProducts.filter((product) =>
          product.colors?.some((color) =>
            color.sizes?.some(
              (size) => size.name.toLowerCase() === filters.size?.toLowerCase()
            )
          )
        );
      }

      if (filters.sort) {
        switch (filters.sort) {
          case "price-asc":
            newProducts = newProducts.sort(
              (a, b) => a.effectivePrice - b.effectivePrice
            );
            break;
          case "price-desc":
            newProducts = newProducts.sort(
              (a, b) => b.effectivePrice - a.effectivePrice
            );
            break;
        }
      }

      const hasMoreProducts = snapshot.docs.length === pageSize;
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      set((state) => ({
        products: [...state.products, ...newProducts],
        allPageProducts: [...state.allPageProducts, ...newProducts],
        productsToDisplay: [
          ...state.productsToDisplay,
          ...newProducts.slice(0, 4),
        ],
        loading: false,
        lastDocument: lastDoc,
        hasMore: hasMoreProducts,
        pagination: {
          ...state.pagination,
          page: state.pagination.currentPage + 1,
        },
      }));

      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error("Error fetching more products:", error);
      return false;
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(fireDB, "products", id);
      const productDoc = await getDoc(docRef);

      if (!productDoc.exists()) {
        set({ loading: false });
        return null;
      }

      const productData = {
        id: productDoc.id,
        ...productDoc.data(),
        createdAt:
          productDoc.data()?.createdAt?.toDate?.()?.toISOString() ||
          productDoc.data()?.createdAt,
      } as ProductData;

      set({ loading: false, error: null });
      return productData;
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

      set((state) => {
        const updatedProducts = state.products.filter(
          (p) => p.id !== productId
        );
        const updatedAllPageProducts = state.allPageProducts.filter(
          (p) => p.id !== productId
        );
        const updatedProductsToDisplay = state.productsToDisplay.filter(
          (p) => p.id !== productId
        );

        const totalItems = updatedProducts.length;
        const totalPages = Math.max(
          1,
          Math.ceil(totalItems / state.pagination.pageSize)
        );

        return {
          products: updatedProducts,
          allPageProducts: updatedAllPageProducts,
          productsToDisplay: updatedProductsToDisplay,
          pagination: {
            ...state.pagination,
            totalItems,
            totalPages,
          },
          loading: false,
          error: null,
        };
      });

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

      const finalProduct = {
        ...updatedProduct,
        id: productId,
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        products: state.products.map((product) =>
          product.id === productId ? finalProduct : product
        ),
        allPageProducts: state.allPageProducts.map((product) =>
          product.id === productId ? finalProduct : product
        ),
        productsToDisplay: state.productsToDisplay.map((product) =>
          product.id === productId ? finalProduct : product
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

      set((state) => {
        const updatedProducts = state.products.filter(
          (product) => !productIds.includes(product.id as string)
        );
        const updatedAllPageProducts = state.allPageProducts.filter(
          (product) => !productIds.includes(product.id as string)
        );
        const updatedProductsToDisplay = state.productsToDisplay.filter(
          (product) => !productIds.includes(product.id as string)
        );

        const totalItems = updatedProducts.length;
        const totalPages = Math.max(
          1,
          Math.ceil(totalItems / state.pagination.pageSize)
        );

        return {
          products: updatedProducts,
          allPageProducts: updatedAllPageProducts,
          productsToDisplay: updatedProductsToDisplay,
          pagination: {
            ...state.pagination,
            totalItems,
            totalPages,
          },
          loading: false,
        };
      });

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

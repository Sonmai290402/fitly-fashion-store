import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FieldValue,
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
import { FlashSaleData } from "@/types/flashsale.types";
import { handleFirebaseError } from "@/utils/configFirebaseError";

interface FlashSaleState {
  flashSales: FlashSaleData[];
  loading: boolean;
  error: string | null;
  fetchFlashSales: () => Promise<boolean>;
  getFlashSale: (id: string) => Promise<FlashSaleData | null>;
  getActiveFlashSales: () => FlashSaleData[];
  createFlashSale: (
    flashSale: Partial<FlashSaleData>
  ) => Promise<string | null>;
  updateFlashSale: (
    id: string,
    data: Partial<FlashSaleData>
  ) => Promise<boolean>;
  deleteFlashSale: (id: string) => Promise<boolean>;
  bulkDeleteFlashSales: (ids: string[]) => Promise<boolean>;
  addProductToFlashSale: (
    flashSaleId: string,
    productId: string
  ) => Promise<boolean>;
  removeProductFromFlashSale: (
    flashSaleId: string,
    productId: string
  ) => Promise<boolean>;
  bulkAddProductsToFlashSale: (
    flashSaleId: string,
    productIds: string[]
  ) => Promise<boolean>;
}

export const useFlashSaleStore = create<FlashSaleState>((set, get) => ({
  flashSales: [],
  loading: false,
  error: null,

  fetchFlashSales: async () => {
    set({ loading: true, error: null });
    try {
      const flashSalesRef = collection(fireDB, "flashSales");
      const querySnapshot = await getDocs(flashSalesRef);

      const flashSales = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          doc.data().createdAt,
        updatedAt:
          doc.data().updatedAt?.toDate?.()?.toISOString() ||
          doc.data().updatedAt,
        startDate:
          doc.data().startDate?.toDate?.()?.toISOString() ||
          doc.data().startDate,
        endDate:
          doc.data().endDate?.toDate?.()?.toISOString() || doc.data().endDate,
      })) as FlashSaleData[];

      set({ flashSales, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  getFlashSale: async (id: string) => {
    try {
      const docRef = doc(fireDB, "flashSales", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt:
            data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          startDate:
            data.startDate?.toDate?.()?.toISOString() || data.startDate,
          endDate: data.endDate?.toDate?.()?.toISOString() || data.endDate,
        } as FlashSaleData;
      }
      return null;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return null;
    }
  },

  getActiveFlashSales: () => {
    // Current time to check active status
    const now = new Date().toISOString();

    return get()
      .flashSales.filter(
        (sale) => sale.isActive && sale.startDate <= now && sale.endDate >= now
      )
      .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999));
  },

  createFlashSale: async (flashSaleData: Partial<FlashSaleData>) => {
    set({ loading: true, error: null });
    try {
      const flashSalesRef = collection(fireDB, "flashSales");

      // Check if flash sale with same slug exists
      if (flashSaleData.slug) {
        const q = query(flashSalesRef, where("slug", "==", flashSaleData.slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          set({ loading: false });
          toast.error("Flash sale with this slug already exists!");
          return null;
        }
      }

      // Convert string dates to Firebase timestamps
      const startDate = flashSaleData.startDate
        ? new Date(flashSaleData.startDate)
        : new Date();
      const endDate = flashSaleData.endDate
        ? new Date(flashSaleData.endDate)
        : new Date();

      const newFlashSale = {
        ...flashSaleData,
        productIds: flashSaleData.productIds || [],
        isActive:
          flashSaleData.isActive !== undefined ? flashSaleData.isActive : true,
        startDate,
        endDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(flashSalesRef, newFlashSale);

      const createdFlashSale = {
        ...newFlashSale,
        id: docRef.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        flashSales: [...state.flashSales, createdFlashSale as FlashSaleData],
        loading: false,
      }));

      toast.success("Flash sale created successfully!");
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return null;
    }
  },

  updateFlashSale: async (id: string, data: Partial<FlashSaleData>) => {
    set({ loading: true, error: null });
    try {
      const flashSaleRef = doc(fireDB, "flashSales", id);

      // Check if slug exists (if changing)
      if (data.slug) {
        const flashSalesRef = collection(fireDB, "flashSales");
        const q = query(flashSalesRef, where("slug", "==", data.slug));
        const querySnapshot = await getDocs(q);

        // If found and it's not the current document
        if (!querySnapshot.empty && querySnapshot.docs[0].id !== id) {
          set({ loading: false });
          toast.error("Flash sale with this slug already exists!");
          return false;
        }
      }

      // Convert string dates to Firebase timestamps if present
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }

      if (data.endDate) {
        updateData.endDate = new Date(data.endDate);
      }

      await updateDoc(
        flashSaleRef,
        updateData as { [x: string]: FieldValue | Partial<unknown> | undefined }
      );

      // Update in-memory state
      set((state) => ({
        flashSales: state.flashSales.map((sale) =>
          sale.id === id
            ? {
                ...sale,
                ...data,
                updatedAt: new Date().toISOString(),
                // Keep ISO format for dates in in-memory state
                startDate: data.startDate || sale.startDate,
                endDate: data.endDate || sale.endDate,
              }
            : sale
        ),
        loading: false,
      }));

      toast.success("Flash sale updated successfully!");
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  deleteFlashSale: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(fireDB, "flashSales", id));

      set((state) => ({
        flashSales: state.flashSales.filter((sale) => sale.id !== id),
        loading: false,
      }));

      toast.success("Flash sale deleted successfully!");
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  bulkDeleteFlashSales: async (ids: string[]) => {
    set({ loading: true, error: null });
    try {
      await Promise.all(
        ids.map((id) => deleteDoc(doc(fireDB, "flashSales", id)))
      );

      set((state) => ({
        flashSales: state.flashSales.filter(
          (sale) => !ids.includes(sale.id as string)
        ),
        loading: false,
      }));

      toast.success(`${ids.length} flash sales deleted successfully!`);
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  addProductToFlashSale: async (flashSaleId: string, productId: string) => {
    try {
      const flashSaleRef = doc(fireDB, "flashSales", flashSaleId);
      const flashSaleSnap = await getDoc(flashSaleRef);

      if (!flashSaleSnap.exists()) {
        toast.error("Flash sale not found!");
        return false;
      }

      const data = flashSaleSnap.data();
      const productIds = data.productIds || [];

      if (productIds.includes(productId)) {
        // Already in flash sale
        return true;
      }

      await updateDoc(flashSaleRef, {
        productIds: [...productIds, productId],
        updatedAt: serverTimestamp(),
      });

      set((state) => ({
        flashSales: state.flashSales.map((sale) =>
          sale.id === flashSaleId
            ? {
                ...sale,
                productIds: [...(sale.productIds || []), productId],
                updatedAt: new Date().toISOString(),
              }
            : sale
        ),
      }));

      toast.success("Product added to flash sale!");
      return true;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  removeProductFromFlashSale: async (
    flashSaleId: string,
    productId: string
  ) => {
    try {
      const flashSaleRef = doc(fireDB, "flashSales", flashSaleId);
      const flashSaleSnap = await getDoc(flashSaleRef);

      if (!flashSaleSnap.exists()) {
        toast.error("Flash sale not found!");
        return false;
      }

      const data = flashSaleSnap.data();
      const productIds = data.productIds || [];

      if (!productIds.includes(productId)) {
        // Not in flash sale
        return true;
      }

      await updateDoc(flashSaleRef, {
        productIds: productIds.filter((id: string) => id !== productId),
        updatedAt: serverTimestamp(),
      });

      set((state) => ({
        flashSales: state.flashSales.map((sale) =>
          sale.id === flashSaleId
            ? {
                ...sale,
                productIds: (sale.productIds || []).filter(
                  (id) => id !== productId
                ),
                updatedAt: new Date().toISOString(),
              }
            : sale
        ),
      }));

      toast.success("Product removed from flash sale!");
      return true;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  bulkAddProductsToFlashSale: async (
    flashSaleId: string,
    productIds: string[]
  ) => {
    try {
      const flashSaleRef = doc(fireDB, "flashSales", flashSaleId);
      const flashSaleSnap = await getDoc(flashSaleRef);

      if (!flashSaleSnap.exists()) {
        toast.error("Flash sale not found!");
        return false;
      }

      const data = flashSaleSnap.data();
      const existingProductIds = data.productIds || [];

      // Filter out duplicates
      const newProductIds = productIds.filter(
        (id) => !existingProductIds.includes(id)
      );

      if (newProductIds.length === 0) {
        toast.error("No new products to add");
        return true;
      }

      const updatedProductIds = [...existingProductIds, ...newProductIds];

      await updateDoc(flashSaleRef, {
        productIds: updatedProductIds,
        updatedAt: serverTimestamp(),
      });

      set((state) => ({
        flashSales: state.flashSales.map((sale) =>
          sale.id === flashSaleId
            ? {
                ...sale,
                productIds: updatedProductIds,
                updatedAt: new Date().toISOString(),
              }
            : sale
        ),
      }));

      toast.success(`${newProductIds.length} products added to flash sale!`);
      return true;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },
}));

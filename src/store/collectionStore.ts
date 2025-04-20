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
import { CollectionData } from "@/types/collection.types";
import { ProductData } from "@/types/product.types";
import { handleFirebaseError } from "@/utils/configFirebaseError";

type CollectionState = {
  collections: CollectionData[];
  activeCollection: CollectionData | null;
  getActiveCollections: () => CollectionData[];
  setActiveCollection: (collection: CollectionData | null) => void;
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<boolean>;
  getCollection: (id: string) => Promise<CollectionData | null>;
  getCollectionBySlug: (slug: string) => Promise<CollectionData | null>;
  getProductsByCollection: (
    collectionIdOrSlug: string
  ) => Promise<ProductData[]>;
  createCollection: (
    collection: Partial<CollectionData>
  ) => Promise<string | null>;
  updateCollection: (
    id: string,
    data: Partial<CollectionData>
  ) => Promise<boolean>;
  deleteCollection: (id: string) => Promise<boolean>;
  addProductToCollection: (
    collectionId: string,
    productId: string
  ) => Promise<boolean>;
  removeProductFromCollection: (
    collectionId: string,
    productId: string
  ) => Promise<boolean>;
  bulkAddProductsToCollection: (
    collectionId: string,
    productIds: string[]
  ) => Promise<boolean>;

  bulkDeleteCollections: (ids: string[]) => Promise<boolean>;
};

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  activeCollection: null,
  loading: false,
  error: null,

  getActiveCollections: () => {
    return get().collections.filter((collection) => collection.isActive);
  },

  setActiveCollection: (collection) => {
    set({ activeCollection: collection });
  },

  fetchCollections: async () => {
    set({ loading: true, error: null });
    try {
      const collectionsRef = collection(fireDB, "collections");
      const querySnapshot = await getDocs(collectionsRef);

      const collections = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          doc.data().createdAt,
        updatedAt:
          doc.data().updatedAt?.toDate?.()?.toISOString() ||
          doc.data().updatedAt,
      })) as CollectionData[];

      set({ collections, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  getCollection: async (id: string) => {
    try {
      const docRef = doc(fireDB, "collections", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt:
            docSnap.data().createdAt?.toDate?.()?.toISOString() ||
            docSnap.data().createdAt,
          updatedAt:
            docSnap.data().updatedAt?.toDate?.()?.toISOString() ||
            docSnap.data().updatedAt,
        } as CollectionData;
      }
      return null;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return null;
    }
  },

  createCollection: async (collectionData: Partial<CollectionData>) => {
    set({ loading: true, error: null });
    try {
      const collectionsRef = collection(fireDB, "collections");

      if (collectionData.slug) {
        const q = query(
          collectionsRef,
          where("slug", "==", collectionData.slug)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          set({ loading: false });
          toast.error("Collection with this slug already exists!");
          return null;
        }
      }

      const newCollection = {
        ...collectionData,
        productIds: collectionData.productIds || [],
        isActive:
          collectionData.isActive !== undefined
            ? collectionData.isActive
            : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collectionsRef, newCollection);

      const createdCollection = {
        ...newCollection,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        collections: [
          ...state.collections,
          createdCollection as CollectionData,
        ],
        loading: false,
      }));

      toast.success("Collection created successfully!");
      return docRef.id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return null;
    }
  },

  updateCollection: async (id: string, data: Partial<CollectionData>) => {
    set({ loading: true, error: null });
    try {
      const collectionRef = doc(fireDB, "collections", id);

      if (data.slug) {
        const collectionsRef = collection(fireDB, "collections");
        const q = query(collectionsRef, where("slug", "==", data.slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty && querySnapshot.docs[0].id !== id) {
          set({ loading: false });
          toast.error("Collection with this slug already exists!");
          return false;
        }
      }

      await updateDoc(collectionRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === id
            ? { ...collection, ...data, updatedAt: new Date().toISOString() }
            : collection
        ),
        loading: false,
      }));

      toast.success("Collection updated successfully!");
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  deleteCollection: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(fireDB, "collections", id));

      set((state) => ({
        collections: state.collections.filter(
          (collection) => collection.id !== id
        ),
        loading: false,
      }));

      toast.success("Collection deleted successfully!");
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  addProductToCollection: async (collectionId: string, productId: string) => {
    try {
      const collectionRef = doc(fireDB, "collections", collectionId);
      const collectionSnap = await getDoc(collectionRef);

      if (!collectionSnap.exists()) {
        toast.error("Collection not found!");
        return false;
      }

      const data = collectionSnap.data();
      const productIds = data.productIds || [];

      if (productIds.includes(productId)) {
        return true;
      }

      await updateDoc(collectionRef, {
        productIds: [...productIds, productId],
        updatedAt: serverTimestamp(),
      });

      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                productIds: [...(collection.productIds || []), productId],
                updatedAt: new Date().toISOString(),
              }
            : collection
        ),
      }));

      toast.success("Product added to collection!");
      return true;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  removeProductFromCollection: async (
    collectionId: string,
    productId: string
  ) => {
    try {
      const collectionRef = doc(fireDB, "collections", collectionId);
      const collectionSnap = await getDoc(collectionRef);

      if (!collectionSnap.exists()) {
        toast.error("Collection not found!");
        return false;
      }

      const data = collectionSnap.data();
      const productIds = data.productIds || [];

      if (!productIds.includes(productId)) {
        return true;
      }

      await updateDoc(collectionRef, {
        productIds: productIds.filter((id: string) => id !== productId),
        updatedAt: serverTimestamp(),
      });

      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                productIds: (collection.productIds || []).filter(
                  (id) => id !== productId
                ),
                updatedAt: new Date().toISOString(),
              }
            : collection
        ),
      }));

      toast.success("Product removed from collection!");
      return true;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  bulkAddProductsToCollection: async (
    collectionId: string,
    productIds: string[]
  ) => {
    try {
      const collectionRef = doc(fireDB, "collections", collectionId);
      const collectionSnap = await getDoc(collectionRef);

      if (!collectionSnap.exists()) {
        toast.error("Collection not found!");
        return false;
      }

      const data = collectionSnap.data();
      const existingProductIds = data.productIds || [];

      const newProductIds = productIds.filter(
        (id) => !existingProductIds.includes(id)
      );

      if (newProductIds.length === 0) {
        toast.error("No new products to add");
        return true;
      }

      const updatedProductIds = [...existingProductIds, ...newProductIds];

      await updateDoc(collectionRef, {
        productIds: updatedProductIds,
        updatedAt: serverTimestamp(),
      });

      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                productIds: updatedProductIds,
                updatedAt: new Date().toISOString(),
              }
            : collection
        ),
      }));

      toast.success(`${newProductIds.length} products added to collection!`);
      return true;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },

  bulkDeleteCollections: async (ids: string[]) => {
    set({ loading: true, error: null });
    try {
      await Promise.all(
        ids.map((id) => deleteDoc(doc(fireDB, "collections", id)))
      );

      set((state) => ({
        collections: state.collections.filter(
          (collection) => !ids.includes(collection.id as string)
        ),
        loading: false,
      }));

      toast.success(`${ids.length} collections deleted successfully!`);
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },
  getCollectionBySlug: async (slug: string) => {
    try {
      const collectionsRef = collection(fireDB, "collections");
      const q = query(collectionsRef, where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const collectionData = {
          id: querySnapshot.docs[0].id,
          ...docData,
          createdAt:
            docData.createdAt?.toDate?.()?.toISOString() || docData.createdAt,
          updatedAt:
            docData.updatedAt?.toDate?.()?.toISOString() || docData.updatedAt,
        } as CollectionData;

        set({ activeCollection: collectionData });
        return collectionData;
      }
      return null;
    } catch (error) {
      handleFirebaseError(error as FirebaseError);
      return null;
    }
  },

  getProductsByCollection: async (collectionIdOrSlug: string) => {
    set({ loading: true });

    try {
      let collectionData = await get().getCollection(collectionIdOrSlug);

      if (!collectionData) {
        collectionData = await get().getCollectionBySlug(collectionIdOrSlug);
      }

      if (
        !collectionData ||
        !collectionData.productIds ||
        collectionData.productIds.length === 0
      ) {
        set({ loading: false });
        return [];
      }

      const productsRef = collection(fireDB, "products");

      const productDocs = await Promise.all(
        collectionData.productIds.map((productId) =>
          getDoc(doc(productsRef, productId))
        )
      );

      const products: ProductData[] = productDocs
        .filter((docSnap) => docSnap.exists())
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ProductData[];

      set({ loading: false });
      return products;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      return [];
    }
  },
}));

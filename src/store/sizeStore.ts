import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { SizeData } from "@/types/size.types";

type SizeState = {
  sizes: SizeData[];
  loading: boolean;
  error: Error | string | null;
  fetchSizes: () => Promise<void>;
};

export const useSizeStore = create<SizeState>((set) => ({
  sizes: [],
  loading: false,
  error: null,

  fetchSizes: async () => {
    set({ loading: true, error: null });
    try {
      const sizesRef = collection(fireDB, "sizes");
      const querySnapshot = await getDocs(sizesRef);
      const sizes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as SizeData),
      })) as SizeData[];

      const sortedSizes = sizes.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 9999;
        const orderB = b.order !== undefined ? b.order : 9999;
        return orderA - orderB;
      });

      set({ sizes: sortedSizes, loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error : String(error),
      });
    }
  },
}));

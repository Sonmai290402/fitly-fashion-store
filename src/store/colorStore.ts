import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { ColorData } from "@/types/color.types";

type SizeState = {
  colors: ColorData[];
  loading: boolean;
  error: Error | string | null;
  fetchColors: () => Promise<void>;
};

export const useColorStore = create<SizeState>((set) => ({
  colors: [],
  loading: false,
  error: null,

  fetchColors: async () => {
    set({ loading: true, error: null });
    try {
      const colorRef = collection(fireDB, "colors");
      const querySnapshot = await getDocs(colorRef);
      const colors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as ColorData),
      })) as ColorData[];

      set({ colors: colors, loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error : String(error),
      });
    }
  },
}));

import { FirebaseError } from "firebase/app";
import { collection, getDocs, query, where } from "firebase/firestore";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { GenderData } from "@/types/gender.types";
import { handleFirebaseError } from "@/utils/configFirebaseError";
import { formatDateTime } from "@/utils/formatDateTime";

type GenderState = {
  genders: GenderData[];
  loading: boolean;
  error: string | null;
  fetchGenders: () => Promise<boolean>;
};

export const useGenderStore = create<GenderState>((set) => ({
  genders: [],
  loading: false,
  error: null,

  fetchGenders: async () => {
    set({ loading: true, error: null });

    try {
      const gendersRef = collection(fireDB, "genders");

      const q = query(gendersRef, where("isActive", "==", true));
      const querySnapshot = await getDocs(q);

      const genders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as GenderData),
        createdAt: formatDateTime(doc.data().createdAt),
        updatedAt: formatDateTime(doc.data().updatedAt),
      })) as GenderData[];

      set({ genders, loading: false, error: null });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      handleFirebaseError(error as FirebaseError);
      return false;
    }
  },
}));

import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

import { fireDB } from "@/firebase/firebaseConfig";
import { CartItem } from "@/types/cart.types";

const CART_COLLECTION = "carts";

export const saveCartToFirestore = async (
  userId: string,
  items: CartItem[]
): Promise<void> => {
  try {
    const cartRef = doc(fireDB, CART_COLLECTION, userId);
    await setDoc(cartRef, { items, updatedAt: new Date() });
  } catch (error) {
    console.error("Error saving cart to Firestore:", error);
    throw error;
  }
};

export const loadCartFromFirestore = async (
  userId: string
): Promise<CartItem[]> => {
  try {
    const cartRef = doc(fireDB, CART_COLLECTION, userId);
    const cartDoc = await getDoc(cartRef);

    if (cartDoc.exists()) {
      const cartData = cartDoc.data();
      return cartData.items || [];
    }

    return [];
  } catch (error) {
    console.error("Error loading cart from Firestore:", error);
    return [];
  }
};

export const deleteCartFromFirestore = async (
  userId: string
): Promise<void> => {
  try {
    const cartRef = doc(fireDB, CART_COLLECTION, userId);
    await deleteDoc(cartRef);
  } catch (error) {
    console.error("Error deleting cart from Firestore:", error);
    throw error;
  }
};

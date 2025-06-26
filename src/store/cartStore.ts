import { useEffect } from "react";
import { create } from "zustand";

import { STORAGE_KEYS } from "@/constants";
import {
  loadCartFromFirestore,
  saveCartToFirestore,
} from "@/services/cartService";
import { createOrder } from "@/services/orderService";
import { CartItem } from "@/types/cart.types";
import { AddressData } from "@/types/order.types";
import { UserData } from "@/types/user.types";

import { useAuthStore } from "./authStore";

const getUserCartKey = (userId: string | null) =>
  userId
    ? `${STORAGE_KEYS.CART_ITEMS}_${userId}`
    : STORAGE_KEYS.CART_ITEMS_GUEST;

interface CartState {
  items: CartItem[];
  loading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItem: (itemId: string) => CartItem | undefined;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  createOrderFromCart: (
    user: UserData,
    shippingAddress: AddressData,
    paymentMethod: string
  ) => Promise<string>;
  loadCart: (userId: string | null) => void;
  saveCart: (userId: string | null) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: true,

  addItem: (newItem) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.color === newItem.color &&
          item.size === newItem.size
      );

      const updatedItems = [...state.items];
      if (existingItemIndex !== -1) {
        const existingItem = updatedItems[existingItemIndex];
        updatedItems.splice(existingItemIndex, 1);

        updatedItems.unshift({
          ...existingItem,
          quantity: existingItem.quantity + (newItem.quantity || 1),
          addedAt: new Date().toISOString(),
        });
      } else {
        updatedItems.unshift({
          ...newItem,
          quantity: newItem.quantity || 1,
          addedAt: new Date().toISOString(),
        });
      }

      setTimeout(() => {
        let userId: string | null = null;
        try {
          const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
          if (userData) {
            const user = JSON.parse(userData);
            userId = user.uid;
          }
        } catch (e) {
          console.error("Error getting user ID when saving cart:", e);
        }

        if (userId) {
          saveCartToFirestore(userId, updatedItems).catch((error) =>
            console.error("Error saving cart to Firestore:", error)
          );
        }
        const { saveCart } = get();
        saveCart(userId);
      }, 0);

      return { items: updatedItems };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== itemId);

      setTimeout(() => {
        let userId: string | null = null;
        try {
          const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
          if (userData) {
            const user = JSON.parse(userData);
            userId = user.uid;
          }
        } catch (e) {
          console.error("Error getting user ID when saving cart:", e);
        }

        if (userId) {
          saveCartToFirestore(userId, updatedItems).catch((error) =>
            console.error("Error saving cart to Firestore:", error)
          );
        }
        const { saveCart } = get();
        saveCart(userId);
      }, 0);

      return { items: updatedItems };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity < 1) return;

    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      setTimeout(() => {
        let userId: string | null = null;
        try {
          const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
          if (userData) {
            const user = JSON.parse(userData);
            userId = user.uid;
          }
        } catch (e) {
          console.error("Error getting user ID when saving cart:", e);
        }

        if (userId) {
          saveCartToFirestore(userId, updatedItems).catch((error) =>
            console.error("Error saving cart to Firestore:", error)
          );
        }
        const { saveCart } = get();
        saveCart(userId);
      }, 0);

      return { items: updatedItems };
    });
  },

  clearCart: () => {
    set({ items: [] });

    setTimeout(() => {
      let userId: string | null = null;
      try {
        const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.uid;
        }
      } catch (e) {
        console.error("Error getting user ID when clearing cart:", e);
      }

      if (userId) {
        saveCartToFirestore(userId, []).catch((error) =>
          console.error("Error saving cart to Firestore:", error)
        );
      }
      const { saveCart } = get();
      saveCart(userId);
    }, 0);
  },

  getItem: (itemId) => {
    return get().items.find((item) => item.id === itemId);
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      const price = item.sale_price || item.price;
      return total + price * item.quantity;
    }, 0);
  },

  createOrderFromCart: async (user, shippingAddress, paymentMethod) => {
    const { items, getTotalPrice, clearCart } = get();

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    const subtotal = getTotalPrice();
    const shippingCost = subtotal > 1000000 ? 0 : 30000;

    const orderId = await createOrder(
      user,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost
    );

    clearCart();

    return orderId;
  },

  loadCart: async (userId: string | null) => {
    set({ loading: true });

    const userStorageKey = getUserCartKey(userId);
    const guestStorageKey = STORAGE_KEYS.CART_ITEMS_GUEST;

    try {
      const guestCartData = localStorage.getItem(guestStorageKey);
      const guestCart = guestCartData ? JSON.parse(guestCartData) : {};

      const guestItems: CartItem[] = Array.isArray(guestCart.items)
        ? guestCart.items
        : [];

      let mergedCart: CartItem[] = [];

      if (userId) {
        console.log("Loading user cart from Firestore for userId:", userId);
        const firestoreCart = await loadCartFromFirestore(userId);
        console.log("Firestore cart loaded:", firestoreCart);
        console.log("Guest items to merge:", guestItems);

        const mergedItems = [...firestoreCart];

        for (const guestItem of guestItems) {
          const existingItemIndex = mergedItems.findIndex(
            (item) =>
              item.id === guestItem.id &&
              item.color === guestItem.color &&
              item.size === guestItem.size
          );

          if (existingItemIndex !== -1) {
            mergedItems[existingItemIndex].quantity += guestItem.quantity;
          } else {
            mergedItems.push(guestItem);
          }
        }

        mergedCart = mergedItems;

        localStorage.removeItem(guestStorageKey);

        console.log("Saving merged cart to Firestore:", mergedCart);
        await saveCartToFirestore(userId, mergedCart);
      } else {
        mergedCart = guestItems;
      }

      localStorage.setItem(
        userStorageKey,
        JSON.stringify({ items: mergedCart })
      );

      set({ items: mergedCart, loading: false });
      console.log("Cart loaded and set to state:", mergedCart);
    } catch (error) {
      console.error("Failed to load cart:", error);
      set({ items: [], loading: false });
    }
  },

  saveCart: (userId: string | null) => {
    const { items } = get();
    const storageKey = getUserCartKey(userId);

    try {
      localStorage.setItem(storageKey, JSON.stringify({ items }));
      if (userId) {
        saveCartToFirestore(userId, items).catch((error) =>
          console.error("Error saving cart to Firestore:", error)
        );
      }
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  },
}));

export const useCartUserSync = () => {
  const { user } = useAuthStore();
  const { loadCart } = useCartStore();

  useEffect(() => {
    loadCart(user?.uid || null);
  }, [user?.uid, loadCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.AUTH_USER) {
        try {
          if (e.newValue) {
            const userData = JSON.parse(e.newValue);
            loadCart(userData.uid);
          } else {
            loadCart(null);
          }
        } catch (error) {
          console.error("Error handling auth storage change:", error);
          loadCart(null);
        }
      }
    };

    const handleUserLogin = (e: CustomEvent) => {
      const userId = e.detail?.userId;
      if (userId) {
        loadCart(userId);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedIn", handleUserLogin as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "userLoggedIn",
        handleUserLogin as EventListener
      );
    };
  }, [loadCart]);
};

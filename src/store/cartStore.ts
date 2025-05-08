import { useEffect } from "react";
import { create } from "zustand";

import { STORAGE_KEYS } from "@/constants";
import {
  deleteCartFromFirestore,
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
  syncCartAcrossDevices: (userId: string) => Promise<void>;
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
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
        };
      } else {
        updatedItems.push({ ...newItem, quantity: newItem.quantity || 1 });
      }

      setTimeout(() => {
        const { saveCart } = get();

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

        saveCart(userId);
      }, 0);

      return { items: updatedItems };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== itemId);

      setTimeout(() => {
        const { saveCart } = get();
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
        const { saveCart } = get();
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
        saveCart(userId);
      }, 0);

      return { items: updatedItems };
    });
  },

  clearCart: () => {
    set({ items: [] });

    setTimeout(async () => {
      const { saveCart } = get();
      let userId: string | null = null;
      try {
        const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.uid;

          // Also delete from Firestore if user is logged in
          if (userId) {
            await deleteCartFromFirestore(userId);
          }
        }
      } catch (e) {
        console.error("Error getting user ID when clearing cart:", e);
      }
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

    try {
      let items: CartItem[] = [];

      if (userId) {
        try {
          items = await loadCartFromFirestore(userId);

          if (items.length === 0) {
            const localCart = JSON.parse(
              localStorage.getItem(getUserCartKey(userId)) || "{}"
            );

            if (Array.isArray(localCart.items) && localCart.items.length > 0) {
              items = localCart.items;

              saveCartToFirestore(userId, items).catch((err) =>
                console.error(
                  "Error syncing localStorage cart to Firestore:",
                  err
                )
              );
            }
          }
        } catch (error) {
          console.error("Failed to load cart from Firestore:", error);

          const localCart = JSON.parse(
            localStorage.getItem(getUserCartKey(userId)) || "{}"
          );

          if (Array.isArray(localCart.items)) {
            items = localCart.items;
          }
        }

        const guestCart = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.CART_ITEMS_GUEST) || "{}"
        );

        if (Array.isArray(guestCart.items) && guestCart.items.length > 0) {
          for (const guestItem of guestCart.items) {
            const index = items.findIndex(
              (item) =>
                item.id === guestItem.id &&
                item.color === guestItem.color &&
                item.size === guestItem.size
            );

            if (index !== -1) {
              items[index].quantity += guestItem.quantity;
            } else {
              items.push(guestItem);
            }
          }

          localStorage.removeItem(STORAGE_KEYS.CART_ITEMS_GUEST);

          if (items.length > 0) {
            saveCartToFirestore(userId, items).catch((err) =>
              console.error("Error saving merged cart to Firestore:", err)
            );
          }
        }
      } else {
        const guestCart = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.CART_ITEMS_GUEST) || "{}"
        );

        if (Array.isArray(guestCart.items)) {
          items = guestCart.items;
        }
      }

      set({ items, loading: false });

      const storageKey = getUserCartKey(userId);
      localStorage.setItem(storageKey, JSON.stringify({ items }));
    } catch (error) {
      console.error("Failed to load cart:", error);
      set({ items: [], loading: false });
    }
  },

  saveCart: async (userId: string | null) => {
    const { items } = get();
    const storageKey = getUserCartKey(userId);

    try {
      localStorage.setItem(storageKey, JSON.stringify({ items }));

      if (userId && items.length > 0) {
        await saveCartToFirestore(userId, items);
      }
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  },

  syncCartAcrossDevices: async (userId: string) => {
    if (!userId) return;

    try {
      set({ loading: true });

      const firestoreItems = await loadCartFromFirestore(userId);

      const localStorageKey = getUserCartKey(userId);
      const localCart = JSON.parse(
        localStorage.getItem(localStorageKey) || "{}"
      );
      const localItems = Array.isArray(localCart.items) ? localCart.items : [];

      let mergedItems = firestoreItems;

      if (firestoreItems.length === 0 && localItems.length > 0) {
        mergedItems = localItems;

        await saveCartToFirestore(userId, localItems);
      }

      set({ items: mergedItems, loading: false });
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ items: mergedItems })
      );
    } catch (error) {
      console.error("Failed to sync cart across devices:", error);
      set({ loading: false });
    }
  },
}));

export const useCartUserSync = () => {
  const { user } = useAuthStore();
  const { loadCart, syncCartAcrossDevices } = useCartStore();

  useEffect(() => {
    if (user?.uid) {
      syncCartAcrossDevices(user.uid);
    } else {
      loadCart(null);
    }
  }, [user?.uid, loadCart, syncCartAcrossDevices]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.AUTH_USER) {
        try {
          if (e.newValue) {
            const userData = JSON.parse(e.newValue);
            syncCartAcrossDevices(userData.uid);
          } else {
            loadCart(null);
          }
        } catch (error) {
          console.error("Error handling auth storage change:", error);
          loadCart(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadCart, syncCartAcrossDevices]);
};

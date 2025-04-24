import { useEffect } from "react";
import { create } from "zustand";

import { STORAGE_KEYS } from "@/constants";
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

  loadCart: (userId: string | null) => {
    set({ loading: true });

    const userStorageKey = getUserCartKey(userId);
    const guestStorageKey = STORAGE_KEYS.CART_ITEMS_GUEST;

    try {
      const userCart = JSON.parse(localStorage.getItem(userStorageKey) || "{}");
      const guestCart = JSON.parse(
        localStorage.getItem(guestStorageKey) || "{}"
      );

      const items: CartItem[] = Array.isArray(userCart.items)
        ? userCart.items
        : [];

      if (userId && Array.isArray(guestCart.items)) {
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

        localStorage.removeItem(guestStorageKey);
      }

      set({ items, loading: false });
      localStorage.setItem(userStorageKey, JSON.stringify({ items }));
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

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadCart]);
};

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

  addItem: (newItem: CartItem) => {
    set((state) => {
      let userId: string | null = null;
      try {
        const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.uid;
        }
      } catch (e) {
        console.error("Error getting user ID when adding item:", e);
      }

      const existingItemIndex = state.items.findIndex(
        (item: CartItem) =>
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

          ...(userId && { userId }),
        };
      } else {
        updatedItems.push({
          ...newItem,
          quantity: newItem.quantity || 1,
          ...(userId && { userId }),
        });
      }

      setTimeout(() => {
        const { saveCart } = get();
        saveCart(userId);
      }, 0);

      return { items: updatedItems };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const updatedItems = state.items.filter(
        (item: CartItem) => item.id !== itemId
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
          console.error("Error getting user ID when removing item:", e);
        }
        saveCart(userId);
      }, 0);

      return { items: updatedItems };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity < 1) return;

    set((state) => {
      let userId: string | null = null;
      try {
        const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.uid;
        }
      } catch (e) {
        console.error("Error getting user ID when updating quantity:", e);
      }

      const updatedItems = state.items.map((item: CartItem) =>
        item.id === itemId
          ? {
              ...item,
              quantity,

              ...(userId && { userId }),
            }
          : item
      );

      setTimeout(() => {
        const { saveCart } = get();
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
    return get().items.find((item: CartItem) => item.id === itemId);
  },

  getTotalItems: () => {
    return get().items.reduce(
      (total, item: CartItem) => total + item.quantity,
      0
    );
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item: CartItem) => {
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

          items = items.map((item: CartItem) => ({
            ...item,
            userId,
          }));

          if (items.length === 0) {
            const localCart = JSON.parse(
              localStorage.getItem(getUserCartKey(userId)) || "{}"
            );

            if (Array.isArray(localCart.items) && localCart.items.length > 0) {
              items = localCart.items.map((item: CartItem) => ({
                ...item,
                userId,
              }));

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
            items = localCart.items.map((item: CartItem) => ({
              ...item,
              userId,
            }));
          }
        }

        const guestCart = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.CART_ITEMS_GUEST) || "{}"
        );

        if (Array.isArray(guestCart.items) && guestCart.items.length > 0) {
          for (const guestItem of guestCart.items) {
            const index = items.findIndex(
              (item: CartItem) =>
                item.id === guestItem.id &&
                item.color === guestItem.color &&
                item.size === guestItem.size
            );

            if (index !== -1) {
              items[index].quantity += guestItem.quantity;
              items[index].userId = userId;
            } else {
              items.push({
                ...guestItem,
                userId,
              });
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

          items = items.map(({ userId: _, ...item }: CartItem) => item);
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

      const firestoreItemsWithUserId = firestoreItems.map((item: CartItem) => ({
        ...item,
        userId,
      }));

      const localStorageKey = getUserCartKey(userId);
      const localCart = JSON.parse(
        localStorage.getItem(localStorageKey) || "{}"
      );
      const localItems = Array.isArray(localCart.items) ? localCart.items : [];

      const localItemsWithUserId = localItems.map((item: CartItem) => ({
        ...item,
        userId,
      }));

      const mergedItems =
        firestoreItemsWithUserId.length > 0
          ? firestoreItemsWithUserId
          : localItemsWithUserId;

      if (
        firestoreItemsWithUserId.length === 0 &&
        localItemsWithUserId.length > 0
      ) {
        await saveCartToFirestore(userId, localItemsWithUserId);
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

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants";
import { createOrder } from "@/services/orderService";
import { CartItem } from "@/types/cart.types";
import { AddressData } from "@/types/order.types";
import { UserData } from "@/types/user.types";

interface CartState {
  items: CartItem[];
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
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.id === newItem.id &&
              item.color === newItem.color &&
              item.size === newItem.size
          );

          if (existingItemIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity:
                updatedItems[existingItemIndex].quantity +
                (newItem.quantity || 1),
            };

            return { items: updatedItems };
          } else {
            return {
              items: [
                ...state.items,
                { ...newItem, quantity: newItem.quantity || 1 },
              ],
            };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItem: (itemId) => {
        return get().items.find((item) => item.id === itemId);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      createOrderFromCart: async (user, shippingAddress, paymentMethod) => {
        const { items, getTotalPrice, clearCart } = get();

        if (items.length === 0) {
          throw new Error("Cart is empty");
        }

        const subtotal = getTotalPrice();

        const orderId = await createOrder(
          user,
          items,
          shippingAddress,
          paymentMethod,
          subtotal
        );

        clearCart();

        return orderId;
      },
    }),
    {
      name: STORAGE_KEYS.CART_ITEMS,
      partialize: (state) => ({ items: state.items }),
    }
  )
);

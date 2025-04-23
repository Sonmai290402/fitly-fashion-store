import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { OrderData, OrderStatus } from "@/types/order.types";

interface OrderState {
  orders: OrderData[];
  currentOrder: OrderData | null;
  loading: boolean;
  error: string | null;

  fetchUserOrders: (userId: string) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<OrderData | null>;
  fetchOrderByNumber: (orderNumber: string) => Promise<OrderData | null>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    comment?: string
  ) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  fetchUserOrders: async (userId) => {
    set({ loading: true, error: null });
    try {
      const ordersQuery = query(
        collection(fireDB, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(ordersQuery);
      const orderList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OrderData[];

      set({ orders: orderList, loading: false });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      set({ error: "Failed to fetch orders", loading: false });
    }
  },

  fetchOrderById: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const orderDoc = await getDoc(doc(fireDB, "orders", orderId));

      if (!orderDoc.exists()) {
        set({ loading: false, error: "Order not found" });
        return null;
      }

      const orderData = {
        id: orderDoc.id,
        ...orderDoc.data(),
      } as OrderData;

      set({ currentOrder: orderData, loading: false });
      return orderData;
    } catch (error) {
      console.error("Error fetching order:", error);
      set({ error: "Failed to fetch order", loading: false });
      return null;
    }
  },

  fetchOrderByNumber: async (orderNumber) => {
    set({ loading: true, error: null });
    try {
      const orderQuery = query(
        collection(fireDB, "orders"),
        where("orderNumber", "==", orderNumber)
      );

      const snapshot = await getDocs(orderQuery);

      if (snapshot.empty) {
        set({ loading: false, error: "Order not found" });
        return null;
      }

      const orderData = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as OrderData;

      set({ currentOrder: orderData, loading: false });
      return orderData;
    } catch (error) {
      console.error("Error fetching order by number:", error);
      set({ error: "Failed to fetch order", loading: false });
      return null;
    }
  },

  updateOrderStatus: async (orderId, status, comment) => {
    set({ loading: true, error: null });
    try {
      const orderRef = doc(fireDB, "orders", orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        set({ loading: false, error: "Order not found" });
        return;
      }

      const orderData = orderDoc.data() as OrderData;
      const statusHistory = [
        ...orderData.statusHistory,
        {
          status,
          timestamp: new Date().toISOString(),
          comment: comment || `Order status updated to ${status}`,
        },
      ];

      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
        statusHistory,
      });

      const { orders, currentOrder } = get();
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status, statusHistory } : order
      );

      set({
        orders: updatedOrders,
        currentOrder:
          currentOrder?.id === orderId
            ? { ...currentOrder, status, statusHistory }
            : currentOrder,
        loading: false,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      set({ error: "Failed to update order status", loading: false });
    }
  },
}));

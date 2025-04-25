import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { OrderData, OrderStatus } from "@/types/order.types";
import { getTimestampMillis } from "@/utils/getTimestampMillis";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "status";

type DateFilterOption = "all" | "today" | "yesterday" | "week" | "month";

interface AdminOrderState {
  orders: OrderData[];
  filteredOrders: OrderData[];
  currentOrder: OrderData | null;
  loading: boolean;
  error: string | null;

  statusFilter: OrderStatus | "all";
  dateFilter: DateFilterOption;
  searchQuery: string;
  sortBy: SortOption;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;

  fetchAllOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<OrderData | null>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    comment?: string
  ) => Promise<void>;
  updateOrder: (
    orderId: string,
    orderData: Partial<OrderData>
  ) => Promise<void>;

  setStatusFilter: (status: OrderStatus | "all") => void;
  setDateFilter: (dateFilter: DateFilterOption) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortOption: SortOption) => void;
  setCurrentPage: (page: number) => void;
}

export const useAdminOrderStore = create<AdminOrderState>((set, get) => ({
  orders: [],
  filteredOrders: [],
  currentOrder: null,
  loading: false,
  error: null,

  statusFilter: "all",
  dateFilter: "all",
  searchQuery: "",
  sortBy: "date-desc",
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 1,

  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const ordersQuery = query(
        collection(fireDB, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(ordersQuery);
      const orderList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OrderData[];

      set((state) => {
        const filtered = applyFilters(
          orderList,
          state.statusFilter,
          state.dateFilter,
          state.searchQuery,
          state.sortBy
        );

        const totalPages = Math.max(
          1,
          Math.ceil(filtered.length / state.itemsPerPage)
        );

        return {
          orders: orderList,
          filteredOrders: filtered,
          totalPages,
          loading: false,
          currentPage: Math.min(state.currentPage, totalPages),
        };
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
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
        order.id === orderId
          ? {
              ...order,
              status,
              statusHistory,
              updatedAt: new Date().toISOString(),
            }
          : order
      );

      const { statusFilter, dateFilter, searchQuery, sortBy, itemsPerPage } =
        get();
      const filteredOrders = applyFilters(
        updatedOrders,
        statusFilter,
        dateFilter,
        searchQuery,
        sortBy
      );
      const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / itemsPerPage)
      );

      set({
        orders: updatedOrders,
        filteredOrders,
        totalPages,
        currentOrder:
          currentOrder?.id === orderId
            ? {
                ...currentOrder,
                status,
                statusHistory,
                updatedAt: new Date().toISOString(),
              }
            : currentOrder,
        loading: false,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      set({ error: "Failed to update order status", loading: false });
    }
  },

  updateOrder: async (orderId, orderData) => {
    set({ loading: true, error: null });
    try {
      const orderRef = doc(fireDB, "orders", orderId);
      await updateDoc(orderRef, {
        ...orderData,
        updatedAt: serverTimestamp(),
      });

      const { orders, currentOrder } = get();
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              ...orderData,
              updatedAt: new Date().toISOString(),
            }
          : order
      );

      const { statusFilter, dateFilter, searchQuery, sortBy, itemsPerPage } =
        get();
      const filteredOrders = applyFilters(
        updatedOrders,
        statusFilter,
        dateFilter,
        searchQuery,
        sortBy
      );
      const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / itemsPerPage)
      );

      set({
        orders: updatedOrders,
        filteredOrders,
        totalPages,
        currentOrder:
          currentOrder?.id === orderId
            ? {
                ...currentOrder,
                ...orderData,
                updatedAt: new Date().toISOString(),
              }
            : currentOrder,
        loading: false,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      set({ error: "Failed to update order", loading: false });
    }
  },

  setStatusFilter: (status) => {
    set((state) => {
      const filteredOrders = applyFilters(
        state.orders,
        status,
        state.dateFilter,
        state.searchQuery,
        state.sortBy
      );
      const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / state.itemsPerPage)
      );

      return {
        statusFilter: status,
        filteredOrders,
        totalPages,
        currentPage: 1,
      };
    });
  },

  setDateFilter: (dateFilter) => {
    set((state) => {
      const filteredOrders = applyFilters(
        state.orders,
        state.statusFilter,
        dateFilter,
        state.searchQuery,
        state.sortBy
      );
      const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / state.itemsPerPage)
      );

      return {
        dateFilter,
        filteredOrders,
        totalPages,
        currentPage: 1,
      };
    });
  },

  setSearchQuery: (query) => {
    set((state) => {
      const filteredOrders = applyFilters(
        state.orders,
        state.statusFilter,
        state.dateFilter,
        query,
        state.sortBy
      );
      const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / state.itemsPerPage)
      );

      return {
        searchQuery: query,
        filteredOrders,
        totalPages,
        currentPage: 1,
      };
    });
  },

  setSortBy: (sortOption) => {
    set((state) => {
      const filteredOrders = applyFilters(
        state.orders,
        state.statusFilter,
        state.dateFilter,
        state.searchQuery,
        sortOption
      );

      return {
        sortBy: sortOption,
        filteredOrders,
      };
    });
  },

  setCurrentPage: (page) => {
    set((state) => ({
      currentPage: Math.min(Math.max(1, page), state.totalPages),
    }));
  },
}));

const applyFilters = (
  orders: OrderData[],
  statusFilter: OrderStatus | "all",
  dateFilter: DateFilterOption,
  searchQuery: string,
  sortBy: SortOption
): OrderData[] => {
  let result = [...orders];

  if (statusFilter !== "all") {
    result = result.filter((order) => order.status === statusFilter);
  }

  if (dateFilter !== "all") {
    const now = new Date();
    const startDate = new Date();

    if (dateFilter === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "yesterday") {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
    } else if (dateFilter === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (dateFilter === "month") {
      startDate.setMonth(now.getMonth() - 1);
    }

    const startMillis = startDate.getTime();
    const endMillis = now.getTime();

    result = result.filter((order) => {
      const createdAtMillis = getTimestampMillis(order.createdAt as string);
      return createdAtMillis >= startMillis && createdAtMillis <= endMillis;
    });
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.shippingAddress.fullName.toLowerCase().includes(query) ||
        order.items.some((item) => item.title.toLowerCase().includes(query))
    );
  }

  if (sortBy === "date-desc") {
    result.sort((a, b) => {
      const dateA = getTimestampMillis(a.createdAt as string);
      const dateB = getTimestampMillis(b.createdAt as string);
      return dateB - dateA;
    });
  } else if (sortBy === "date-asc") {
    result.sort((a, b) => {
      const dateA = getTimestampMillis(a.createdAt as string);
      const dateB = getTimestampMillis(b.createdAt as string);
      return dateA - dateB;
    });
  } else if (sortBy === "amount-desc") {
    result.sort((a, b) => b.total - a.total);
  } else if (sortBy === "amount-asc") {
    result.sort((a, b) => a.total - b.total);
  } else if (sortBy === "status") {
    result.sort((a, b) => {
      const statusOrder = {
        pending: 0,
        processing: 1,
        shipped: 2,
        delivered: 3,
        cancelled: 4,
      };
      return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
    });
  }

  return result;
};

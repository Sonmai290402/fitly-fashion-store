import {
  collection,
  FieldValue,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import {
  ChartDataPoint,
  DashboardStats,
  SalesDataPoint,
  TopProductData,
  UserGrowthData,
} from "@/modules/admin/Dashboard/types";
import { OrderData, OrderStatus } from "@/types/order.types";
import { ProductData } from "@/types/product.types";

// Color palette for charts
export const DASHBOARD_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
];

interface DashboardState {
  loading: boolean;
  stats: DashboardStats;
  recentOrders: OrderData[];
  salesData: SalesDataPoint[];
  statusDistribution: ChartDataPoint[];
  topProducts: TopProductData[];
  revenueByCategory: ChartDataPoint[];
  userGrowth: UserGrowthData[];
  fetchDashboardData: () => Promise<void>;
}

type FirestoreTimestamp =
  | Timestamp
  | { seconds: number; nanoseconds: number }
  | { toDate: () => Date }
  | string
  | FieldValue;

const getDateFromTimestamp = (timestamp: FirestoreTimestamp): Date => {
  if (!timestamp) return new Date();

  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }

  // Check for Firestore server timestamp object structure
  if (
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    "nanoseconds" in timestamp
  ) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }

  // Check for objects with toDate method
  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    return timestamp.toDate();
  }

  // Fallback to regular Date parsing if it's a string
  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }

  // Default fallback
  return new Date();
};

const useDashboardStore = create<DashboardState>((set) => ({
  loading: true,
  stats: {
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  },
  recentOrders: [],
  salesData: [],
  statusDistribution: [],
  topProducts: [],
  revenueByCategory: [],
  userGrowth: [],

  fetchDashboardData: async () => {
    set({ loading: true });

    try {
      // Fetch counts
      const ordersCount = await getCountFromServer(
        collection(fireDB, "orders")
      );
      const productsCount = await getCountFromServer(
        collection(fireDB, "products")
      );
      const usersCount = await getCountFromServer(collection(fireDB, "users"));

      // Recent orders
      const recentOrdersQuery = query(
        collection(fireDB, "orders"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
      const recentOrdersData = recentOrdersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OrderData[];

      // Calculate total revenue and average order value
      const allOrdersQuery = query(
        collection(fireDB, "orders"),
        where("status", "!=", "cancelled")
      );
      const allOrdersSnapshot = await getDocs(allOrdersQuery);
      const allOrdersData = allOrdersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OrderData[];

      const totalRevenue = allOrdersData.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const averageOrderValue =
        allOrdersData.length > 0 ? totalRevenue / allOrdersData.length : 0;

      // Order status distribution
      const statusCounts: Record<OrderStatus, number> = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      allOrdersData.forEach((order) => {
        if (statusCounts[order.status] !== undefined) {
          statusCounts[order.status]++;
        }
      });

      const statusDistributionData = Object.entries(statusCounts).map(
        ([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
        })
      );

      // Sales data by date (last 7 days)
      const last7Days: Date[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();

      const salesByDate = last7Days.map((date) => {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const ordersOnDate = allOrdersData.filter((order) => {
          // Use helper function to safely convert createdAt to a Date object
          const orderDate = getDateFromTimestamp(order.createdAt);
          return orderDate >= date && orderDate < nextDay;
        });

        const revenue = ordersOnDate.reduce(
          (sum, order) => sum + order.total,
          0
        );
        const orders = ordersOnDate.length;

        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue,
          orders,
        };
      });

      // Top selling products
      const productSales: Record<
        string,
        { count: number; title: string; revenue: number }
      > = {};

      allOrdersData.forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              count: 0,
              title: item.title,
              revenue: 0,
            };
          }
          productSales[item.productId].count += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        });
      });

      const topSellingProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          id,
          title: data.title,
          count: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Revenue by category
      const productsQuery = query(collection(fireDB, "products"));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductData[];

      // Create a map of productId -> category
      const productCategories: Record<string, string> = {};
      productsData.forEach((product) => {
        productCategories[product.id as string] = product.category;
      });

      // Revenue by category
      const categoryRevenue: Record<string, number> = {};

      allOrdersData.forEach((order) => {
        order.items.forEach((item) => {
          const category = productCategories[item.productId] || "Unknown";

          if (!categoryRevenue[category]) {
            categoryRevenue[category] = 0;
          }
          categoryRevenue[category] += item.price * item.quantity;
        });
      });

      const revenueByCategoryData = Object.entries(categoryRevenue)
        .map(([category, revenue]) => ({
          name: category,
          value: revenue,
        }))
        .sort((a, b) => b.value - a.value);

      // User growth data (simulated for past 6 months)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleDateString("en-US", { month: "short" });
      }).reverse();

      const userGrowthData = last6Months.map((month, index) => ({
        month,
        users: Math.round((index + 1) * (usersCount.data().count / 6)),
      }));

      // Update state with all collected data
      set({
        loading: false,
        stats: {
          totalOrders: ordersCount.data().count,
          totalProducts: productsCount.data().count,
          totalUsers: usersCount.data().count,
          totalRevenue,
          averageOrderValue,
        },
        recentOrders: recentOrdersData,
        salesData: salesByDate,
        statusDistribution: statusDistributionData,
        topProducts: topSellingProducts,
        revenueByCategory: revenueByCategoryData,
        userGrowth: userGrowthData,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      set({ loading: false });
    }
  },
}));

export default useDashboardStore;

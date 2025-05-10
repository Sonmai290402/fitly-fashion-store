import {
  collection,
  FieldValue,
  getCountFromServer,
  getDocs,
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
} from "@/types/dashboard.types";
import { OrderData } from "@/types/order.types";
import { ProductData } from "@/types/product.types";

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
  salesData: SalesDataPoint[];
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

  if (
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    "nanoseconds" in timestamp
  ) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }

  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    return timestamp.toDate();
  }

  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }

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
  salesData: [],
  topProducts: [],
  revenueByCategory: [],
  userGrowth: [],

  fetchDashboardData: async () => {
    set({ loading: true });

    try {
      const ordersCount = await getCountFromServer(
        collection(fireDB, "orders")
      );
      const productsCount = await getCountFromServer(
        collection(fireDB, "products")
      );
      const usersCount = await getCountFromServer(collection(fireDB, "users"));

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

      const productsQuery = query(collection(fireDB, "products"));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductData[];

      const productCategories: Record<string, string> = {};
      productsData.forEach((product) => {
        productCategories[product.id as string] = product.category;
      });

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

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleDateString("en-US", { month: "short" });
      }).reverse();

      const userGrowthData = last6Months.map((month, index) => ({
        month,
        users: Math.round((index + 1) * (usersCount.data().count / 6)),
      }));

      set({
        loading: false,
        stats: {
          totalOrders: ordersCount.data().count,
          totalProducts: productsCount.data().count,
          totalUsers: usersCount.data().count,
          totalRevenue,
          averageOrderValue,
        },
        salesData: salesByDate,
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

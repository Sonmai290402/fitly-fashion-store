import { ProductData } from "./product.types";

export interface RevenueDataPoint {
  name: string;
  revenue: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
}

export interface TopProductData {
  id: string;
  name: string;
  image: string | null;
  quantity: number;
  revenue: number;
  price: number;
  category: string;
}

export interface OrderStatusData {
  [key: string]: number;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  newCustomers: number;
  customersChange: number;
  aov: number;
  aovChange: number;
  revenueData: RevenueDataPoint[];
  categoryData: CategoryDataPoint[];
  ordersByStatus: OrderStatusData;
  topProducts: TopProductData[];
  lowStockProducts: ProductData[];
}

import { ProductData } from "./product.types";

// Interfaces for data points and charts
export interface RevenueDataPoint {
  name: string;
  revenue: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface UserGrowthData {
  month: string;
  users: number;
}

// Interfaces for product data
export interface TopProductData {
  id: string;
  name?: string;
  title?: string;
  image?: string | null;
  count?: number;
  quantity?: number;
  revenue: number;
  price?: number;
  category?: string;
}

export interface OrderStatusData {
  [key: string]: number;
}

// Interface for dashboard statistics
export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
  revenueChange?: number;
  ordersChange?: number;
  newCustomers?: number;
  customersChange?: number;
  aov?: number;
  aovChange?: number;
  revenueData?: RevenueDataPoint[];
  categoryData?: CategoryDataPoint[];
  ordersByStatus?: OrderStatusData;
  topProducts?: TopProductData[];
  lowStockProducts?: ProductData[];
}

// Interface for UI component props
export interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
}

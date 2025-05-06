import { OrderStatus } from "@/types/order.types";

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface TopProductData {
  id: string;
  title: string;
  count: number;
  revenue: number;
}

export interface UserGrowthData {
  month: string;
  users: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
}

export interface OrderStatusBadgeProps {
  status: OrderStatus;
}

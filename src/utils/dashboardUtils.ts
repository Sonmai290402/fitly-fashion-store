import {
  CategoryDataPoint,
  RevenueDataPoint,
  TopProductData,
} from "@/types/dashboard.types";
import { OrderData } from "@/types/order.types";
import { ProductData } from "@/types/product.types";

export function getPeriodStart(date: Date, period: string): Date {
  const result = new Date(date);
  switch (period) {
    case "today":
      result.setHours(0, 0, 0, 0);
      break;
    case "week":
      result.setDate(result.getDate() - 7);
      break;
    case "month":
      result.setDate(result.getDate() - 30);
      break;
    case "year":
      result.setDate(result.getDate() - 365);
      break;
    default:
      result.setHours(0, 0, 0, 0);
  }
  return result;
}

export function calculateTotalRevenue(orders: OrderData[]): number {
  return orders.reduce((total, order) => total + (order.total || 0), 0);
}

export function calculateAOV(orders: OrderData[]): number {
  if (orders.length === 0) return 0;
  const total = calculateTotalRevenue(orders);
  return total / orders.length;
}

export function getOrdersByStatus(orders: OrderData[]): Record<string, number> {
  const statusCount: Record<string, number> = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  orders.forEach((order) => {
    if (statusCount[order.status] !== undefined) {
      statusCount[order.status]++;
    }
  });

  return statusCount;
}

export function getRevenueData(
  orders: OrderData[],
  days: number = 7
): RevenueDataPoint[] {
  const today = new Date();
  const data: RevenueDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayStr = date.toISOString().split("T")[0];
    const dayOrders = orders.filter((order) => {
      let orderDate: Date | null = null;
      if (
        typeof order.createdAt === "string" ||
        order.createdAt instanceof Date
      ) {
        orderDate = new Date(order.createdAt);
      }

      return orderDate && orderDate.toISOString().split("T")[0] === dayStr;
    });

    const revenue = calculateTotalRevenue(dayOrders);
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    data.push({
      name: formattedDate,
      revenue: revenue,
    });
  }

  return data;
}

export function getLowStockProducts(
  products: ProductData[],
  threshold: number = 10
): ProductData[] {
  return products
    .filter((product) => (product.totalStock || 0) < threshold)
    .sort((a, b) => (a.totalStock || 0) - (b.totalStock || 0));
}

export function getTopProducts(
  orders: OrderData[],
  products: ProductData[],
  limit: number = 5
): TopProductData[] {
  const productSales: Record<
    string,
    { id: string; quantity: number; revenue: number }
  > = {};

  orders.forEach((order) => {
    if (!order.items) return;

    order.items.forEach((item) => {
      const productId = item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          id: productId,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += item.price * item.quantity;
    });
  });

  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((sale) => {
      const product = products.find((p) => p.id === sale.id);
      return {
        id: sale.id,
        name: product?.title || "Unknown Product",
        image: product?.image || null,
        price: product?.price || 0,
        quantity: sale.quantity,
        revenue: sale.revenue,
        category: product?.category || "Uncategorized",
      };
    });
}

export function getSalesByCategory(
  orders: OrderData[],
  products: ProductData[]
): CategoryDataPoint[] {
  const categorySales: Record<string, number> = {};

  orders.forEach((order) => {
    if (!order.items) return;

    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const category = product.category || "Uncategorized";
        if (!categorySales[category]) {
          categorySales[category] = 0;
        }
        categorySales[category] += item.quantity;
      }
    });
  });

  return Object.entries(categorySales)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

import { OrderStatus } from "@/types/order.types";

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "success" | "outline";
    description: string;
  }
> = {
  pending: {
    label: "Pending",
    variant: "secondary",
    description: "Payment received, order not yet processed",
  },
  processing: {
    label: "Processing",
    variant: "default",
    description: "Order is being prepared for shipment",
  },
  shipped: {
    label: "Shipped",
    variant: "default",
    description: "Order has been shipped and is on its way",
  },
  delivered: {
    label: "Delivered",
    variant: "success",
    description: "Order has been delivered to the customer",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    description: "Order has been canceled",
  },
};

export function isStatusTransitionAllowed(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

export function getAvailableNextStatuses(
  currentStatus: OrderStatus
): OrderStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus];
}
